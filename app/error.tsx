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
        {error.message || "Could not load this page. Please try again."}
      </p>
      <button
        onClick={reset}
        className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-500 transition-all shadow-sm"
      >
        Try again
      </button>
    </div>
  );
}
