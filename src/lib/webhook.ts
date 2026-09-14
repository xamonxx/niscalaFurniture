import crypto from "node:crypto";

const TIMEOUT_MS = 8000;
/** First attempt plus this many retries = 3 tries total. */
const MAX_RETRIES = 2;

export type WebhookResult = { ok: true } | { ok: false; error: string };

/**
 * Posts a JSON payload to an operator-configured lead webhook (Zapier, Make,
 * n8n, a Google Apps Script endpoint...) with the hygiene a bare `fetch` was
 * missing:
 *
 * - HTTPS is enforced. The URL itself is only ever set by whoever runs this
 *   site (`LEAD_WEBHOOK_URL`), not user input, but a misconfigured plain-HTTP
 *   value would still put real names, phone numbers and addresses on the
 *   wire in clear text - worth refusing outright rather than trusting it was
 *   typed correctly.
 * - An HMAC-SHA256 signature (`X-Niscala-Signature`, when
 *   `LEAD_WEBHOOK_SECRET` is set) lets the receiver confirm a request
 *   actually came from this app rather than a guess against its endpoint
 *   URL. Optional and additive: a receiver that does not check it is no
 *   worse off than before.
 * - A timeout stops a slow or unreachable receiver from hanging the request
 *   that triggered it.
 * - A couple of retries with backoff absorb the one-off network blip a
 *   shared host's outbound connection hits, instead of losing a lead or a
 *   review notification to it.
 */
export async function postToWebhook(
  url: string,
  payload: Record<string, unknown>
): Promise<WebhookResult> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { ok: false, error: "LEAD_WEBHOOK_URL is not a valid URL" };
  }
  if (parsed.protocol !== "https:") {
    return { ok: false, error: "LEAD_WEBHOOK_URL must use https://" };
  }

  const body = JSON.stringify(payload);
  const secret = process.env.LEAD_WEBHOOK_SECRET;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (secret) {
    headers["X-Niscala-Signature"] = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");
  }

  let lastError = "Unknown error";

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(parsed, {
        method: "POST",
        headers,
        body,
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (response.ok) return { ok: true };
      lastError = `Webhook responded ${response.status}`;
    } catch (error) {
      clearTimeout(timer);
      lastError =
        error instanceof Error && error.name === "AbortError"
          ? `Webhook timed out after ${TIMEOUT_MS}ms`
          : error instanceof Error
            ? error.message
            : "Unknown network error";
    }

    if (attempt < MAX_RETRIES) {
      await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** attempt));
    }
  }

  return { ok: false, error: lastError };
}
