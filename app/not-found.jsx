"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#060D1D] flex items-center justify-center px-6">
      <div className="text-center max-w-xl">
        <h1 className="text-7xl font-bold text-[#0F172A] dark:text-white tracking-tight mb-4">
          404
        </h1>
        <p className="text-[#64748B] dark:text-[#94A3B8] text-lg mb-10">
          This page doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="px-8 py-3 bg-[#2563EB] text-white font-semibold rounded-lg hover:bg-[#1D4ED8] transition-all text-sm"
        >
          Browse tech roles
        </Link>
      </div>
    </div>
  );
}
