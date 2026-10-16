import type { AnalyticsEvent } from "./analytics-events";
/** Observes only explicit public actions; never reads form values or delays navigation. */
export function listenPublicFunnel(
  track: (name: AnalyticsEvent, input: Record<string, unknown>) => void,
) {
  const clicked = (event: MouseEvent) => {
    if (!(event.target instanceof Element)) return;
    const link = event.target.closest("a");
    if (link?.dataset.officialApply === "true")
      track("outbound_apply", { page_family: "job-detail" });
    if (link?.dataset.signupPrompt === "true")
      track("signup_prompt_click", { page_family: "discovery" });
  };
  const searched = (event: Event) => {
    if (
      event.target instanceof HTMLFormElement &&
      event.target.dataset.publicSearch === "true"
    )
      track("search_submit", { page_family: "home" });
  };
  document.addEventListener("click", clicked, true);
  document.addEventListener("submit", searched, true);
  return () => {
    document.removeEventListener("click", clicked, true);
    document.removeEventListener("submit", searched, true);
  };
}
