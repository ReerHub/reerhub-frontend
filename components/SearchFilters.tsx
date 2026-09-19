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
      className="w-5 h-5 text-slate-400"
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

function LocationIcon() {
  return (
    <svg
      className="w-5 h-5 text-slate-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 10.5c0 7.14-7.5 11.25-7.5 11.25S4.5 17.64 4.5 10.5a7.5 7.5 0 1115 0z"
      />
    </svg>
  );
}

function RoleIcon() {
  return (
    <svg
      className="w-5 h-5 text-slate-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
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
  onSubmit: (patch?: Partial<Filters>) => void;
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
  const useCompanySelect = companies.length > 10;
  const categoryOptions = [
    { value: "", label: "All tracks" },
    ...TECH_TRACKS,
  ] as const;

  const pillBase =
    "px-3.5 py-1.5 rounded-lg text-[13px] font-semibold transition-all whitespace-nowrap";
  const pillInactive = "text-slate-600 hover:bg-slate-100 hover:text-slate-900";
  const pillActive = "bg-electric text-white shadow-sm";

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-card">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="flex flex-col lg:flex-row gap-2.5"
      >
        <label className="flex items-center gap-2.5 flex-1 px-4 rounded-xl bg-slate-50 border border-slate-200 focus-within:border-electric-dark focus-within:ring-4 focus-within:ring-electric-dark/10 transition-all">
          <SearchIcon />
          <span className="sr-only">Search engineering and AI roles</span>
          <input
            value={filters.q}
            onChange={(e) => onChange({ q: e.target.value })}
            placeholder="Search SDE, React, ML, data…"
            className="w-full py-2.5 bg-transparent outline-none text-[15px] text-slate-900 placeholder:text-slate-400"
          />
        </label>
        <label className="flex items-center gap-2 px-4 rounded-xl bg-slate-50 border border-slate-200 focus-within:border-electric-dark focus-within:ring-4 focus-within:ring-electric-dark/10 transition-all sm:w-52">
          <LocationIcon />
          <span className="sr-only">Location</span>
          <input
            value={filters.city}
            onChange={(e) => onChange({ city: e.target.value })}
            placeholder="Location"
            className="w-full py-2.5 bg-transparent outline-none text-[15px] text-slate-900 placeholder:text-slate-400"
          />
        </label>
        <label className="flex items-center gap-2 px-4 rounded-xl bg-slate-50 border border-slate-200 focus-within:border-electric-dark focus-within:ring-4 focus-within:ring-electric-dark/10 transition-all sm:w-52">
          <RoleIcon />
          <span className="sr-only">Role (e.g. Backend Engineer)</span>
          <input
            value={filters.techRole}
            onChange={(e) => onChange({ techRole: e.target.value })}
            placeholder="Role"
            className="w-full py-2.5 bg-transparent outline-none text-[15px] text-slate-900 placeholder:text-slate-400"
          />
        </label>
        <button
          type="submit"
          className="px-8 py-2.5 bg-electric text-white rounded-xl text-[15px] font-semibold hover:bg-electric-dark active:bg-electric-deep transition-all shadow-sm"
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
              onClick={() =>
                onSubmit({ techTrack: opt.value as Filters["techTrack"] })
              }
              aria-pressed={filters.techTrack === opt.value}
              className={`${pillBase} ${
                filters.techTrack === opt.value ? pillActive : pillInactive
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <span
          className="w-px h-5 bg-slate-200 mx-1.5 hidden sm:block"
          aria-hidden
        />

        <button
          onClick={() => onSubmit({ companyId: "" })}
          aria-pressed={!filters.companyId}
          className={`${pillBase} ${
            !filters.companyId ? pillActive : pillInactive
          }`}
        >
          All companies
        </button>
        {useCompanySelect ? (
          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-[13px] font-semibold text-slate-600">
            <span className="sr-only">Company</span>
            <select
              value={filters.companyId}
              onChange={(e) => onSubmit({ companyId: e.target.value })}
              className="bg-transparent outline-none max-w-52 cursor-pointer text-slate-900"
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
                onClick={() => onSubmit({ companyId: active ? "" : c._id })}
                aria-pressed={active}
                className={`${pillBase} inline-flex items-center gap-1.5 ${
                  active ? pillActive : pillInactive
                }`}
              >
                {c.name}
                {typeof c.activeJobs === "number" && (
                  <span
                    className={`text-xs font-medium ${
                      active ? "text-white/80" : "text-slate-400"
                    }`}
                  >
                    {c.activeJobs}
                  </span>
                )}
              </button>
            );
          })
        )}

        <span
          className="w-px h-5 bg-slate-200 mx-1.5 hidden sm:block"
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
              onClick={() => onSubmit({ remoteType: opt.value })}
              aria-pressed={filters.remoteType === opt.value}
              className={`${pillBase} ${
                filters.remoteType === opt.value ? pillActive : pillInactive
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => onSubmit({ indiaOnly: !filters.indiaOnly })}
          aria-pressed={filters.indiaOnly}
          title="India-first feed: hide non-India roles"
          className={`${pillBase} ${
            filters.indiaOnly
              ? "bg-green-50 text-green-700 border border-green-200"
              : pillInactive
          }`}
        >
          {filters.indiaOnly ? "India only ✓" : "India only"}
        </button>

        {hasActive && (
          <button
            onClick={onClear}
            className="ml-auto text-[13px] font-semibold text-slate-500 hover:text-red-500 transition-colors underline underline-offset-4"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
