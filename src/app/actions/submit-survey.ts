"use server";

import {
  formatSurveyDate,
  formatSurveyTime,
  resolveProjectNeed,
  surveySchema,
} from "@/lib/schemas/survey";

export type SurveyActionResult =
  | { status: "success" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string> };

/**
 * Receives a survey lead.
 *
 * Re-validates everything server-side (never trusting the browser), then
 * forwards the lead to `LEAD_WEBHOOK_URL` when one is configured. Without a
 * webhook the submission still succeeds: the form hands the visitor straight
 * to WhatsApp, which is the channel the studio actually works from.
 *
 * Text only - the form takes no uploads. Room photos are asked for in the
 * WhatsApp conversation instead, so nothing is ever written to disk here.
 */
export async function submitSurvey(
  formData: FormData
): Promise<SurveyActionResult> {
  const raw = {
    projectType: formData.get("projectType"),
    projectTypeOther: formData.get("projectTypeOther") ?? "",
    province: formData.get("province"),
    city: formData.get("city"),
    district: formData.get("district") ?? "",
    address: formData.get("address"),
    propertyType: formData.get("propertyType"),
    targetTimeline: formData.get("targetTimeline"),
    budgetRange: formData.get("budgetRange") || undefined,
    notes: formData.get("notes") ?? "",
    name: formData.get("name"),
    whatsapp: formData.get("whatsapp"),
    emergencyPhone: formData.get("emergencyPhone") ?? "",
    surveyDate: formData.get("surveyDate"),
    surveyTime: formData.get("surveyTime"),
    consent: formData.get("consent") === "true",
  };

  const parsed = surveySchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return {
      status: "error",
      message: "Beberapa isian belum sesuai. Mohon periksa kembali.",
      fieldErrors,
    };
  }

  const webhook = process.env.LEAD_WEBHOOK_URL;

  if (webhook) {
    try {
      const response = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...parsed.data,
          // Pre-resolved so a webhook consumer never has to re-implement the
          // "Lainnya" fallback or the Indonesian date formatting.
          need: resolveProjectNeed(parsed.data),
          scheduleLabel: `${formatSurveyDate(parsed.data.surveyDate)}, ${formatSurveyTime(parsed.data.surveyTime)}`,
          submittedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        return {
          status: "error",
          message:
            "Data gagal terkirim ke sistem kami. Silakan coba lagi atau hubungi kami langsung via WhatsApp.",
        };
      }
    } catch {
      return {
        status: "error",
        message:
          "Koneksi ke sistem kami terputus. Silakan coba lagi atau hubungi kami langsung via WhatsApp.",
      };
    }
  }

  return { status: "success" };
}
