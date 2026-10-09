"use client";

import Link from "next/link";
import CompanyLogo from "@/components/CompanyLogo";
import type { Company } from "@/lib/reerhub";

// Infinite company marquee: exiting left, entering right, seamless loop.
// The track renders the list twice and shifts -50%; edge fades mask the seam.
// Pauses on hover/focus so cards stay clickable; static when reduced-motion.
export default function CompanyMarquee({
  companies,
}: {
  companies: Company[];
}) {
  if (companies.length === 0) return null;
  const loop = [...companies, ...companies];
  return (
    <div
      className="marquee overflow-hidden"
      role="list"
      aria-label="Hiring companies"
    >
      <div
        className="marquee-track flex gap-3 w-max py-1"
        style={{
          ["--marquee-duration" as string]: `${Math.max(24, companies.length * 6)}s`,
        }}
      >
        {loop.map((company, index) => (
          <Link
            key={`${company._id}-${index}`}
            href={`/companies/${company.slug}`}
            prefetch={false}
            role="listitem"
            aria-hidden={index >= companies.length}
            tabIndex={index >= companies.length ? -1 : 0}
            className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-5 py-4 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 hover:border-electric transition-all duration-200 w-64 shrink-0"
          >
            <CompanyLogo name={company.name} logoUrl={company.logoUrl} />
            <span className="min-w-0">
              <strong className="block text-slate-900 truncate">
                {company.name}
              </strong>
              <span className="text-sm text-slate-500">
                {company.activeJobs} live{" "}
                {company.activeJobs === 1 ? "role" : "roles"}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
