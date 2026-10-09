import Link from "next/link";
import type { AuthUser } from "@/lib/auth";
import { profileSignals } from "@/lib/profile-readiness";

export default function DashboardGuidance({
  profile,
  pro,
}: {
  profile: AuthUser["profile"];
  pro: boolean;
}) {
  const signals = profileSignals(profile);
  const completed = signals.filter((signal) => signal.complete).length;
  const next = signals.find((signal) => !signal.complete);
  return (
    <section
      className="surface-panel mb-6 p-5 sm:p-6"
      aria-labelledby="guidance-title"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="max-w-xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary-deep">
            {next
              ? `${completed} of ${signals.length} essentials complete`
              : "Your preferences are saved"}
          </p>
          <h2 id="guidance-title" className="text-xl font-bold text-ink">
            {next
              ? "A little context. A clearer next step."
              : pro
                ? "Start with your strongest matches."
                : "Ready to explore your next opportunity."}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {next
              ? `Up next: ${next.label.toLowerCase()}. You can browse and save jobs while you finish your profile.`
              : pro
                ? "Review why each role matches, then save the openings you want to revisit. Relevance is not a hiring prediction."
                : "Browse official openings and save your shortlist. Personalized recommendations are a separate Pro feature."}
          </p>
        </div>
        <Link
          className="btn-primary"
          href={
            next
              ? "/profile"
              : pro
                ? "/dashboard?view=matches#matches-title"
                : "/dashboard?view=discover"
          }
        >
          {next
            ? "Complete my profile"
            : pro
              ? "View my matches"
              : "Explore jobs"}
        </Link>
      </div>
      {next && (
        <ul
          className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-600"
          aria-label="Profile essentials"
        >
          {signals.map((signal) => (
            <li key={signal.label}>
              {signal.complete ? "✓" : "○"} {signal.label}
              <span className="sr-only">
                {signal.complete ? ": complete" : ": needed"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
