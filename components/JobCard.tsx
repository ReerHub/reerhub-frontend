import Link from "next/link";
import CompanyLogo from "@/components/CompanyLogo";
import type { Job } from "@/lib/reerhub";
import { TECH_TRACKS } from "@/lib/reerhub";
import { locationLabel, timeAgo } from "@/lib/format";

function PinIcon() {
  return (
    <svg
      className="w-4 h-4"
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

function BriefIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0"
      />
    </svg>
  );
}

export default function JobCard({
  job,
  saved,
  showSave,
  onToggleSave,
}: {
  job: Job;
  saved?: boolean;
  showSave?: boolean;
  onToggleSave?: (jobId: string, saved: boolean) => void;
}) {
  const companyName = job.companyId?.name || "Company";
  const posted = timeAgo(job.postedAt || job.firstSeenAt);
  const trackLabel = TECH_TRACKS.find((t) => t.value === job.techTrack)?.label;

  return (
    <div className="relative">
      {showSave && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleSave?.(job._id, !saved);
          }}
          aria-label={saved ? "Remove saved job" : "Save job"}
          aria-pressed={!!saved}
          className={`absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            saved
              ? "bg-blue-600 text-white"
              : "bg-slate-100 text-slate-500 hover:text-slate-900"
          }`}
        >
          <svg
            className="w-4 h-4"
            fill={saved ? "currentColor" : "none"}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.472 48.472 0 0111.186 0z"
            />
          </svg>
        </button>
      )}
      <Link
        href={`/jobs/${job._id}`}
        className="group flex flex-col h-full bg-white border border-slate-200/80 rounded-2xl p-5 shadow-card hover:shadow-card-hover hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-200"
      >
        <div className="flex items-center gap-3 mb-3">
          <CompanyLogo
            name={companyName}
            logoUrl={job.companyId?.logoUrl}
            size="sm"
          />
          <div className="min-w-0">
            <h3 className="font-bold text-slate-900 text-[16px] leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
              {job.title}
            </h3>
            <p className="text-sm text-slate-500 font-medium truncate mt-0.5">
              {companyName}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-slate-500 mb-3.5">
          <span className="inline-flex items-center gap-1.5">
            <PinIcon />
            {locationLabel(job)}
          </span>
          {job.employmentType && (
            <span className="inline-flex items-center gap-1.5">
              <BriefIcon />
              {job.employmentType}
            </span>
          )}
          {job.remoteType && job.remoteType !== "unknown" && (
            <span className="capitalize">{job.remoteType}</span>
          )}
        </div>

        {(job.techRole ||
          trackLabel ||
          job.seniority ||
          job.department ||
          (job.skills && job.skills.length > 0)) && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {job.techRole && (
              <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold">
                {job.seniority
                  ? `${job.seniority} · ${job.techRole}`
                  : job.techRole}
              </span>
            )}
            {trackLabel && (
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium">
                {trackLabel}
              </span>
            )}
            {job.department && (
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium">
                {job.department}
              </span>
            )}
            {(job.skills || []).slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
          <span className="text-xs text-slate-400 font-medium">
            {posted ? `Posted ${posted.toLowerCase()}` : "Recently posted"}
          </span>
          <span className="shrink-0 text-sm font-semibold text-blue-600 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
            View job
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12l-7.5 7.5M21 12H3"
              />
            </svg>
          </span>
        </div>
      </Link>
    </div>
  );
}
