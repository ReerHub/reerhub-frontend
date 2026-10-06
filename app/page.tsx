"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import CompanyMarquee from "@/components/CompanyMarquee";
import CountUp from "@/components/CountUp";
import JobCard from "@/components/JobCard";
import Reveal from "@/components/Reveal";
import {
  listCompanies,
  listJobsWithMeta,
  type Company,
  type Job,
} from "@/lib/reerhub";

const steps = [
  ["Build your profile", "Add your role, skills, experience, and preferences."],
  ["See the fit", "We explain exactly why each official role fits you."],
  ["Apply with momentum", "Receive fresh top matches before they go stale."],
];

const stagger = (index: number) => ({ animationDelay: `${index * 90}ms` });

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  useEffect(() => {
    listJobsWithMeta({ limit: 3 })
      .then((data) => setJobs(data.jobs))
      .catch(() => {});
    listCompanies()
      .then(setCompanies)
      .catch(() => {});
  }, []);
  const hiring = companies.filter((company) => (company.activeJobs || 0) > 0);
  const totalRoles = hiring.reduce(
    (sum, company) => sum + (company.activeJobs || 0),
    0,
  );
  return (
    <div className="overflow-hidden">
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-14 grid lg:grid-cols-[1.05fr_.95fr] gap-12 items-center">
          <div>
            <p
              className="rise-in text-sm font-bold text-electric mb-5"
              style={stagger(0)}
            >
              Official tech roles, matched daily
            </p>
            <h1
              className="rise-in font-display text-4xl sm:text-6xl leading-[1.03] font-bold tracking-tight text-slate-900 max-w-xl"
              style={stagger(1)}
            >
              Your next engineering role, ranked for you.
            </h1>
            <p
              className="rise-in text-lg leading-relaxed text-slate-600 max-w-xl mt-6"
              style={stagger(2)}
            >
              ReerHub reads official company career pages, then highlights the
              India tech jobs that fit your skills, experience, and preferences.
            </p>
            <div
              className="rise-in flex flex-wrap gap-3 mt-8"
              style={stagger(3)}
            >
              <Link
                href="/login?next=/profile"
                className="px-6 py-3 bg-electric text-white rounded-xl font-semibold hover:bg-electric-dark hover:-translate-y-0.5 hover:shadow-card-hover active:translate-y-0 transition-all"
              >
                Build my profile
              </Link>
              <Link
                href="/jobs"
                className="px-6 py-3 border border-slate-300 text-slate-800 rounded-xl font-semibold hover:border-slate-500 hover:-translate-y-0.5 transition-all"
              >
                Preview live roles
              </Link>
            </div>
            <p
              className="rise-in text-sm text-slate-500 mt-4"
              style={stagger(4)}
            >
              Start free. Get 7 days of ReerHub Pro when you are ready for daily
              matches.
            </p>
          </div>
          <div
            className="rise-in relative"
            style={stagger(2)}
            aria-label="How ReerHub matches roles"
          >
            <div
              className="absolute -inset-8 bg-electric-soft rounded-[2.5rem] -z-10"
              aria-hidden
            />
            <div className="float-y bg-ink rounded-3xl p-6 sm:p-8 shadow-pop">
              <div className="flex justify-between items-center border-b border-white/10 pb-5">
                <span className="text-white font-bold">Your match today</span>
                <span className="text-xs font-bold bg-white/10 text-white px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                  <span
                    className="pulse-dot w-1.5 h-1.5 rounded-full bg-teal-300"
                    aria-hidden
                  />
                  Fresh role
                </span>
              </div>
              <div className="mt-6 bg-white rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-bold text-slate-900">Backend Engineer</p>
                    <p className="text-sm text-slate-500 mt-1">
                      Product company · Bengaluru hybrid
                    </p>
                  </div>
                  <span className="w-12 h-12 rounded-full bg-electric-soft text-electric font-bold flex items-center justify-center tabular-nums">
                    <CountUp end={86} />
                  </span>
                </div>
                <p className="text-xs font-bold text-electric mt-4">
                  <CountUp end={86} suffix="% FIT" />
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  Matches Node.js, distributed systems, 3 years experience, and
                  your work-mode preference.
                </p>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs">
                <span className="py-3 rounded-xl bg-white/10 text-white">
                  Profile
                </span>
                <span className="py-3 rounded-xl bg-electric text-white">
                  Fit score
                </span>
                <span className="py-3 rounded-xl bg-white/10 text-white">
                  Daily digest
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Reveal>
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="flex items-end justify-between gap-4 mb-7">
            <div>
              <p className="text-sm font-bold text-electric">Live right now</p>
              <h2 className="font-display text-3xl font-bold text-slate-900 mt-1">
                Fresh roles to explore
              </h2>
              <p className="text-sm text-slate-500 mt-2 tabular-nums">
                {hiring.length > 0 ? (
                  <>
                    <CountUp end={totalRoles} /> open India roles ·{" "}
                    <CountUp end={hiring.length} /> companies · refreshed daily
                  </>
                ) : (
                  "Loading live counts…"
                )}
              </p>
            </div>
            <Link
              className="text-sm font-bold text-electric shrink-0"
              href="/jobs"
            >
              Browse all roles
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {jobs.length
              ? jobs.map((job) => <JobCard key={job._id} job={job} />)
              : [0, 1, 2].map((id) => (
                  <div key={id} className="h-60 skeleton rounded-2xl" />
                ))}
          </div>
          <div className="mt-7 text-center">
            <Link
              href="/login?next=/jobs"
              className="inline-flex px-6 py-3 rounded-xl bg-electric text-white font-semibold hover:bg-electric-dark hover:-translate-y-0.5 hover:shadow-card-hover active:translate-y-0 transition-all"
            >
              Sign in to unlock full job details and apply links
            </Link>
          </div>
        </section>
      </Reveal>
      <section className="bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <Reveal>
            <p className="text-sm font-bold text-electric">
              A better job-search loop
            </p>
            <h2 className="font-display text-3xl font-bold text-slate-900 mt-1">
              Less searching. More relevant applications.
            </h2>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-8 mt-10">
            {steps.map(([title, copy], index) => (
              <Reveal key={title} delay={index * 120}>
                <span className="w-10 h-10 rounded-full bg-electric-soft text-electric font-bold inline-flex items-center justify-center tabular-nums">
                  {index + 1}
                </span>
                <h3 className="font-bold text-slate-900 text-lg mt-5">
                  {title}
                </h3>
                <p className="text-slate-600 leading-relaxed mt-2">{copy}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <Reveal>
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 grid lg:grid-cols-[1fr_.8fr] gap-10 items-center">
          <div>
            <p className="text-sm font-bold text-electric">
              Simple, honest pricing
            </p>
            <h2 className="font-display text-3xl font-bold text-slate-900 mt-1">
              Keep discovery free. Upgrade for the daily edge.
            </h2>
            <p className="text-slate-600 leading-relaxed mt-4 max-w-xl">
              Pro never promises an interview or selection. It gives you a
              transparent, explainable shortlist so you can focus your time on
              the roles that fit.
            </p>
          </div>
          <div className="bg-ink text-white rounded-3xl p-7 hover:shadow-card-hover transition-shadow">
            <p className="font-bold">ReerHub Pro</p>
            <p className="mt-3">
              <span className="font-display text-5xl font-bold tabular-nums">
                ₹149
              </span>
              <span className="text-white/60"> / month</span>
            </p>
            <p className="text-white/70 mt-3">
              7 days free, then daily top-five matches, fit explanations, and
              alert controls. Weekly ₹49 · Quarterly ₹299.
            </p>
            <Link
              href="/billing"
              className="mt-6 block text-center px-5 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-100 hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              Start free trial
            </Link>
          </div>
        </section>
      </Reveal>
      {hiring.length > 0 && (
        <Reveal>
          <section className="pb-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <p className="text-sm font-bold text-electric">
                Source integrity
              </p>
              <h2 className="font-display text-3xl font-bold text-slate-900 mt-1">
                Jobs from official company career pages
              </h2>
              <p className="text-sm text-slate-500 mt-2">
                Every role indexed from a company&apos;s own site — ride the
                loop to browse them all.
              </p>
            </div>
            <div className="mt-7">
              <CompanyMarquee companies={hiring} />
            </div>
          </section>
        </Reveal>
      )}
    </div>
  );
}
