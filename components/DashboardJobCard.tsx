"use client";

import Image from "next/image";
import Link from "next/link";
import type { Job } from "@/lib/reerhub";
import { jobUrl } from "@/lib/reerhub";
import { locationLabel, timeAgo } from "@/lib/format";

const PASTELS = [
  "#FBE3CF",
  "#D6F0E2",
  "#E2E0FA",
  "#D9EAFB",
  "#F9DCE7",
  "#E7EBF1",
];

export function pastelFor(index: number): string {
  return PASTELS[index % PASTELS.length];
}

function formatDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function employmentLabel(raw?: string): string | null {
  if (!raw) return null;
  if (/full/i.test(raw)) return "Full time";
  return raw;
}

function remoteLabel(raw?: string): string | null {
  if (!raw || raw === "unknown") return null;
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export default function DashboardJobCard({
  job,
  index,
  saved,
  onToggleSave,
}: {
  job: Job;
  index: number;
  saved: boolean;
  onToggleSave: (jobId: string, next: boolean) => void;
}) {
  const companyName = job.companyId?.name || "Company";
  const chips = [
    employmentLabel(job.employmentType),
    job.seniority,
    remoteLabel(job.remoteType),
    job.techRole,
  ].filter(Boolean) as string[];

  return (
    <article className="bg-white rounded-3xl border border-slate-200/70 p-2 shadow-card hover:shadow-card-hover transition-all">
      <div
        className="rounded-2xl p-4 min-h-56 flex flex-col"
        style={{ backgroundColor: pastelFor(index) }}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="px-3 py-1 rounded-full bg-white/80 text-[13px] font-semibold text-slate-900">
            {formatDate(job.postedAt || job.firstSeenAt) || "New"}
          </span>
          <button
            onClick={() => onToggleSave(job._id, !saved)}
            aria-label={saved ? "Remove saved job" : "Save job"}
            aria-pressed={saved}
            className={`min-w-11 min-h-11 w-11 h-11 rounded-full flex items-center justify-center transition-all ${
              saved
                ? "bg-slate-900 text-white"
                : "bg-white/80 text-slate-700 hover:text-slate-900"
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
        </div>
        <p className="text-[15px] font-medium text-slate-900">{companyName}</p>
        <div className="flex items-start justify-between gap-3">
          <Link
            href={jobUrl(job)}
            className="font-display text-[22px] leading-tight font-bold text-slate-900 line-clamp-2 hover:underline underline-offset-4"
          >
            {job.title}
          </Link>
          <span className="w-11 h-11 rounded-full bg-white flex items-center justify-center shrink-0 overflow-hidden">
            {job.companyId?.logoUrl ? (
              <Image
                src={job.companyId.logoUrl}
                alt={`${companyName} logo`}
                width={28}
                height={28}
                loading="lazy"
                className="object-contain"
              />
            ) : (
              <span className="font-bold text-slate-900">
                {companyName.charAt(0).toUpperCase()}
              </span>
            )}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-4">
          {chips.slice(0, 4).map((chip) => (
            <span
              key={chip}
              className="px-3 py-1 rounded-full border border-slate-900/15 text-[13px] font-medium text-slate-900"
            >
              {chip}
            </span>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between px-3 py-3">
        <div className="min-w-0">
          <p className="text-[15px] font-semibold text-slate-900 truncate">
            {locationLabel(job)}
          </p>
          <p className="text-[13px] text-slate-400">
            {timeAgo(job.postedAt || job.firstSeenAt)
              ? `Posted ${timeAgo(job.postedAt || job.firstSeenAt).toLowerCase()}`
              : "Recently posted"}
          </p>
        </div>
        <Link
          href={jobUrl(job)}
          className="shrink-0 px-6 py-2 bg-electric text-white rounded-full text-sm font-semibold hover:bg-electric-dark transition-all"
        >
          Details
        </Link>
      </div>
    </article>
  );
}
