"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-dvh flex items-center justify-center px-6">
      <div className="text-center max-w-xl">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-electric mb-3">
          Error 404
        </p>
        <h1 className="font-display text-7xl font-bold text-slate-900 tracking-tight mb-4">
          Role not found
        </h1>
        <p className="text-slate-500 text-lg mb-10">
          This page doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/jobs"
          className="px-8 py-3 bg-electric text-white font-semibold rounded-xl hover:bg-electric-dark transition-all text-sm shadow-sm"
        >
          Browse tech roles
        </Link>
      </div>
    </div>
  );
}
