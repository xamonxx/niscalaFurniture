/**
 * Analytics event surface (pasal 29).
 *
 * No vendor is wired up. Components call `track()`; swapping in GA4, Plausible,
 * Umami or a server endpoint later means editing only `dispatch` below, not the
 * thirty call sites.
 */

export type AnalyticsEvent =
  | "hero_consultation_click"
  | "hero_portfolio_click"
  | "portfolio_open"
  | "service_open"
  | "knowledge_open"
  | "process_cta_click"
  | "whatsapp_click"
  | "survey_start"
  | "survey_step_complete"
  | "survey_submit"
  | "faq_open"
  | "final_cta_click"
  | "social_click";

export type AnalyticsPayload = Record<string, string | number | boolean>;

type Dispatcher = (event: AnalyticsEvent, payload?: AnalyticsPayload) => void;

/**
 * The active sink. `setAnalyticsDispatcher` lets a provider component install a
 * real implementation without any component importing the vendor SDK.
 */
let dispatch: Dispatcher | null = null;

export function setAnalyticsDispatcher(next: Dispatcher | null): void {
  dispatch = next;
}

export function track(
  event: AnalyticsEvent,
  payload?: AnalyticsPayload
): void {
  if (typeof window === "undefined") return;
  dispatch?.(event, payload);
}
