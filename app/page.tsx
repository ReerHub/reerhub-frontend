"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import CompanyLogo from "@/components/CompanyLogo";
import { listCompanies, type Company } from "@/lib/reerhub";

const WHY = [
  {
    title: "Pure tech, 9 tracks",
    body: "Software, AI/ML, data, cloud, mobile, security, QA, systems, and eng management. Non-tech listings never enter the database.",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.75}
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.348 14.652a3.75 3.75 0 010-5.304m5.304 0a3.75 3.75 0 010 5.304m-7.425 2.121a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.807-3.808-9.98 0-13.788m13.788 0c3.808 3.807 3.808 9.98 0 13.788"
        />
      </svg>
    ),
  },
  {
    title: "Official sources only",
    body: "Every role is indexed from a company's own career page or ATS — never scraped from aggregators.",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.75}
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13.303 5.092A6.75 6.75 0 1121.75 13.2v.3m-8.447-8.408a6.75 6.75 0 102.448 10.89.06.06 0 00.04-.088A15.387 15.387 0 0115.6 14.25m-8.41-8.4L21.75 21a.75.75 0 11-1.5 1.5l-8.41-8.4"
        />
      </svg>
    ),
  },
  {
    title: "Apply where it counts",
    body: "The Apply button always takes you to the official application page. No middlemen, no stale posts.",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.75}
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
        />
      </svg>
    ),
  },
];

export default function Home() {
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    listCompanies()
      .then(setCompanies)
      .catch(() => toast.error("Could not load companies"));
  }, []);

  const hiring = companies.filter((c) => (c.activeJobs ?? 0) > 0);
  const totalRoles = companies.reduce((sum, c) => sum + (c.activeJobs ?? 0), 0);

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-[#060B18]">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(700px 340px at 8% -80px, rgba(46,107,255,0.28), transparent), radial-gradient(620px 300px at 92% 12%, rgba(45,212,191,0.16), transparent), radial-gradient(480px 320px at 60% 120%, rgba(99,102,241,0.18), transparent)",
          }}
          aria-hidden
        />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-12 sm:pb-16 text-center">
          <p className="rise-in inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70 border border-white/15 bg-white/5 rounded-full px-4 py-1.5 mb-6">
            Engineering & AI roles only
          </p>
          <h1 className="rise-in font-display text-4xl sm:text-[52px] leading-[1.08] font-bold text-white tracking-tight mb-5 max-w-3xl mx-auto">
            Tech jobs from India&apos;s top product companies.
          </h1>
          <p className="rise-in text-white/70 text-base sm:text-lg mb-9 max-w-xl mx-auto leading-relaxed">
            SDE, AI/ML, data, cloud, mobile, security, and more — indexed daily
            from official career pages. Apply directly on the company site.
          </p>
          <div className="rise-in flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-3 bg-electric text-white rounded-xl font-semibold hover:bg-electric-dark active:bg-electric-deep transition-all shadow-[0_8px_24px_rgba(46,107,255,0.35)] text-center"
            >
              Get matched roles
            </Link>
            <div className="flex w-full sm:w-auto gap-3">
              <Link
                href="/engineering"
                className="flex-1 sm:flex-none px-6 py-3 bg-white/5 text-white border border-white/20 rounded-xl font-semibold hover:bg-white/10 transition-all text-center backdrop-blur-sm"
              >
                Engineering
              </Link>
              <Link
                href="/ai"
                className="flex-1 sm:flex-none px-6 py-3 bg-white/5 text-white border border-white/20 rounded-xl font-semibold hover:bg-white/10 transition-all text-center backdrop-blur-sm"
              >
                AI / ML
              </Link>
            </div>
          </div>

          {/* Live stat strip */}
          <div className="rise-in max-w-2xl mx-auto grid grid-cols-3 gap-3">
            {[
              {
                k: companies.length > 0 ? String(totalRoles) : "—",
                label: "Open India roles",
              },
              { k: String(companies.length), label: "Companies" },
              { k: "9", label: "Tech tracks" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 backdrop-blur-sm"
              >
                <p className="text-xl sm:text-2xl font-bold text-white">
                  {s.k}
                </p>
                <p className="text-[11px] uppercase tracking-wider text-white/50 mt-0.5">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Popular companies ── */}
      {hiring.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-14">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Hiring now
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Companies with open roles, refreshed daily.
              </p>
            </div>
            <Link
              href="/companies"
              className="text-sm font-semibold text-electric hover:text-electric-dark inline-flex items-center gap-1"
            >
              All companies
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12l-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {hiring.map((c) => (
              <Link
                key={c._id}
                href={`/companies/${c.slug}`}
                className="group flex items-center gap-4 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200"
              >
                <CompanyLogo name={c.name} logoUrl={c.logoUrl} />
                <span className="min-w-0">
                  <span className="block font-bold text-slate-900 group-hover:text-electric transition-colors truncate">
                    {c.name}
                  </span>
                  <span className="block text-sm text-slate-500">
                    {c.activeJobs ?? 0} open{" "}
                    {(c.activeJobs ?? 0) === 1 ? "role" : "roles"}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── How it works (marketing; jobs live behind login) ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-14">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            How ReerHub works
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Three steps from signup to shortlist.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              step: "1",
              title: "Create your profile",
              body: "Tell us your current role, track, skills, and preferred cities. Takes two minutes.",
            },
            {
              step: "2",
              title: "Get recommended roles",
              body: "Your dashboard prefills filters from your profile and shows matching India tech roles daily.",
            },
            {
              step: "3",
              title: "Apply on the company site",
              body: "Save roles to revisit, then apply directly on the official careers page. No middlemen.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-card"
            >
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-electric text-white font-bold text-sm mb-4">
                {item.step}
              </span>
              <h3 className="font-bold text-slate-900 text-[16px] mb-1.5">
                {item.title}
              </h3>
              <p className="text-slate-500 text-[15px] leading-relaxed">
                {item.body}
              </p>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link
            href="/signup"
            className="inline-block px-8 py-3 bg-electric text-white rounded-xl font-semibold hover:bg-electric-dark transition-all shadow-[0_8px_24px_rgba(46,107,255,0.35)]"
          >
            Create free account
          </Link>
          <p className="text-sm text-slate-500 mt-3">
            Already a member?{" "}
            <Link href="/login" className="text-electric font-semibold">
              Log in
            </Link>{" "}
            ·{" "}
            <Link href="/jobs" className="text-electric font-semibold">
              Browse public roles
            </Link>
          </p>
        </div>
      </section>

      {/* ── Why ReerHub ── */}
      <section
        id="why"
        className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 scroll-mt-20"
      >
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Why ReerHub
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Built like a developer tool — precise, current, and honest.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {WHY.map((item) => (
            <div
              key={item.title}
              className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-card"
            >
              <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-electric-soft text-electric mb-4">
                {item.icon}
              </span>
              <h3 className="font-bold text-slate-900 text-[16px] mb-1.5">
                {item.title}
              </h3>
              <p className="text-slate-500 text-[15px] leading-relaxed">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="bg-[#060B18] rounded-3xl px-6 sm:px-12 py-12 sm:py-16 text-center relative overflow-hidden">
          <div
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-[520px] h-52 rounded-full blur-3xl pointer-events-none"
            style={{ background: "rgba(46,107,255,0.22)" }}
            aria-hidden
          />
          <p className="relative text-xs font-semibold uppercase tracking-[0.2em] text-white/60 mb-3">
            Real Effective Engineering Roles Hub.
          </p>
          <h2 className="relative text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            Find roles. Build what&apos;s next.
          </h2>
          <p className="relative text-white/70 mb-8 max-w-md mx-auto leading-relaxed">
            Engineering and AI openings from top product companies — always on
            their official pages.
          </p>
          <Link
            href="/signup"
            className="relative inline-block px-8 py-3 bg-electric text-white rounded-xl font-semibold hover:bg-electric-dark transition-all shadow-[0_8px_24px_rgba(46,107,255,0.35)]"
          >
            Get started free
          </Link>
        </div>
      </section>
    </div>
  );
}
