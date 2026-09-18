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
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-50 bg-slate-950 text-white rounded-2xl p-5 shadow-card-hover"
    >
      <p className="text-sm leading-relaxed text-white/85">
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
          className="flex-1 px-4 py-2 bg-white text-slate-950 rounded-xl text-sm font-semibold hover:bg-slate-200"
        >
          Accept
        </button>
        <button
          onClick={() => choose("declined")}
          className="flex-1 px-4 py-2 border border-white/25 rounded-xl text-sm font-semibold hover:border-white/50"
        >
          Decline
        </button>
      </div>
    </div>
  );
}
