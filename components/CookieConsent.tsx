"use client";
import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  consentSnapshot,
  parseConsent,
  saveConsent,
  subscribeConsent,
} from "@/lib/consent";
export default function CookieConsent() {
  const stored = useSyncExternalStore(
    subscribeConsent,
    consentSnapshot,
    () => null,
  );
  const [preferences, setPreferences] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const consent = parseConsent(stored);
  const choose = (value: boolean) => {
    saveConsent(value);
    setPreferences(false);
  };
  if (stored && !preferences)
    return (
      <button
        type="button"
        className="fixed bottom-3 right-3 z-40 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 shadow-sm"
        onClick={() => {
          setAnalytics(consent.analytics);
          setPreferences(true);
        }}
      >
        Privacy preferences
      </button>
    );
  return (
    <section
      aria-label="Privacy preferences"
      role="region"
      className="fixed bottom-4 left-4 right-4 z-50 rounded-2xl border border-slate-200 bg-white p-5 text-ink shadow-pop sm:left-auto sm:right-6 sm:max-w-md"
    >
      <h2 className="text-base font-semibold">Your privacy choices</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Necessary cookies secure sign-in. Optional analytics is off unless you
        allow it.{" "}
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
              checked={analytics}
              onChange={(e) => setAnalytics(e.target.checked)}
            />
            Allow optional product analytics
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
