import { isPublicAnalyticsUrl } from "./public-analytics";
import { analyticsConsent } from "./consent";
import { safeAnalyticsEvent, type AnalyticsEvent } from "./analytics-events";
type TagWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
};
let publicTag: HTMLScriptElement | undefined;
let publicTagReady = false;
const initialPublicDocument =
  typeof window !== "undefined" &&
  isPublicAnalyticsUrl(new URL(window.location.href));
export function publicTagLoaded() {
  return Boolean(publicTag);
}
// Inventory-gated hubs need a fresh document so their server robots decision
// is known before any previously loaded third-party tag can run there.
const inventoryGatedNavigation = (url: URL) =>
  /^\/(?:react|nodejs|python|java|typescript|fresher|internship)-jobs$/.test(
    url.pathname,
  ) && url.pathname !== window.location.pathname;
export function navigateAwayFromPublicTag(
  href: string,
  replace = false,
): boolean {
  if (!publicTag) return false;
  const target = new URL(href, window.location.href);
  if (
    target.origin !== window.location.origin ||
    !isPublicAnalyticsUrl(target) ||
    inventoryGatedNavigation(target)
  ) {
    if (replace) window.location.replace(target.href);
    else window.location.assign(target.href);
    return true;
  }
  return false;
}
function tagCommand(...args: unknown[]) {
  const target = window as TagWindow;
  target.dataLayer ||= [];
  // Google expects an Arguments object, not an event-object or array.
  target.gtag ||= function () {
    // Google’s documented queue consumes Arguments objects.
    // eslint-disable-next-line prefer-rest-params
    target.dataLayer!.push(arguments);
  };
  target.gtag(...args);
}
function publicPageFields() {
  return {
    page_location: window.location.origin + window.location.pathname,
    page_referrer: "",
    page_title: document.title,
  };
}
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
  if (publicTag) {
    // Executed third-party code cannot be unloaded by deleting its script.
    // Persisted refusal is read by the new document before any tag can load.
    tagCommand("consent", "update", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
    for (const cookie of document.cookie.split(";")) {
      const name = cookie.trim().split("=")[0];
      if (!/^_ga(?:_|$)|^_gid$|^_gat(?:_|$)/.test(name)) continue;
      const parts = window.location.hostname.split(".");
      document.cookie = `${name}=; Max-Age=0; Path=/`;
      for (let i = 0; i < parts.length - 1; i++)
        document.cookie = `${name}=; Max-Age=0; Path=/; Domain=${parts.slice(i).join(".")}`;
    }
    window.location.reload();
    return;
  }
  frame?.remove();
  frame = undefined;
  ready = false;
  queued = [];
  delivered.clear();
}
export function startAnalytics(id: string) {
  if (
    !isPublicAnalyticsUrl(new URL(window.location.href)) ||
    document
      .querySelector('meta[name="robots"]')
      ?.getAttribute("content")
      ?.includes("noindex")
  )
    return;
  if (id.startsWith("GTM-")) {
    if (!analyticsConsent() || !/^GTM-[A-Z0-9]{6,15}$/.test(id) || publicTag)
      return;
    // A document originally opened on authentication/account screens must be
    // discarded before loading a third party, including its Back history/DOM.
    if (!initialPublicDocument) {
      window.location.reload();
      return;
    }
    tagCommand("consent", "default", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
    tagCommand("set", {
      ...publicPageFields(),
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      ads_data_redaction: true,
      url_passthrough: false,
    });
    tagCommand("consent", "update", {
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
    const target = window as TagWindow;
    target.dataLayer!.push({ "gtm.start": Date.now(), event: "gtm.js" });
    const script = document.createElement("script");
    script.id = "reerhub-public-gtm";
    script.async = true;
    script.referrerPolicy = "no-referrer";
    script.src = `https://www.googletagmanager.com/gtm.js?id=${id}`;
    publicTag = script;
    script.onload = () => {
      publicTagReady = true;
      trackPublicPage();
    };
    document.head.appendChild(script);
    document.addEventListener(
      "click",
      (event) => {
        if (
          !(event instanceof MouseEvent) ||
          event.button ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        )
          return;
        const link =
          event.target instanceof Element
            ? event.target.closest("a[href]")
            : null;
        if (
          !(link instanceof HTMLAnchorElement) ||
          link.target ||
          link.hasAttribute("download")
        )
          return;
        const url = new URL(link.href);
        if (
          url.origin === window.location.origin &&
          (!isPublicAnalyticsUrl(url) || inventoryGatedNavigation(url))
        ) {
          event.preventDefault();
          event.stopPropagation();
          window.location.assign(url.href);
        }
      },
      true,
    );
    return;
  }
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
  if (
    !analyticsConsent() ||
    document
      .querySelector('meta[name="robots"]')
      ?.getAttribute("content")
      ?.includes("noindex") ||
    !isPublicAnalyticsUrl(new URL(window.location.href))
  )
    return;
  if (publicTag) {
    const payload = safeAnalyticsEvent(name, input);
    if (!payload) return;
    const key = dedupeKey ? `${name}:${dedupeKey}` : undefined;
    if (key && alreadyDelivered(key)) return;
    if (key) remember(key);
    (window as TagWindow).dataLayer!.push({
      event: payload.name,
      ...payload.params,
      ...([
        "search_submit",
        "empty_results",
        "signup_prompt_click",
        "outbound_apply",
      ].includes(name)
        ? {}
        : publicPageFields()),
    });
    return;
  }
  if (!frame) return;
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

/** Explicit pageviews avoid transmitting filters, fragments or private return URLs. */
let lastPublicPage = "";
export function trackPublicPage() {
  if (
    publicTag &&
    publicTagReady &&
    analyticsConsent() &&
    isPublicAnalyticsUrl(new URL(window.location.href))
  ) {
    const page = window.location.origin + window.location.pathname;
    if (lastPublicPage === page) return;
    lastPublicPage = page;
    tagCommand("set", publicPageFields());
    (window as TagWindow).dataLayer!.push({
      event: "page_view",
      ...publicPageFields(),
    });
  }
}
