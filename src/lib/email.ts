import nodemailer from "nodemailer";
import type { PublicReview } from "@/lib/reviews";
import { postToWebhook } from "@/lib/webhook";

const TARGET_EMAIL = process.env.REVIEW_NOTIFICATION_EMAIL || "info@niscalafurniture.com";

/**
 * Sends an email notification to info@niscalafurniture.com when a new public review is submitted.
 *
 * If SMTP credentials (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS) are provided in .env.local,
 * it sends via nodemailer. If not configured, it safely logs to server console and does not crash.
 */
export async function sendReviewEmailNotification(
  review: PublicReview
): Promise<{ sent: boolean; message?: string }> {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user || `Niscala Website <noreply@niscalafurniture.com>`;

  const stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);

  const plainText = [
    `ULASAN / SARAN BARU DITERIMA`,
    `=============================`,
    `Nama Pengulas : ${review.author}`,
    `Alamat / Kota : ${review.address}`,
    `Email Kontak  : ${review.email || "-" } (Data Developer / Private)`,
    `Rating        : ${review.rating} / 5 Bintang (${stars})`,
    `Waktu         : ${new Date(review.createdAt).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}`,
    ``,
    `Isi Ulasan / Saran & Kritik:`,
    `-----------------------------`,
    review.description,
    ``,
    `=============================`,
    `ID Ulasan: ${review.id}`,
  ].join("\n");

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111; line-height: 1.5; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #0b0b0b; color: #ffffff; padding: 20px 24px;">
        <h2 style="margin: 0; font-size: 20px;">Ulasan / Saran Baru Masuk</h2>
        <p style="margin: 4px 0 0 0; font-size: 13px; color: #d4a373;">Niscala Furniture Website</p>
      </div>
      <div style="padding: 24px;">
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 8px 0; color: #666; width: 130px; font-size: 14px;">Nama:</td>
            <td style="padding: 8px 0; font-weight: bold; font-size: 14px;">${review.author}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px;">Alamat / Lokasi:</td>
            <td style="padding: 8px 0; font-size: 14px;">${review.address}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px;">Alamat Email:</td>
            <td style="padding: 8px 0; font-size: 14px; font-weight: 500; color: #0066cc;">${review.email || "-"} <span style="font-size: 11px; color: #888;">(Private / Data Developer)</span></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px;">Rating:</td>
            <td style="padding: 8px 0; font-size: 16px; color: #d4a373; font-weight: bold;">
              ${stars} (${review.rating}/5)
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-size: 14px;">Waktu:</td>
            <td style="padding: 8px 0; font-size: 13px; color: #888;">${new Date(review.createdAt).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}</td>
          </tr>
        </table>

        <div style="background-color: #f7f7f7; border-left: 4px solid #d4a373; padding: 16px; border-radius: 4px; margin-top: 10px;">
          <h4 style="margin: 0 0 8px 0; font-size: 13px; text-transform: uppercase; color: #555; letter-spacing: 0.5px;">Saran, Kritik, atau Ulasan:</h4>
          <p style="margin: 0; font-size: 14px; white-space: pre-wrap; color: #222;">${review.description}</p>
        </div>
      </div>
      <div style="background-color: #fafafa; padding: 14px 24px; font-size: 11px; color: #888; border-top: 1px solid #eaeaea;">
        Email ini dikirim otomatis oleh formulir ulasan publik website Niscala Furniture ke ${TARGET_EMAIL}.
      </div>
    </div>
  `;

  // 1. Try sending via SMTP if configured
  if (host && user && pass) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });

      await transporter.sendMail({
        from,
        to: TARGET_EMAIL,
        replyTo: review.email || undefined,
        subject: `[Ulasan Baru] ${review.rating}★ dari ${review.author} (${review.address})`,
        text: plainText,
        html: htmlContent,
      });

      console.log(`[reviews] Email notification sent successfully to ${TARGET_EMAIL}`);
      return { sent: true };
    } catch (error) {
      console.error("[reviews] Failed to send email via SMTP:", error);
    }
  } else {
    console.log(
      `[reviews] SMTP not configured. Prepared notification for ${TARGET_EMAIL}:\n` +
      `Review from: ${review.author} <${review.email}> | Rating: ${review.rating}/5`
    );
  }

  // 2. Forward to LEAD_WEBHOOK_URL if available
  const webhook = process.env.LEAD_WEBHOOK_URL;
  if (webhook) {
    const result = await postToWebhook(webhook, {
      type: "public_review",
      ...review,
      sentToEmail: TARGET_EMAIL,
    });
    if (!result.ok) {
      // Logged, not thrown: a broken webhook must never turn a successfully
      // saved review into a failed submission for the visitor.
      console.error("[reviews] Webhook forward error:", result.error);
    }
  }

  return { sent: false, message: "SMTP credentials not configured" };
}
