"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "@/components/AppLink";
import {
  OPEN_PRIVACY_EVENT,
  consentSnapshot,
  saveConsent,
  subscribeConsent,
} from "@/lib/consent";

export default function CookieConsent({
  analyticsAvailable = false,
}: {
  analyticsAvailable?: boolean;
}) {
  const stored = useSyncExternalStore(
    subscribeConsent,
    consentSnapshot,
    () => null,
  );
  const [preferences, setPreferences] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const wasOpen = useRef(false);
  useEffect(() => {
    const open = (event: Event) => {
      const trigger = (event as CustomEvent<{ opener?: HTMLElement }>).detail
        ?.opener;
      opener.current = trigger instanceof HTMLElement ? trigger : null;
      setPreferences(true);
    };
    window.addEventListener(OPEN_PRIVACY_EVENT, open);
    return () => window.removeEventListener(OPEN_PRIVACY_EVENT, open);
  }, []);
  useEffect(() => {
    if (preferences) heading.current?.focus();
    else if (wasOpen.current) {
      const target = opener.current?.isConnected
        ? opener.current
        : document.getElementById("main-content");
      target?.focus({ preventScroll: true });
    }
    wasOpen.current = preferences;
  }, [preferences, stored]);
  useEffect(() => {
    if (!preferences) return;
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPreferences(false);
    };
    window.addEventListener("keydown", dismiss);
    return () => window.removeEventListener("keydown", dismiss);
  }, [preferences]);
  const choose = (allow: boolean) => {
    saveConsent(allow);
    wasOpen.current = true;
    setPreferences(false);
  };
  if (!preferences && (stored || !analyticsAvailable)) return null;
  return (
    <section
      aria-label={preferences ? "Privacy preferences" : "Privacy choices"}
      role="region"
      className="privacy-panel"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 ref={heading} tabIndex={-1}>
          Your privacy choices
        </h2>
        {preferences && (
          <button
            type="button"
            aria-label="Close privacy preferences"
            className="min-h-11 min-w-11 rounded-lg text-sm"
            onClick={() => setPreferences(false)}
          >
            Close
          </button>
        )}
      </div>
      <p className="mt-3">
        Essential cookies keep you signed in and protect your account. With your
        permission, optional analytics helps us improve ReerHub. You can change
        your choice anytime.
      </p>
      <Link
        href="/privacy"
        className="inline-flex min-h-11 items-center text-sm text-primary-deep underline"
      >
        Privacy policy
      </Link>
      <div className="consent-actions">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => choose(false)}
        >
          Reject
        </button>
        <button
          type="button"
          className="btn-primary"
          onClick={() => choose(true)}
        >
          Accept
        </button>
      </div>
    </section>
  );
}
