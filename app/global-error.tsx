"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div className="max-w-md mx-auto px-4 py-24 text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Something went wrong
          </h1>
          <p className="text-slate-500 mb-6">
            Please refresh the page or come back in a moment.
          </p>
          <button
            onClick={reset}
            className="px-6 py-2.5 bg-electric text-white rounded-xl text-sm font-semibold hover:bg-electric-dark"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
