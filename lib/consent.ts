export const CONSENT_KEY = "reerhub-consent-v2";
export const CONSENT_EVENT = "reerhub-consent-changed";
export type Consent = { version: 2; necessary: true; analytics: boolean };
const denied: Consent = { version: 2, necessary: true, analytics: false };
export function consentSnapshot(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(CONSENT_KEY);
  } catch {
    return null;
  }
}
export function parseConsent(value: string | null): Consent {
  try {
    const parsed = JSON.parse(value || "null");
    return parsed?.version === 2 &&
      parsed.necessary === true &&
      typeof parsed.analytics === "boolean"
      ? parsed
      : denied;
  } catch {
    return denied;
  }
}
export function analyticsConsent(): boolean {
  return parseConsent(consentSnapshot()).analytics;
}
export function saveConsent(analytics: boolean) {
  const value: Consent = { version: 2, necessary: true, analytics };
  try {
    window.localStorage.setItem(CONSENT_KEY, JSON.stringify(value));
  } catch {
    /* Privacy choices fail closed when storage is unavailable. */
  }
  window.dispatchEvent(new Event(CONSENT_EVENT));
}
export function subscribeConsent(listener: () => void) {
  window.addEventListener(CONSENT_EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(CONSENT_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}
