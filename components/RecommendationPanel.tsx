"use client";
import Link from "next/link";
import { useCallback, useEffect, useState, type CSSProperties } from "react";
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
export default function RecommendationPanel({
  savedIds = [],
  onToggleSave,
}: {
  savedIds?: string[];
  onToggleSave?: (id: string, saved: boolean) => void;
}) {
  const [jobs, setJobs] = useState<Recommendation[]>([]);
  const [completion, setCompletion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [liked, setLiked] = useState<string[]>([]);
  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    getRecommendations()
      .then((data) => {
        setJobs(data.jobs);
        setCompletion(data.profileCompletion);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    let active = true;
    getRecommendations()
      .then((data) => {
        if (active) {
          setJobs(data.jobs);
          setCompletion(data.profileCompletion);
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
    };
  }, []);
  const feedback = async (id: string, value: string) => {
    setBusy(id);
    try {
      await setRecommendationFeedback(id, value);
      if (value === "not_relevant")
        setJobs((prev) => prev.filter((j) => j._id !== id));
      else setLiked((prev) => [...prev, id]);
      toast.success(
        value === "not_relevant"
          ? "Role hidden from your matches"
          : "Thanks. Relevance feedback saved.",
      );
    } catch {
      toast.error("Could not save feedback");
    } finally {
      setBusy(null);
    }
  };
  return (
    <section aria-labelledby="matches-title">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            id="matches-title"
            className="text-2xl font-bold tracking-tight text-ink"
          >
            Your strongest matches
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Ranked by relevance to your profile. Every role meets the 55%
            minimum.
          </p>
        </div>
        <span className="rounded-full border border-primary/20 bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary-deep">
          Pro intelligence
        </span>
      </div>
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
          <button onClick={load} className="btn-secondary mt-5">
            Try again
          </button>
        </div>
      ) : jobs.length ? (
        <div className="space-y-4">
          {jobs.map((job, index) => (
            <article key={job._id} className="surface-panel p-5 sm:p-7">
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
                        Match #{index + 1} ·{" "}
                        {timeAgo(job.firstSeenAt) || "Recently added"}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={jobUrl(job)}
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
                </div>
                <div className="text-center">
                  <div
                    className="match-score"
                    style={{ "--score": job.fit.score } as CSSProperties}
                  >
                    <span>{job.fit.score}%</span>
                  </div>
                  <p className="mt-2 text-[11px] font-medium text-slate-600">
                    Profile match
                  </p>
                </div>
              </div>
              <div className="my-5 rounded-xl bg-surface p-4">
                <h3 className="mb-2 text-xs font-semibold text-slate-700">
                  Why this role made your shortlist
                </h3>
                <ul className="space-y-2">
                  {job.fit.reasons.map((reason) => (
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
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-2">
                  <Link href={jobUrl(job)} className="btn-primary">
                    View role & apply
                    <Icon name="arrow" className="h-4 w-4" />
                  </Link>
                  <button
                    className="btn-secondary"
                    onClick={() =>
                      onToggleSave?.(job._id, !savedIds.includes(job._id))
                    }
                    aria-pressed={savedIds.includes(job._id)}
                  >
                    <Icon name="bookmark" className="h-4 w-4" />
                    {savedIds.includes(job._id) ? "Saved" : "Save"}
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    disabled={busy === job._id || liked.includes(job._id)}
                    className="min-h-11 rounded-lg px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                    onClick={() => feedback(job._id, "relevant")}
                  >
                    {liked.includes(job._id)
                      ? "Marked relevant"
                      : "Relevant to me"}
                  </button>
                  <button
                    disabled={busy === job._id}
                    className="min-h-11 rounded-lg px-3 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                    onClick={() => feedback(job._id, "not_relevant")}
                  >
                    Hide role
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="surface-panel flex flex-col items-center p-8 text-center sm:p-12">
          <Icon name="spark" className="mb-4 h-8 w-8 text-primary" />
          <h3 className="text-xl font-bold text-ink">
            {completion < 60
              ? "Give your matches a stronger starting point."
              : "A quieter day. A focused shortlist."}
          </h3>
          <p className="mt-3 max-w-md text-sm leading-7 text-slate-600">
            {completion < 60
              ? "Add your skills, experience, and preferences. A clearer profile helps us surface stronger matches."
              : "No current roles meet the 55% relevance threshold. We’ll keep checking fresh official openings; you can explore all jobs in the meantime."}
          </p>
          <Link
            href={completion < 60 ? "/profile" : "/dashboard?view=discover"}
            className="btn-primary mt-6"
          >
            {completion < 60 ? "Complete my profile" : "Explore all jobs"}
          </Link>
        </div>
      )}
      <p className="mt-5 text-xs leading-6 text-slate-600">
        Scores measure role relevance to your profile. They don’t predict
        interviews, offers, or hiring outcomes.
      </p>
    </section>
  );
}
