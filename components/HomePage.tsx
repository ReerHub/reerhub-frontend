"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useAuth } from "@/components/AuthProvider";
import JobCard from "@/components/JobCard";
import Icon from "@/components/ui/Icon";
import CompanyLogo from "@/components/CompanyLogo";
import MatchJourney from "@/components/MatchJourney";
import { topHiringCompanies } from "@/lib/home-companies";
import styles from "./HomePage.module.css";
import {
  listCompanies,
  listJobsWithMeta,
  TECH_TRACKS,
  type Company,
  type Job,
} from "@/lib/reerhub";
export default function HomePage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const scoreRef = useRef<HTMLDivElement>(null);
  const [scoreVisible, setScoreVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setScoreVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    if (scoreRef.current) observer.observe(scoreRef.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    let cancelled = false;
    Promise.all([listJobsWithMeta({ limit: 3 }), listCompanies()])
      .then(([data, companies]) => {
        if (cancelled) return;
        setJobs(data.jobs);
        setCompanies(companies);
        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  const total = companies.reduce((sum, c) => sum + (c.activeJobs || 0), 0);
  const featuredCompanies = topHiringCompanies(companies);
  return (
    <div className={styles.home}>
      <section className={`${styles.hero} border-b border-slate-200 bg-white`}>
        <div
          className={`${styles.heroGrid} page-container grid items-center py-14 lg:py-20`}
        >
          <div className={`${styles.heroCopy} rise-in`}>
            <div
              className={`${styles.heroLabel} mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold`}
            >
              <Icon name="shield" className="h-4 w-4" />
              OFFICIAL OPENINGS. PERSONALIZED DIRECTION.
            </div>
            <h1 className="font-display font-bold text-ink">
              Your next role.
              <br />
              <span className={styles.highlight}>A better way to find it.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-600">
              Less searching in circles. More moving forward. Discover India’s
              tech openings, or let Pro build a shortlist around you.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/jobs" className="btn-primary">
                Discover jobs
                <Icon name="arrow" className="h-4 w-4" />
              </Link>
              <Link
                href={user ? "/dashboard" : "/login?next=/dashboard"}
                className="btn-secondary"
              >
                {user ? "Open my dashboard" : "Start for free"}
              </Link>
            </div>
            <p className="mt-4 text-xs leading-6 text-slate-600">
              Public job details. Official Apply links. No middlemen.
            </p>
          </div>
          <div
            className="hero-canvas rise-in"
            style={{ animationDelay: "140ms" }}
          >
            <div
              className={`${styles.previewHeader} relative mb-5 flex items-center justify-between`}
            >
              <h2 className="font-display font-bold text-ink">
                From open opportunities to your shortlist
              </h2>
              <span className={styles.previewBadge}>PRO</span>
            </div>
            <MatchJourney companies={companies} />
            <div className={styles.resultGrid}>
              <div className="match-demo p-5 sm:p-6">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold text-primary-deep">
                      Illustrative Pro match
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
                    ref={scoreRef}
                    data-visible={scoreVisible}
                    style={{ "--score": 86 } as CSSProperties}
                  >
                    <svg
                      className={styles.scoreRing}
                      viewBox="0 0 72 72"
                      aria-hidden="true"
                    >
                      <circle
                        cx="36"
                        cy="36"
                        r="32"
                        fill="none"
                        stroke="#EEECFF"
                        strokeWidth="5"
                      />
                      <circle
                        className={styles.scoreArc}
                        cx="36"
                        cy="36"
                        r="32"
                        fill="none"
                        stroke="#4F46E5"
                        strokeWidth="5"
                        pathLength="100"
                        strokeDasharray="86 100"
                        transform="rotate(-90 36 36)"
                      />
                    </svg>
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
              <div className={styles.digestPreview}>
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <Icon name="mail" className="h-5 w-5" />
                </span>
                <p className="mt-5 text-xs font-semibold text-primary-deep">
                  LESS SEARCHING. MORE DIRECTION.
                </p>
                <h2 className="mt-2 font-display text-3xl font-bold text-ink">
                  Your daily shortlist.
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Up to five of your strongest matches, together in one daily
                  email—only when we find roles with 75%+ profile relevance.
                </p>
                <ul className="mt-4 space-y-3 text-sm text-slate-700">
                  <li className="flex gap-2">
                    <Icon
                      name="check"
                      className="h-4 w-4 shrink-0 text-primary"
                    />
                    Never padded with weak matches
                  </li>
                  <li className="flex gap-2">
                    <Icon
                      name="check"
                      className="h-4 w-4 shrink-0 text-primary"
                    />
                    See more ranked roles and filter on your dashboard
                  </li>
                  <li className="flex gap-2">
                    <Icon
                      name="check"
                      className="h-4 w-4 shrink-0 text-primary"
                    />
                    Pause emails whenever you want
                  </li>
                </ul>
                <Link href="/billing" className="btn-primary mt-6">
                  See Pro plans
                  <Icon name="arrow" className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className={`${styles.sources} border-b border-slate-200 bg-white`}>
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
      <section
        className={`${styles.companySection} page-container`}
        aria-labelledby="hiring-companies-title"
      >
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className={styles.eyebrow}>
              THE OPENINGS ARE REAL. THE SOURCE IS OFFICIAL.
            </p>
            <h2
              id="hiring-companies-title"
              className="mt-3 font-display text-3xl font-bold text-ink"
            >
              Find your next role at the source.
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Companies with the most current openings in our directory. Not
              partners or endorsements.
            </p>
          </div>
          <Link href="/companies" className="btn-secondary">
            Explore all companies
            <Icon name="arrow" className="h-4 w-4" />
          </Link>
        </div>
        {featuredCompanies.length ? (
          <div
            className={styles.companyGrid}
            style={
              {
                "--company-columns": Math.min(8, featuredCompanies.length),
              } as CSSProperties
            }
          >
            {featuredCompanies.map((company) => (
              <Link
                key={company._id}
                href={`/companies/${company.slug}`}
                className={styles.companyTile}
              >
                <CompanyLogo name={company.name} logoUrl={company.logoUrl} />
                <strong>{company.name}</strong>
                <span>
                  {company.activeJobs}{" "}
                  {company.activeJobs === 1 ? "opening" : "openings"}
                  <Icon name="arrow" className="h-3.5 w-3.5" />
                </span>
              </Link>
            ))}
          </div>
        ) : !loaded && !error ? (
          <div
            className={styles.companyGrid}
            aria-label="Loading hiring companies"
            aria-busy="true"
          >
            {Array.from({ length: 8 }, (_, index) => (
              <div key={index} className="skeleton h-36" />
            ))}
          </div>
        ) : (
          <div className="surface-panel p-6 text-sm text-slate-600">
            {error
              ? "Company opening counts are temporarily unavailable. Browse the directory to try again."
              : "No companies have current openings to highlight. Our directory is still available."}
          </div>
        )}
        <div className={styles.coverageStats}>
          <p>
            <strong>{loaded ? total.toLocaleString("en-IN") : "—"}</strong>
            <span>current openings</span>
          </p>
          <p>
            <strong>{loaded ? companies.length : "—"}</strong>
            <span>companies in our directory</span>
          </p>
          <p>
            <Icon name="shield" className="h-5 w-5 text-primary" />
            <span>
              Official sources.
              <br />
              Apply directly.
            </span>
          </p>
        </div>
      </section>
      <section className={`${styles.openings} page-container py-14 sm:py-20`}>
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-ink">
              Open roles. Real possibilities.
            </h2>
            <p className="mt-3 text-slate-600">
              A few current openings to get you moving.
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
          ) : loaded ? (
            <div
              className="surface-panel col-span-full p-8 text-center"
              role="status"
            >
              <h3 className="text-lg font-semibold text-ink">
                New opportunities are on their way.
              </h3>
              <p className="mt-2 text-slate-600">
                Explore company career sources while fresh openings arrive.
              </p>
              <Link href="/companies" className="btn-secondary mt-4">
                Explore companies
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
        {!user && (
          <p className={styles.browseNote}>
            Preview openings freely.{" "}
            <Link href="/login?next=/jobs">Create a free account</Link> for full
            browsing and saved jobs.
          </p>
        )}
      </section>
      <section
        id="why"
        className={`${styles.benefits} border-y border-slate-200 bg-white`}
      >
        <div
          className={`${styles.benefitsInner} page-container py-14 sm:py-20`}
        >
          <div className="max-w-xl">
            <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Your job search, with the noise turned down.
            </h2>
            <p className="mt-4 leading-relaxed text-slate-600">
              A job search should help you make progress. Every part of ReerHub
              has a clear job to do.
            </p>
          </div>
          <div
            className={`${styles.benefitGrid} mt-10 grid gap-8 md:grid-cols-3`}
          >
            {[
              [
                "shield",
                "Start at the source.",
                "Openings come from official company career pages. When you apply, you go directly to the company.",
              ],
              [
                "bookmark",
                "Make it your search.",
                "Filter by role, location, and work mode. Save openings worth coming back to. All with a free account.",
              ],
              [
                "spark",
                "Let the right roles find you.",
                "Pro ranks roles by your skills and preferences, explains each match, and sends a focused daily shortlist.",
              ],
            ].map(([icon, title, copy]) => (
              <div key={title} className={styles.benefit}>
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
      <section className={`${styles.plans} page-container py-14 sm:py-20`}>
        <div className={`${styles.planGrid} grid gap-8 lg:grid-cols-[1fr_1fr]`}>
          <div className="py-4">
            <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Discovery is free. Direction is Pro.
            </h2>
            <p className="mt-4 max-w-lg leading-relaxed text-slate-600">
              Start with the essentials. Add personalized career intelligence
              when you’re ready. You’re always in control of where you apply.
            </p>
            <div className="mt-7 space-y-4">
              {[
                "Public: full job details and official Apply links",
                "Free account: complete browsing, filters, profile and saved jobs",
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
            <Link
              href={user ? "/dashboard" : "/login?next=/dashboard"}
              className="btn-secondary mt-8"
            >
              {user ? "Open my dashboard" : "Start your free search"}
              <Icon name="arrow" />
            </Link>
          </div>
          <div
            className={`${styles.proPromotion} rounded-3xl border p-7 sm:p-9`}
          >
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
            <Link
              href={user?.membership?.isPro ? "/dashboard" : "/billing"}
              className="btn-primary mt-6 w-full"
            >
              {user?.membership?.isPro
                ? "Open my Pro dashboard"
                : "Explore Pro plans"}
              <Icon name="arrow" className="h-4 w-4" />
            </Link>
            <p className="mt-4 text-center text-xs text-slate-600">
              Also available: ₹49/week or ₹299/quarter.
            </p>
            <p className={styles.policy}>
              Subscription payments are non-refundable. Cancel to stop future
              renewals and keep Pro through your access period. Cancel during
              the trial to prevent the first recurring charge.
            </p>
          </div>
        </div>
      </section>
      <section className={styles.closing}>
        <div className="page-container">
          <div>
            <p className={styles.eyebrow}>YOUR NEXT CHAPTER IS OUT THERE</p>
            <h2>
              Make your next move
              <br />a more informed one.
            </h2>
            <p>
              Official openings first. Personalized direction when you need it.
            </p>
          </div>
          <Link href="/jobs" className="btn-primary">
            Find my next role
            <Icon name="arrow" />
          </Link>
        </div>
      </section>
    </div>
  );
}
