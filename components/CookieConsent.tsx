"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  consentSnapshot,
  parseConsent,
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
  const [analytics, setAnalytics] = useState(false);
  const consent = parseConsent(stored);
  const heading = useRef<HTMLHeadingElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  useEffect(() => {
    if (preferences) heading.current?.focus();
    else if (wasOpen.current) opener.current?.focus();
    wasOpen.current = preferences;
  }, [preferences]);
  const openPreferences = () => {
    setAnalytics(analyticsAvailable && consent.analytics);
    setPreferences(true);
  };
  const choose = (value: boolean) => {
    saveConsent(analyticsAvailable && value);
    setPreferences(false);
  };
  if (!preferences && (stored || !analyticsAvailable))
    return (
      <button
        type="button"
        ref={opener}
        className="fixed bottom-3 right-3 z-40 min-h-11 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 shadow-sm"
        onClick={openPreferences}
      >
        Privacy preferences
      </button>
    );
  if (!preferences)
    return (
      <section
        aria-label="Privacy choices"
        className="fixed bottom-3 left-3 right-3 z-40 flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-pop sm:left-auto sm:right-6 sm:max-w-md"
      >
        <p className="flex-1 text-slate-600">Optional analytics is off.</p>
        <button
          type="button"
          className="btn-secondary !px-3 !text-xs"
          onClick={() => choose(false)}
        >
          Reject analytics
        </button>
        <button
          type="button"
          ref={opener}
          className="btn-secondary !px-3 !text-xs"
          onClick={openPreferences}
        >
          Preferences
        </button>
      </section>
    );
  return (
    <section
      aria-label="Privacy preferences"
      role="region"
      className="fixed bottom-4 left-4 right-4 z-50 max-h-[80dvh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 text-ink shadow-pop sm:left-auto sm:right-6 sm:max-w-md"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 ref={heading} tabIndex={-1} className="text-base font-semibold">
          Your privacy choices
        </h2>
        <button
          type="button"
          aria-label="Close privacy preferences"
          className="min-h-11 min-w-11 rounded-lg text-sm"
          onClick={() => setPreferences(false)}
        >
          Close
        </button>
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Necessary cookies secure sign-in.{" "}
        {analyticsAvailable
          ? "Optional analytics is off unless you allow it."
          : "Analytics is currently disabled."}{" "}
        <Link href="/privacy" className="underline">
          Privacy policy
        </Link>
        .
      </p>
      {preferences && (
        <div className="mt-4 space-y-3 text-sm">
          <p className="leading-6 text-slate-600">
            When configured, analytics measures product actions. It receives no
            profile contents, email addresses, payment details or private URLs.
            You can withdraw here at any time.
          </p>
          <p>Necessary cookies · always active</p>
          <label className="flex min-h-11 items-center gap-3">
            <input
              type="checkbox"
              disabled={!analyticsAvailable}
              checked={analytics}
              onChange={(e) => setAnalytics(e.target.checked)}
            />
            Allow optional product analytics
            {!analyticsAvailable && " (not configured)"}
          </label>
        </div>
      )}
      <div className="consent-actions mt-4 grid grid-cols-3 gap-2">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => choose(false)}
        >
          Reject analytics
        </button>
        {preferences ? (
          <button
            type="button"
            className="btn-primary"
            onClick={() => choose(analytics)}
          >
            Save preferences
          </button>
        ) : (
          <>
            <button
              type="button"
              className="btn-primary"
              onClick={() => choose(true)}
            >
              Allow analytics
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setAnalytics(false);
                setPreferences(true);
              }}
            >
              Preferences
            </button>
          </>
        )}
      </div>
    </section>
  );
}
