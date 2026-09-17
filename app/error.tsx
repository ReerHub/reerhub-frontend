"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 text-center">
      <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white mb-2">
        Something went wrong
      </h1>
      <p className="text-[#64748B] dark:text-[#94A3B8] mb-6">
        {error.message || "Could not load this page. Please try again."}
      </p>
      <button
        onClick={reset}
        className="px-6 py-2.5 bg-[#2563EB] text-white rounded-lg text-sm font-semibold hover:bg-[#1D4ED8] transition-all"
      >
        Try again
      </button>
    </div>
  );
}
