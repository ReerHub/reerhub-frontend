"use client";

import Link from "next/link";

export default function GlobalError({
  reset,
}: {
  error?: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 text-center">
      <div className="mx-auto w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-5">
        <svg
          className="w-7 h-7 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">
        Something went wrong
      </h1>
      <p className="text-slate-500 mb-6">
        This page hit a snag. Try again, or head back to browse roles.
      </p>
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={reset}
          className="px-6 py-2.5 bg-electric text-white rounded-xl text-sm font-semibold hover:bg-electric-dark transition-all shadow-sm"
        >
          Try again
        </button>
        <Link
          href="/jobs"
          className="px-6 py-2.5 bg-white border border-slate-200 text-slate-900 rounded-xl text-sm font-semibold hover:border-slate-300 transition-all"
        >
          Browse roles
        </Link>
      </div>
    </div>
  );
}
