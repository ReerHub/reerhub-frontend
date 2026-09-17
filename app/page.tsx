"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import JobBrowser from "@/components/JobBrowser";
import { listCompanies, type Company } from "@/lib/reerhub";
import { companyTile } from "@/lib/format";

const WHY = [
  {
    title: "Pure tech, 9 tracks",
    body: "Software, AI/ML, data, cloud, mobile, security, QA, systems, and eng management. Non-tech listings never enter the database.",
  },
  {
    title: "Official sources only",
    body: "Every role is indexed from a company's own career page or ATS — never scraped from aggregators.",
  },
  {
    title: "Apply where it counts",
    body: "The Apply button always takes you to the official application page. No middlemen, no stale posts.",
  },
];

export default function Home() {
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    listCompanies()
      .then(setCompanies)
      .catch(() => toast.error("Could not load companies"));
  }, []);

  return (
    <div>
      {/* ── Hero (navy) ── */}
      <section className="relative overflow-hidden bg-[#07152E]">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(600px 300px at 50% -50px, rgba(45,212,191,0.18), transparent), radial-gradient(500px 260px at 85% 20%, rgba(99,102,241,0.22), transparent)",
          }}
          aria-hidden
        />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-14 sm:pt-20 pb-10 text-center">
          <p className="rise-in inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#2DD4BF] border border-[#2DD4BF]/25 bg-[#2DD4BF]/5 rounded-full px-4 py-1.5 mb-5">
            Engineering & AI roles only
          </p>
          <h1 className="rise-in text-4xl sm:text-[48px] leading-[1.1] font-bold text-white tracking-tight mb-4">
            Tech jobs from India&apos;s top product companies.
          </h1>
          <p className="rise-in text-white/70 text-base sm:text-lg mb-8 max-w-xl mx-auto">
            SDE, AI/ML, data, cloud, mobile, security, and more — indexed daily
            from official career pages. Apply directly on the company site.
          </p>
          <div className="rise-in flex flex-col sm:flex-row items-center justify-center gap-2.5 mb-10">
            <a
              href="#jobs"
              className="w-full sm:w-auto px-8 py-3 bg-[#2563EB] text-white rounded-lg font-semibold hover:bg-[#1D4ED8] active:bg-[#1E40AF] transition-all"
            >
              Explore Tech Roles
            </a>
            <div className="flex w-full sm:w-auto gap-2.5">
              <Link
                href="/engineering"
                className="flex-1 sm:flex-none px-6 py-3 bg-transparent text-white border border-white/25 rounded-lg font-semibold hover:bg-white/10 transition-all text-center"
              >
                Engineering
              </Link>
              <Link
                href="/ai"
                className="flex-1 sm:flex-none px-6 py-3 bg-transparent text-white border border-white/25 rounded-lg font-semibold hover:bg-white/10 transition-all text-center"
              >
                AI / ML
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Popular companies ── */}
      {companies.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-12">
          <div className="flex items-end justify-between mb-5">
            <h2 className="text-2xl font-bold text-[#0F172A] dark:text-white">
              Hiring now
            </h2>
            <Link
              href="/companies"
              className="text-sm font-semibold text-[#2563EB] dark:text-[#60A5FA] hover:underline"
            >
              All companies
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {companies
              .filter((c) => (c.activeJobs ?? 0) > 0)
              .map((c) => (
                <Link
                  key={c._id}
                  href={`/companies/${c.slug}`}
                  className="group flex items-center gap-4 bg-white dark:bg-[#0B1A33] border border-[#E2E8F0] dark:border-white/10 rounded-xl p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:shadow-[0_4px_12px_rgba(15,23,42,0.08)] transition-all duration-150"
                >
                  <span
                    className={`w-12 h-12 rounded-[10px] ${companyTile()} flex items-center justify-center font-bold text-xl shrink-0`}
                    aria-hidden
                  >
                    {c.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-bold text-[#0F172A] dark:text-white group-hover:text-[#2563EB] dark:group-hover:text-[#60A5FA] transition-colors truncate">
                      {c.name}
                    </span>
                    <span className="block text-sm text-[#64748B] dark:text-[#94A3B8]">
                      {c.activeJobs ?? 0} open roles
                    </span>
                  </span>
                </Link>
              ))}
          </div>
        </section>
      )}

      {/* ── Latest jobs ── */}
      <section
        id="jobs"
        className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 scroll-mt-20"
      >
        <JobBrowser heading="Latest tech roles" />
      </section>

      {/* ── Why ReerHub ── */}
      <section
        id="why"
        className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 scroll-mt-20"
      >
        <h2 className="text-2xl font-bold text-[#0F172A] dark:text-white mb-5">
          Why ReerHub
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {WHY.map((item) => (
            <div
              key={item.title}
              className="bg-white dark:bg-[#0B1A33] border border-[#E2E8F0] dark:border-white/10 rounded-xl p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
            >
              <h3 className="font-semibold text-[#0F172A] dark:text-white text-[17px] mb-2">
                {item.title}
              </h3>
              <p className="text-[#475569] dark:text-[#B6C2D2] text-[15px] leading-relaxed">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="bg-[#07152E] rounded-2xl px-6 sm:px-12 py-12 text-center relative overflow-hidden">
          <div
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-48 rounded-full blur-3xl pointer-events-none"
            style={{ background: "rgba(45,212,191,0.20)" }}
            aria-hidden
          />
          <p className="relative text-xs font-bold uppercase tracking-[0.2em] text-[#2DD4BF] mb-3">
            Real Effective Engineering Roles Hub.
          </p>
          <h2 className="relative text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            Find roles. Build what&apos;s next.
          </h2>
          <p className="relative text-white/70 mb-8 max-w-md mx-auto">
            Engineering and AI openings from top product companies — always on
            their official pages.
          </p>
          <a
            href="#jobs"
            className="relative inline-block px-8 py-3 bg-[#2563EB] text-white rounded-lg font-semibold hover:bg-[#3B82F6] transition-all"
          >
            Explore Tech Roles
          </a>
        </div>
      </section>
    </div>
  );
}
