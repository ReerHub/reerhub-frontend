"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[65vh] flex items-center justify-center px-6 py-14">
      <div className="text-center max-w-xl">
        <p className="text-sm font-semibold text-primary-deep mb-4">
          Page not found · 404
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight mb-4">
          Let’s find your next opening.
        </h1>
        <p className="text-slate-500 text-lg mb-10">
          This link has moved or is no longer available. You can continue
          exploring the current tech openings.
        </p>
        <Link href="/jobs" className="btn-primary">
          Browse tech roles
        </Link>
      </div>
    </div>
  );
}
