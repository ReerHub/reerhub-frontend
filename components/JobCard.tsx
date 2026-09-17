import Link from "next/link";
import type { Job } from "@/lib/reerhub";
import { TECH_TRACKS } from "@/lib/reerhub";
import { companyTile, locationLabel, timeAgo } from "@/lib/format";

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

export default function JobCard({ job }: { job: Job }) {
  const companyName = job.companyId?.name || "Company";
  const posted = timeAgo(job.postedAt || job.firstSeenAt);
  const trackLabel = TECH_TRACKS.find((t) => t.value === job.techTrack)?.label;

  return (
    <Link
      href={`/jobs/${job._id}`}
      className="group flex flex-col bg-white dark:bg-[#0B1A33] border border-[#E2E8F0] dark:border-white/10 rounded-xl p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:shadow-[0_4px_12px_rgba(15,23,42,0.08)] hover:border-[#CBD5E1] dark:hover:border-white/20 transition-all duration-150"
    >
      <div className="flex items-center gap-3 mb-4">
        <span
          className={`w-12 h-12 rounded-[10px] ${companyTile()} flex items-center justify-center font-bold text-xl shrink-0`}
          aria-hidden
        >
          {companyName.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <h3 className="font-bold text-[#0F172A] dark:text-white text-[17px] leading-snug line-clamp-2 group-hover:text-[#2563EB] dark:group-hover:text-[#60A5FA] transition-colors">
            {job.title}
          </h3>
          <p className="text-sm text-[#475569] dark:text-[#94A3B8] font-medium truncate mt-0.5">
            {companyName}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-[#64748B] dark:text-[#94A3B8] mb-4">
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
            <span className="px-2.5 py-1 rounded-md bg-[#EFF6FF] dark:bg-[#2563EB]/15 text-[#2563EB] dark:text-[#60A5FA] text-xs font-semibold">
              {job.seniority
                ? `${job.seniority} · ${job.techRole}`
                : job.techRole}
            </span>
          )}
          {trackLabel && (
            <span className="px-2.5 py-1 rounded-md bg-[#F1F5F9] dark:bg-white/5 text-[#475569] dark:text-[#B6C2D2] text-xs font-medium">
              {trackLabel}
            </span>
          )}
          {job.department && (
            <span className="px-2.5 py-1 rounded-md bg-[#F1F5F9] dark:bg-white/5 text-[#475569] dark:text-[#B6C2D2] text-xs font-medium">
              {job.department}
            </span>
          )}
          {(job.skills || []).slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="px-2.5 py-1 rounded-md bg-[#F1F5F9] dark:bg-white/5 text-[#475569] dark:text-[#B6C2D2] text-xs font-medium"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto pt-4 border-t border-[#E2E8F0] dark:border-white/10 flex items-center justify-between gap-2">
        <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
          {posted ? `Posted ${posted.toLowerCase()}` : "Recently posted"}
        </span>
        <span className="shrink-0 text-sm font-semibold text-[#2563EB] dark:text-[#60A5FA] inline-flex items-center gap-1 group-hover:gap-2 transition-all">
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
  );
}
