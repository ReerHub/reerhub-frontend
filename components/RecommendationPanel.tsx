"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import toast from "react-hot-toast";
import {
  getRecommendations,
  setRecommendationFeedback,
  type Recommendation,
} from "@/lib/auth";
import { jobUrl } from "@/lib/reerhub";
import CompanyLogo from "@/components/CompanyLogo";
import Icon from "@/components/ui/Icon";
import { timeAgo } from "@/lib/format";

import {
  countsAfterHide,
  nextMatchTier,
  experienceLabel,
  type ScoreTier,
} from "@/lib/dashboard";

const SCORE_TIERS: { value: ScoreTier; label: string; description: string }[] =
  [
    { value: 90, label: "90%+", description: "Highest relevance" },
    { value: 75, label: "75%+", description: "Strong matches" },
    { value: 50, label: "50%+", description: "Worth reviewing" },
    { value: 25, label: "25%+", description: "Broader matches" },
    { value: 0, label: "Explore all", description: "All profile-ranked roles" },
  ];

export default function RecommendationPanel({
  savedIds = [],
  savingIds = [],
  onToggleSave,
}: {
  savedIds?: string[];
  savingIds?: string[];
  onToggleSave?: (id: string, saved: boolean) => void;
}) {
  const [jobs, setJobs] = useState<Recommendation[]>([]);
  const [profileReady, setProfileReady] = useState<boolean | null>(null);
  const [missingProfileFields, setMissingProfileFields] = useState<string[]>(
    [],
  );
  const [minimumScore, setMinimumScore] = useState<ScoreTier>(75);

  const [matchCounts, setMatchCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState<string[]>([]);
  const pending = useRef(new Set<string>());
  const mounted = useRef(false);
  const [attempt, setAttempt] = useState(0);
  const [liked, setLiked] = useState<string[]>([]);
  const [outcomes, setOutcomes] = useState<Record<string, string>>({});
  const selectTier = (score: ScoreTier) => {
    if (score === minimumScore) return;
    setLoading(true);
    setError(false);
    setMinimumScore(score);
  };
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    mounted.current = true;
    getRecommendations(minimumScore, controller.signal)
      .then((data) => {
        if (active) {
          setJobs(data.jobs);
          setProfileReady(data.profileReady);
          setMissingProfileFields(data.missingProfileFields);
          setMatchCounts(data.matchCounts);
        }
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
      mounted.current = false;
    };
  }, [minimumScore, attempt]);
  const feedback = async (id: string, value: string) => {
    if (pending.current.has(id)) return;
    pending.current.add(id);
    setBusy([...pending.current]);
    try {
      await setRecommendationFeedback(id, value);
      if (!mounted.current) return;
      if (value === "not_relevant") {
        const hidden = jobs.find((job) => job._id === id);
        setJobs((prev) => prev.filter((job) => job._id !== id));
        if (hidden)
          setMatchCounts((prev) =>
            countsAfterHide(prev, hidden.fit.relevanceScore),
          );
        setLoading(true);
        setAttempt((prev) => prev + 1);
      } else {
        if (value === "relevant") setLiked((prev) => [...prev, id]);
        setOutcomes((prev) => ({ ...prev, [id]: value }));
      }
      toast.success(
        value === "not_relevant"
          ? "Role hidden from your matches"
          : value === "applied"
            ? "Application recorded. Good luck!"
            : value === "interview"
              ? "Interview recorded. We’re rooting for you!"
              : value === "offer"
                ? "Offer recorded. Congratulations!"
                : "Thanks. Relevance feedback saved.",
      );
    } catch {
      if (mounted.current) toast.error("Could not save feedback");
    } finally {
      pending.current.delete(id);
      if (mounted.current) setBusy([...pending.current]);
    }
  };
  const lowerTier = nextMatchTier(minimumScore, matchCounts);
  return (
    <section aria-labelledby="matches-title" aria-busy={loading}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            id="matches-title"
            className="scroll-mt-24 text-2xl font-bold tracking-tight text-ink"
          >
            {minimumScore === 0
              ? "All profile-ranked roles"
              : `${minimumScore}%+ profile matches`}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {minimumScore === 0
              ? "Every role has at least two profile signals. Stronger fits appear first."
              : `Ranked by relevance to your profile. Every role meets the ${minimumScore}% minimum.`}
          </p>
        </div>
        <span className="rounded-full border border-primary/20 bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary-deep">
          Pro intelligence
        </span>
      </div>
      {profileReady === true && !error && (
        <div
          className="mb-7 flex flex-wrap gap-2"
          role="group"
          aria-label="Filter matches by relevance score"
        >
          {SCORE_TIERS.map((tier) => {
            const selected = minimumScore === tier.value;
            const count =
              matchCounts[tier.value === 0 ? "all" : String(tier.value)] || 0;
            return (
              <button
                key={tier.value}
                type="button"
                aria-pressed={selected}
                title={tier.description}
                onClick={() => selectTier(tier.value)}
                className={`min-h-11 rounded-xl border px-3 text-sm font-semibold transition-colors ${
                  selected
                    ? "border-primary bg-primary text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-primary/40 hover:text-primary"
                }`}
              >
                {tier.label}{" "}
                <span className="match-tier-count ml-1">
                  {loading ? "—" : count}
                </span>
              </button>
            );
          })}
        </div>
      )}
      <p className="mb-6 text-xs leading-6 text-slate-600">
        Daily emails stay at 75%+ regardless of this dashboard filter. You’ll
        receive one digest with up to five qualifying roles, only when matches
        are available.
      </p>
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-56 rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <div className="surface-panel p-8">
          <h3 className="font-bold text-ink">Your matches couldn’t load.</h3>
          <p className="mt-2 text-sm text-slate-600">
            Try again to refresh your ranked roles.
          </p>
          <button
            onClick={() => {
              setLoading(true);
              setError(false);
              setAttempt((value) => value + 1);
            }}
            className="btn-secondary mt-5"
          >
            Try again
          </button>
        </div>
      ) : jobs.length ? (
        <div className="space-y-4">
          {jobs.map((job, index) => (
            <article
              key={job._id}
              className="recommendation-card surface-panel p-4 sm:p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="mb-4 flex items-center gap-3">
                    <CompanyLogo
                      name={job.companyId.name}
                      logoUrl={job.companyId.logoUrl}
                      size="sm"
                    />
                    <div>
                      <p className="text-sm font-semibold text-ink">
                        {job.companyId.name}
                      </p>
                      <p className="mt-1 text-xs text-slate-600">
                        Match #{index + 1} · Added{" "}
                        {timeAgo(job.firstSeenAt) || "recently"}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={jobUrl(job)}
                    prefetch={false}
                    className="font-display text-xl font-bold leading-snug tracking-tight text-ink hover:text-primary"
                  >
                    {job.title}
                  </Link>
                  <p className="mt-2 text-sm text-slate-600">
                    {job.locations
                      .map((l) => l.city)
                      .filter(Boolean)
                      .join(", ") || "India"}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
                    {job.remoteType && job.remoteType !== "unknown" && (
                      <span className="rounded-md bg-surface px-2 py-1 capitalize">
                        {job.remoteType}
                      </span>
                    )}
                    {experienceLabel(job.experience) && (
                      <span className="rounded-md bg-surface px-2 py-1">
                        {experienceLabel(job.experience)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-center">
                  <div
                    className="match-score"
                    style={
                      { "--score": job.fit.relevanceScore } as CSSProperties
                    }
                  >
                    <span>{job.fit.relevanceScore}%</span>
                  </div>
                  <p className="mt-2 text-[11px] font-medium text-slate-600">
                    Profile match
                  </p>
                </div>
              </div>
              <div className="my-5 rounded-xl bg-surface p-4">
                <h3 className="mb-2 text-xs font-semibold text-slate-700">
                  Why this matches
                </h3>
                <ul className="space-y-2">
                  {job.fit.reasons.slice(0, 3).map((reason) => (
                    <li
                      key={reason}
                      className="flex gap-2 text-sm leading-6 text-slate-600"
                    >
                      <Icon
                        name="check"
                        className="mt-1 h-4 w-4 shrink-0 text-primary"
                      />
                      {reason}
                    </li>
                  ))}
                </ul>
                {job.fit.reasons.length > 3 && (
                  <details className="mt-2">
                    <summary className="flex min-h-11 cursor-pointer items-center text-xs font-semibold text-primary">
                      Show {job.fit.reasons.length - 3} more{" "}
                      {job.fit.reasons.length === 4 ? "reason" : "reasons"}
                    </summary>
                    <ul className="space-y-2 text-sm leading-6 text-slate-600">
                      {job.fit.reasons.slice(3).map((reason) => (
                        <li key={reason}>{reason}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="match-actions flex gap-2">
                  <Link
                    prefetch={false}
                    href={jobUrl(job)}
                    className="btn-primary"
                  >
                    View role & apply
                    <Icon name="arrow" className="h-4 w-4" />
                  </Link>
                  <button
                    className="btn-secondary"
                    disabled={savingIds.includes(job._id)}
                    aria-busy={savingIds.includes(job._id)}
                    onClick={() =>
                      onToggleSave?.(job._id, !savedIds.includes(job._id))
                    }
                    aria-pressed={savedIds.includes(job._id)}
                  >
                    <Icon name="bookmark" className="h-4 w-4" />
                    {savedIds.includes(job._id) ? "Saved" : "Save"}
                  </button>
                </div>
                <div className="match-actions flex gap-2">
                  <button
                    disabled={busy.includes(job._id) || liked.includes(job._id)}
                    aria-pressed={liked.includes(job._id)}
                    className="min-h-11 rounded-lg px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                    onClick={() => feedback(job._id, "relevant")}
                  >
                    {liked.includes(job._id) ? "Interested" : "Interested"}
                  </button>
                  <button
                    disabled={busy.includes(job._id)}
                    className="min-h-11 rounded-lg px-3 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                    onClick={() => feedback(job._id, "not_relevant")}
                  >
                    Not relevant
                  </button>
                  <details className="relative">
                    <summary className="flex min-h-11 cursor-pointer list-none items-center rounded-lg px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                      More
                    </summary>
                    <div className="absolute right-0 z-10 mt-1 w-44 rounded-xl border border-slate-200 bg-white p-1 shadow-card">
                      <button
                        disabled={
                          busy.includes(job._id) ||
                          outcomes[job._id] === "applied"
                        }
                        className="min-h-11 w-full rounded-lg px-3 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                        onClick={() => feedback(job._id, "applied")}
                      >
                        {outcomes[job._id] === "applied"
                          ? "Application recorded"
                          : "Applied"}
                      </button>

                      <button
                        disabled={
                          busy.includes(job._id) ||
                          outcomes[job._id] === "interview"
                        }
                        className="min-h-11 w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                        onClick={() => feedback(job._id, "interview")}
                      >
                        {outcomes[job._id] === "interview"
                          ? "Interview recorded"
                          : "Got interview"}
                      </button>
                      <button
                        disabled={
                          busy.includes(job._id) ||
                          outcomes[job._id] === "offer"
                        }
                        className="min-h-11 w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                        onClick={() => feedback(job._id, "offer")}
                      >
                        {outcomes[job._id] === "offer"
                          ? "Offer recorded"
                          : "Got offer"}
                      </button>
                    </div>
                  </details>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="surface-panel flex flex-col items-center p-8 text-center sm:p-12">
          <Icon name="spark" className="mb-4 h-8 w-8 text-primary" />
          <h3 className="text-xl font-bold text-ink">
            {profileReady === false
              ? "Complete your match profile first."
              : minimumScore > 0 && lowerTier !== null
                ? "No matches at this threshold."
                : "No ranked matches right now."}
          </h3>
          <p className="mt-3 max-w-md text-sm leading-7 text-slate-600">
            {profileReady === false
              ? `Add ${missingProfileFields.join(", ")} to complete your matching essentials. You can browse and save jobs meanwhile.`
              : lowerTier === null
                ? "No profile-ranked roles are available right now. We’ll keep checking fresh official openings."
                : `No current roles meet the ${minimumScore}% relevance threshold. You can broaden your shortlist without leaving your Pro workspace.`}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {profileReady === false ? (
              <Link href="/profile" className="btn-primary">
                Complete my profile
              </Link>
            ) : lowerTier !== null ? (
              <button
                className="btn-primary"
                onClick={() => selectTier(lowerTier)}
              >
                {lowerTier === 0
                  ? "Explore all ranked roles"
                  : `Show ${lowerTier}%+ matches`}
              </button>
            ) : (
              <Link href="/dashboard?view=discover" className="btn-primary">
                Browse all jobs
              </Link>
            )}
            {profileReady === false || lowerTier !== null ? (
              <Link href="/dashboard?view=discover" className="btn-secondary">
                Browse all jobs
              </Link>
            ) : null}
            {profileReady !== false && (
              <Link href="/profile" className="btn-secondary">
                Review preferences
              </Link>
            )}
          </div>
        </div>
      )}
      <p className="mt-5 text-xs leading-6 text-slate-600">
        Not relevant hides a role from your recommendations and daily alerts.
        Interested records your feedback; it does not change the matching score.
        Applied, Interview, and Offer are updates you report yourself.
      </p>
      <p className="mt-2 text-xs leading-6 text-slate-600">
        Scores measure role relevance to your profile. They don’t predict
        interviews, offers, or hiring outcomes.
      </p>
    </section>
  );
}
