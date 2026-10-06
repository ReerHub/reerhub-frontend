import Link from "next/link";

export default function UpgradePanel({
  compact = false,
}: {
  compact?: boolean;
}) {
  return (
    <section
      className={`relative overflow-hidden rounded-3xl bg-ink text-white ${compact ? "p-5" : "p-7 sm:p-8"}`}
    >
      <div
        className="absolute right-0 top-0 h-32 w-32 rounded-full bg-electric/25 blur-3xl"
        aria-hidden
      />
      <p className="relative text-sm font-semibold text-teal-200">
        ReerHub Pro
      </p>
      <h2
        className={`relative mt-2 font-display font-bold tracking-tight ${compact ? "text-xl" : "text-3xl"}`}
      >
        Stop searching every role. Start with the right ones.
      </h2>
      <p className="relative mt-3 max-w-xl text-sm leading-relaxed text-white/70">
        Get up to five strong matches each day, clear reasons behind every
        score, and a private ranked workspace built from your profile.
      </p>
      <div className="relative mt-5 flex flex-wrap items-center gap-3">
        <Link
          href="/billing"
          className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-900 transition-transform hover:-translate-y-0.5 hover:bg-slate-100 active:translate-y-0"
        >
          Start 7-day trial
        </Link>
        <span className="text-xs text-white/55">
          From ₹49/week · pause alerts any time
        </span>
      </div>
    </section>
  );
}
