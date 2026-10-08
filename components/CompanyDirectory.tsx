"use client";
import Link from "next/link";
import { useState } from "react";
import CompanyLogo from "@/components/CompanyLogo";
import Icon from "@/components/ui/Icon";
import type { Company } from "@/lib/reerhub";
export default function CompanyDirectory({
  companies,
}: {
  companies: Company[];
}) {
  const [query, setQuery] = useState("");
  const [hiring, setHiring] = useState(false);
  const filtered = companies.filter(
    (c) =>
      `${c.name} ${c.industry || ""}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (!hiring || (c.activeJobs || 0) > 0),
  );
  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <label className="flex w-full max-w-md items-center gap-3 rounded-xl border border-slate-300 bg-white px-4">
          <Icon name="search" className="h-5 w-5 text-slate-600" />
          <span className="sr-only">Search companies or industries</span>
          <input
            className="w-full bg-transparent py-3.5 text-sm text-ink outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search companies or industries"
          />
        </label>
        <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={hiring}
            onChange={(e) => setHiring(e.target.checked)}
            className="h-4 w-4 accent-primary"
          />
          With open roles
        </label>
      </div>
      <p className="mb-5 text-xs font-medium text-slate-600" role="status">
        {filtered.length} {filtered.length === 1 ? "company" : "companies"}
      </p>
      <div className="discovery-grid grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c) => (
          <Link
            key={c._id}
            href={`/companies/${c.slug}`}
            className="company-card job-card group block p-6"
          >
            <div className="flex items-center gap-4">
              <CompanyLogo name={c.name} logoUrl={c.logoUrl} />
              <div className="min-w-0 break-words">
                <h2 className="text-lg font-bold text-ink group-hover:text-primary">
                  {c.name}
                </h2>
                <p className="mt-1 text-xs text-slate-600">
                  {c.industry || "Technology"}
                </p>
              </div>
            </div>
            <p className="my-5 flex items-center gap-1.5 text-xs text-teal-800">
              <Icon name="shield" className="h-4 w-4" />
              Official career page
            </p>
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-sm text-slate-600">
                <strong className="font-bold text-ink">
                  {c.activeJobs || 0}
                </strong>{" "}
                open roles
              </span>
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-primary">
                Explore
                <Icon name="arrow" className="h-4 w-4" />
              </span>
            </div>
          </Link>
        ))}
      </div>
      {!filtered.length && (
        <div className="surface-panel p-10 text-center">
          <h2 className="text-xl font-bold text-ink">No companies found.</h2>
          <p className="mt-3 text-sm text-slate-600">
            Try another name or show all companies.
          </p>
          <button
            className="btn-secondary mt-5"
            onClick={() => {
              setQuery("");
              setHiring(false);
            }}
          >
            Clear search
          </button>
        </div>
      )}
    </>
  );
}
