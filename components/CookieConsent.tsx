"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";

const KEY = "reerhub-cookie-consent";

function subscribe() {
  return () => {};
}

function getSnapshot(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return "unavailable";
  }
}

function getServerSnapshot(): string | null {
  return null;
}

export default function CookieConsent() {
  const [dismissed, setDismissed] = useState(false);
  const stored = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  if (dismissed || stored !== null) return null;

  const choose = (value: string) => {
    try {
      localStorage.setItem(KEY, value);
    } catch {
      // storage unavailable — banner simply reappears next visit
    }
    setDismissed(true);
  };

  return (
    <div
      role="region"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-50 bg-white border border-slate-200 text-ink rounded-2xl p-5 shadow-pop"
    >
      <p className="text-sm leading-relaxed text-slate-600">
        We use strictly-necessary cookies to keep you logged in and secure. See
        our{" "}
        <Link
          href="/privacy"
          className="underline underline-offset-2 font-semibold"
        >
          Privacy Policy
        </Link>
        .
      </p>
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => choose("accepted")}
          className="btn-primary flex-1"
        >
          Accept
        </button>
        <button
          onClick={() => choose("declined")}
          className="btn-secondary flex-1"
        >
          Decline
        </button>
      </div>
    </div>
  );
}
