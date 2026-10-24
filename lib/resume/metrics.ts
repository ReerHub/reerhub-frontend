export const METRICS_KEY = "reerhub-resume-usage-consent-v1";
export type MetricEvent =
  | "builder_started"
  | "pdf_downloaded"
  | "resume_saved"
  | "ai_suggestion_received";
export function recordMetric(event: MetricEvent) {
  try {
    if (localStorage.getItem(METRICS_KEY) !== "yes") return;
    void fetch("/api/v1/resumes/events", {
      method: "POST",
      credentials: "omit",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* Optional measurement must never interrupt editing. */
  }
}
