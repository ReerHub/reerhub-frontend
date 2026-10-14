export const CONSENT_KEY = "reerhub-consent-v2";
export const OPEN_PRIVACY_EVENT = "reerhub-open-privacy";
export const CONSENT_EVENT = "reerhub-consent-changed";
export type Consent = { version: 2; necessary: true; analytics: boolean };
let unavailableSnapshot: string | null = null;
const REVOCATION_KEY = "reerhub-analytics-revoked";
function persistedRevocation(): boolean {
  try {
    if (window.document.cookie.split("; ").includes(`${REVOCATION_KEY}=1`))
      return true;
  } catch {
    /* Storage may be unavailable. */
  }
  try {
    return window.sessionStorage.getItem(REVOCATION_KEY) === "1";
  } catch {
    return false;
  }
}
function rememberRevocation(revoke: boolean) {
  try {
    window.document.cookie = `${REVOCATION_KEY}=${revoke ? "1" : ""}; Path=/; Max-Age=${revoke ? "31536000" : "0"}; SameSite=Lax`;
  } catch {
    /* Keep the in-memory denial. */
  }
  try {
    if (revoke) window.sessionStorage.setItem(REVOCATION_KEY, "1");
    else window.sessionStorage.removeItem(REVOCATION_KEY);
  } catch {
    /* The necessary privacy cookie is the persistent fallback. */
  }
}
const denied: Consent = { version: 2, necessary: true, analytics: false };
export function consentSnapshot(): string | null {
  if (typeof window === "undefined") return null;
  if (unavailableSnapshot) return unavailableSnapshot;
  if (persistedRevocation()) return JSON.stringify(denied);
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
    unavailableSnapshot = null;
    rememberRevocation(false);
  } catch {
    // A failed write must also revoke any previously stored acceptance this session.
    unavailableSnapshot = JSON.stringify(denied);
    // Withdrawal reloads a main-document tag. Never let stale stored acceptance
    // reactivate it when a failed write was caused by quota/storage restrictions.
    try {
      window.localStorage.removeItem(CONSENT_KEY);
    } catch {
      /* Fall back. */
    }
    rememberRevocation(true);
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
