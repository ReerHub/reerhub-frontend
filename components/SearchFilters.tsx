"use client";

import type { Company, TechTrack } from "@/lib/reerhub";
import { TECH_TRACKS } from "@/lib/reerhub";

export type Filters = {
  q: string;
  companyId: string;
  city: string;
  remoteType: string;
  techTrack: "" | TechTrack;
  techRole: string;
  skills: string;
  indiaOnly: boolean;
};

function SearchIcon() {
  return (
    <svg
      className="w-5 h-5 text-[#64748B]"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
      />
    </svg>
  );
}

export default function SearchFilters({
  filters,
  companies,
  onChange,
  onSubmit,
  onClear,
}: {
  filters: Filters;
  companies: Company[];
  onChange: (patch: Partial<Filters>) => void;
  onSubmit: () => void;
  onClear: () => void;
}) {
  const hasActive =
    filters.q ||
    filters.companyId ||
    filters.city ||
    filters.remoteType ||
    filters.techTrack ||
    filters.techRole ||
    filters.skills ||
    !filters.indiaOnly;
  const remoteOptions = [
    { value: "", label: "Any mode" },
    { value: "onsite", label: "Onsite" },
    { value: "hybrid", label: "Hybrid" },
    { value: "remote", label: "Remote" },
  ];
  // Scale guardrail: per-company pills break past ~10 companies, so large
  // corpuses get a compact dropdown instead. Same filter semantics.
  const useCompanySelect = companies.length > 10;
  const categoryOptions = [
    { value: "", label: "All tracks" },
    ...TECH_TRACKS,
  ] as const;

  return (
    <div className="bg-white dark:bg-[#0B1A33] border border-[#E2E8F0] dark:border-white/10 rounded-2xl p-4 sm:p-5 shadow-[0_4px_12px_rgba(15,23,42,0.08)]">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="flex flex-col sm:flex-row gap-2"
      >
        <label className="flex items-center gap-2.5 flex-1 px-4 rounded-lg bg-white dark:bg-[#060D1D] border border-[#E2E8F0] dark:border-white/10 focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-[#2563EB]/15 transition-all">
          <SearchIcon />
          <span className="sr-only">Search engineering and AI roles</span>
          <input
            value={filters.q}
            onChange={(e) => onChange({ q: e.target.value })}
            placeholder="Search SDE, React, ML, data…"
            className="w-full py-2.5 bg-transparent outline-none text-[15px] text-[#0F172A] dark:text-white placeholder:text-[#94A3B8]"
          />
        </label>
        <label className="flex items-center gap-2 px-4 rounded-lg bg-white dark:bg-[#060D1D] border border-[#E2E8F0] dark:border-white/10 focus-within:border-[#2563EB] transition-all sm:w-52">
          <span className="sr-only">Location</span>
          <input
            value={filters.city}
            onChange={(e) => onChange({ city: e.target.value })}
            placeholder="Location"
            className="w-full py-2.5 bg-transparent outline-none text-[15px] text-[#0F172A] dark:text-white placeholder:text-[#94A3B8]"
          />
        </label>
        <label className="flex items-center gap-2 px-4 rounded-lg bg-white dark:bg-[#060D1D] border border-[#E2E8F0] dark:border-white/10 focus-within:border-[#2563EB] transition-all sm:w-52">
          <span className="sr-only">Role (e.g. Backend Engineer)</span>
          <input
            value={filters.techRole}
            onChange={(e) => onChange({ techRole: e.target.value })}
            placeholder="Role"
            className="w-full py-2.5 bg-transparent outline-none text-[15px] text-[#0F172A] dark:text-white placeholder:text-[#94A3B8]"
          />
        </label>
        <button
          type="submit"
          className="px-8 py-2.5 bg-[#2563EB] text-white rounded-lg text-[15px] font-semibold hover:bg-[#1D4ED8] active:bg-[#1E40AF] transition-all"
        >
          Search
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-1.5 mt-3.5">
        <div
          className="flex items-center gap-1 overflow-x-auto pb-1 -mb-1 max-w-full"
          role="group"
          aria-label="Tech track"
        >
          {categoryOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange({ techTrack: opt.value as Filters["techTrack"] });
                onSubmit();
              }}
              aria-pressed={filters.techTrack === opt.value}
              className={`px-3.5 py-1.5 rounded-md text-[13px] font-semibold transition-all whitespace-nowrap ${
                filters.techTrack === opt.value
                  ? "bg-[#2563EB] text-white dark:bg-[#2563EB]"
                  : "text-[#64748B] hover:bg-[#F1F5F9] dark:text-[#94A3B8] dark:hover:bg-white/5"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <span
          className="w-px h-5 bg-[#E2E8F0] dark:bg-white/10 mx-1 hidden sm:block"
          aria-hidden
        />

        <button
          onClick={() => {
            onChange({ companyId: "" });
            onSubmit();
          }}
          aria-pressed={!filters.companyId}
          className={`px-3.5 py-1.5 rounded-md text-[13px] font-semibold transition-all ${
            !filters.companyId
              ? "bg-[#EFF6FF] text-[#2563EB] dark:bg-[#2563EB]/15 dark:text-[#60A5FA]"
              : "text-[#64748B] hover:bg-[#F1F5F9] dark:text-[#94A3B8] dark:hover:bg-white/5"
          }`}
        >
          All companies
        </button>
        {useCompanySelect ? (
          <label className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white dark:bg-[#060D1D] border border-[#E2E8F0] dark:border-white/10 text-[13px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
            <span className="sr-only">Company</span>
            <select
              value={filters.companyId}
              onChange={(e) => {
                onChange({ companyId: e.target.value });
                onSubmit();
              }}
              className="bg-transparent outline-none max-w-52 cursor-pointer text-[#0F172A] dark:text-white"
            >
              <option value="">Select company…</option>
              {companies.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                  {typeof c.activeJobs === "number" ? ` (${c.activeJobs})` : ""}
                </option>
              ))}
            </select>
          </label>
        ) : (
          companies.map((c) => {
            const active = filters.companyId === c._id;
            return (
              <button
                key={c._id}
                onClick={() => {
                  onChange({ companyId: active ? "" : c._id });
                  onSubmit();
                }}
                aria-pressed={active}
                className={`px-3.5 py-1.5 rounded-md text-[13px] font-semibold transition-all inline-flex items-center gap-1.5 ${
                  active
                    ? "bg-[#EFF6FF] text-[#2563EB] dark:bg-[#2563EB]/15 dark:text-[#60A5FA]"
                    : "text-[#64748B] hover:bg-[#F1F5F9] dark:text-[#94A3B8] dark:hover:bg-white/5"
                }`}
              >
                {c.name}
                {typeof c.activeJobs === "number" && (
                  <span className="text-xs font-medium opacity-70">
                    {c.activeJobs}
                  </span>
                )}
              </button>
            );
          })
        )}

        <span
          className="w-px h-5 bg-[#E2E8F0] dark:bg-white/10 mx-1 hidden sm:block"
          aria-hidden
        />

        <div
          className="flex items-center gap-1"
          role="group"
          aria-label="Work mode"
        >
          {remoteOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange({ remoteType: opt.value });
                onSubmit();
              }}
              aria-pressed={filters.remoteType === opt.value}
              className={`px-3.5 py-1.5 rounded-md text-[13px] font-semibold transition-all ${
                filters.remoteType === opt.value
                  ? "bg-[#EFF6FF] text-[#2563EB] dark:bg-[#2563EB]/15 dark:text-[#60A5FA]"
                  : "text-[#64748B] hover:bg-[#F1F5F9] dark:text-[#94A3B8] dark:hover:bg-white/5"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            onChange({ indiaOnly: !filters.indiaOnly });
            onSubmit();
          }}
          aria-pressed={filters.indiaOnly}
          title="India-first feed: hide non-India roles"
          className={`px-3.5 py-1.5 rounded-md text-[13px] font-semibold transition-all ${
            filters.indiaOnly
              ? "bg-[#ECFDF5] text-[#047857] dark:bg-[#10B981]/10 dark:text-[#34D399]"
              : "text-[#64748B] hover:bg-[#F1F5F9] dark:text-[#94A3B8] dark:hover:bg-white/5"
          }`}
        >
          {filters.indiaOnly ? "India only ✓" : "India only"}
        </button>

        {hasActive && (
          <button
            onClick={onClear}
            className="ml-auto text-[13px] font-semibold text-[#64748B] dark:text-[#94A3B8] hover:text-[#EF4444] transition-colors underline underline-offset-4"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
