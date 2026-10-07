"use client";
import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import { useAuth } from "@/components/AuthProvider";
import JobCard from "@/components/JobCard";
import Icon from "@/components/ui/Icon";
import {
  listCompanies,
  listJobsWithMeta,
  TECH_TRACKS,
  type Company,
  type Job,
} from "@/lib/reerhub";
export default function Home() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [error, setError] = useState(false);
  useEffect(() => {
    Promise.all([listJobsWithMeta({ limit: 3 }), listCompanies()])
      .then(([data, companies]) => {
        setJobs(data.jobs);
        setCompanies(companies);
      })
      .catch(() => setError(true));
  }, []);
  const total = companies.reduce((sum, c) => sum + (c.activeJobs || 0), 0);
  return (
    <div>
      <section className="border-b border-slate-200 bg-white">
        <div className="page-container grid items-center gap-12 py-14 lg:grid-cols-[1.1fr_1fr] lg:py-20">
          <div className="rise-in">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800">
              <Icon name="shield" className="h-4 w-4" />
              Direct from official career pages
            </div>
            <h1 className="max-w-xl font-display text-[42px] font-bold leading-[1.08] tracking-[-.045em] text-ink sm:text-6xl">
              Your next chapter starts with the right role.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-600">
              Explore India’s tech openings without the noise. Build your own
              shortlist for free, or let Pro find the roles that fit you.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/jobs" className="btn-primary">
                Explore jobs
                <Icon name="arrow" className="h-4 w-4" />
              </Link>
              <Link
                href={user ? "/dashboard" : "/login?next=/dashboard"}
                className="btn-secondary"
              >
                {user ? "Open my dashboard" : "Create a free account"}
              </Link>
            </div>
            <p className="mt-4 text-xs leading-6 text-slate-600">
              Free discovery. Direct applications. Pro matching when you’re
              ready.
            </p>
          </div>
          <div
            className="hero-canvas rise-in"
            style={{ animationDelay: "140ms" }}
          >
            <div className="relative mb-5 flex items-center justify-between">
              <span className="font-display text-lg font-bold text-ink">
                A clearer path to your next role
              </span>
              <Icon name="spark" className="text-primary" />
            </div>
            <div className="relative flex flex-wrap gap-2 pb-5">
              {["Your skills", "Your experience", "Your preferences"].map(
                (x) => (
                  <span
                    key={x}
                    className="rounded-lg border border-primary/15 bg-white px-3 py-2 text-xs font-semibold text-primary-deep"
                  >
                    {x}
                  </span>
                ),
              )}
            </div>
            <div className="match-demo p-5 sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold text-primary-deep">
                    Pro matching example
                  </span>
                  <h2 className="mt-2 text-xl font-bold text-ink">
                    Backend Engineer
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Bengaluru · Hybrid
                  </p>
                </div>
                <div
                  className="match-score"
                  style={{ "--score": 86 } as CSSProperties}
                >
                  <span>86%</span>
                </div>
              </div>
              <div className="border-t border-slate-100 pt-4">
                <p className="mb-3 text-xs font-semibold text-slate-600">
                  Why it fits this example profile
                </p>
                {[
                  "Node.js and distributed systems",
                  "Aligned with 3 years of experience",
                  "Matches preferred location and work mode",
                ].map((x) => (
                  <p
                    key={x}
                    className="mb-2 flex items-center gap-2 text-sm text-slate-700"
                  >
                    <Icon
                      name="check"
                      className="h-4 w-4 shrink-0 text-primary"
                    />
                    {x}
                  </p>
                ))}
              </div>
            </div>
            <div className="relative mt-5 flex items-center gap-3 rounded-xl bg-white/75 p-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <Icon name="mail" className="h-4 w-4" />
              </span>
              <p className="text-xs leading-5 text-slate-600">
                <strong className="block font-semibold text-ink">
                  Up to 5 strong matches a day
                </strong>
                Daily shortlist: only 75%+ profile relevance. Never padded with
                weak matches.
              </p>
            </div>
            <p className="relative mt-4 text-center text-[11px] text-slate-600">
              Illustration only. Match scores describe relevance, not hiring
              probability.
            </p>
          </div>
        </div>
      </section>
      <div className="border-b border-slate-200 bg-white">
        <div className="page-container flex flex-wrap items-center justify-between gap-5 py-6">
          <p className="text-sm font-medium text-slate-600">
            {total > 0
              ? `${total} open tech roles across ${companies.length} companies`
              : "Tech roles from official company hiring sources"}
          </p>
          <div className="flex flex-wrap gap-5 text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-2">
              <Icon name="clock" className="h-4 w-4 text-primary" />
              Refreshed daily
            </span>
            <span className="flex items-center gap-2">
              <Icon name="external" className="h-4 w-4 text-primary" />
              Apply directly
            </span>
          </div>
        </div>
      </div>
      <section className="page-container py-14 sm:py-20">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-ink">
              Open doors. Real opportunities.
            </h2>
            <p className="mt-3 text-slate-600">
              Start with the latest roles from companies building in India.
            </p>
          </div>
          <Link href="/jobs" className="btn-secondary">
            View all jobs
            <Icon name="arrow" className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {jobs.length ? (
            jobs.map((job) => <JobCard key={job._id} job={job} />)
          ) : error ? (
            <div className="surface-panel col-span-full p-8 text-center">
              <p className="text-slate-600">
                Live openings are temporarily unavailable.
              </p>
              <Link href="/jobs" className="btn-secondary mt-4">
                Browse jobs
              </Link>
            </div>
          ) : (
            [1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-72 rounded-2xl" />
            ))
          )}
        </div>
        <div className="mt-7 flex flex-wrap gap-2">
          {TECH_TRACKS.map((t) => (
            <Link
              key={t.value}
              href={`/jobs?techTrack=${t.value}`}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 hover:border-primary hover:text-primary"
            >
              {t.label}
            </Link>
          ))}
        </div>
      </section>
      <section id="why" className="border-y border-slate-200 bg-white">
        <div className="page-container py-14 sm:py-20">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Less noise between you and your next role.
            </h2>
            <p className="mt-4 leading-relaxed text-slate-600">
              A job search should help you make progress. Every part of ReerHub
              has a clear job to do.
            </p>
          </div>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              [
                "shield",
                "Go straight to the source",
                "Openings come from official company career pages. When you apply, you go directly to the company.",
              ],
              [
                "bookmark",
                "Keep your search in one place",
                "Filter by role, location, and work mode. Save openings worth coming back to. All with a free account.",
              ],
              [
                "spark",
                "Put your profile to work",
                "Pro ranks roles by your skills and preferences, explains each match, and sends a focused daily shortlist.",
              ],
            ].map(([icon, title, copy]) => (
              <div key={title}>
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary-deep">
                  <Icon name={icon as "shield" | "bookmark" | "spark"} />
                </div>
                <h3 className="text-lg font-bold text-ink">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="page-container py-14 sm:py-20">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div className="py-4">
            <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Your search. Your pace.
            </h2>
            <p className="mt-4 max-w-lg leading-relaxed text-slate-600">
              Explore on your own with Free. Choose Pro when you want a ranked
              shortlist and stronger direction.
            </p>
            <div className="mt-7 space-y-4">
              {[
                "Free: full listings, official Apply links, filters, and saved jobs",
                "Pro: personalized ranked matches, reasons, and relevance feedback",
                "Pro: daily emails with up to 5 strong matches, easy to pause",
              ].map((x) => (
                <p
                  key={x}
                  className="flex items-start gap-3 text-sm leading-6 text-slate-600"
                >
                  <Icon
                    name="check"
                    className="mt-1 h-4 w-4 shrink-0 text-primary"
                  />
                  {x}
                </p>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-primary/20 bg-primary-soft p-7 sm:p-9">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-primary-deep">
                ReerHub Pro
              </span>
              <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-primary-deep">
                7-day trial
              </span>
            </div>
            <p className="my-5">
              <span className="font-display text-5xl font-bold tracking-tight text-ink">
                ₹149
              </span>
              <span className="text-slate-600"> / month</span>
            </p>
            <p className="text-sm leading-7 text-slate-600">
              A private match dashboard and a daily shortlist built around your
              profile. Your default shortlist starts at 75%+, with broader
              profile-ranked tiers available when you want to explore.
            </p>
            <Link href="/billing" className="btn-primary mt-6 w-full">
              Explore Pro plans
              <Icon name="arrow" className="h-4 w-4" />
            </Link>
            <p className="mt-4 text-center text-xs text-slate-600">
              Also available: ₹49/week or ₹299/quarter.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
