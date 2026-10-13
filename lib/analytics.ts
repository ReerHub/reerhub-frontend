import { analyticsConsent } from "./consent";
import { safeAnalyticsEvent, type AnalyticsEvent } from "./analytics-events";
let frame: HTMLIFrameElement | undefined;
let ready = false;
let queued: ReturnType<typeof safeAnalyticsEvent>[] = [];
const delivered = new Set<string>();
const DEDUPE_KEY = "reerhub-analytics-events-v1";
function alreadyDelivered(key: string) {
  try {
    const keys = JSON.parse(sessionStorage.getItem(DEDUPE_KEY) || "[]");
    if (Array.isArray(keys) && keys.includes(key)) return true;
  } catch {
    /* Memory-only fallback. */
  }
  return delivered.has(key);
}
function remember(key: string) {
  delivered.add(key);
  try {
    const keys = JSON.parse(sessionStorage.getItem(DEDUPE_KEY) || "[]");
    const values = Array.isArray(keys)
      ? keys.filter((value) => typeof value === "string").slice(-499)
      : [];
    sessionStorage.setItem(
      DEDUPE_KEY,
      JSON.stringify([...new Set([...values, key])]),
    );
  } catch {
    /* Memory-only fallback. */
  }
}
export function stopAnalytics() {
  frame?.remove();
  frame = undefined;
  ready = false;
  queued = [];
  delivered.clear();
}
export function startAnalytics(id: string) {
  if (!analyticsConsent() || !/^G(?:TM)?-[A-Z0-9]{6,15}$/.test(id) || frame)
    return;
  const target = document.createElement("iframe");
  target.src = "/analytics-frame";
  target.hidden = true;
  target.title = "Optional product analytics";
  target.setAttribute("sandbox", "allow-scripts");
  target.referrerPolicy = "no-referrer";
  frame = target;
  document.body.appendChild(target);
}
export function analyticsReady(event: MessageEvent) {
  if (
    frame &&
    event.source === frame.contentWindow &&
    event.data === "reerhub-analytics-ready" &&
    analyticsConsent()
  ) {
    ready = true;
    for (const payload of queued)
      frame.contentWindow?.postMessage(payload, "*");
    queued = [];
  }
}
export function track(
  name: AnalyticsEvent,
  input: Record<string, unknown> = {},
  dedupeKey?: string,
) {
  if (!frame || !analyticsConsent()) return;
  const payload = safeAnalyticsEvent(name, input);
  if (!payload) return;
  const key = dedupeKey ? `${name}:${dedupeKey}` : undefined;
  if (key && alreadyDelivered(key)) return;
  if (key) {
    if (delivered.size > 500) delivered.clear();
    remember(key);
  }
  if (ready) frame.contentWindow?.postMessage(payload, "*");
  else if (queued.length < 50) queued.push(payload);
}
