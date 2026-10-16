import Link from "@/components/AppLink";
import CompanyLogo from "@/components/CompanyLogo";
import Icon from "@/components/ui/Icon";
import type { Job } from "@/lib/reerhub";
import { jobUrl, TECH_TRACKS } from "@/lib/reerhub";
import { cardSkills, experienceLabel, salaryLabel } from "@/lib/job-facts";
import JobFreshness from "@/components/JobFreshness";
import { locationLabel } from "@/lib/format";
export default function JobCard({
  job,
  saved,
  showSave,
  savePending,
  onToggleSave,
}: {
  job: Job;
  saved?: boolean;
  showSave?: boolean;
  savePending?: boolean;
  onToggleSave?: (jobId: string, saved: boolean) => void;
}) {
  const name = job.companyId?.name || "Company";
  const track = TECH_TRACKS.find((t) => t.value === job.techTrack)?.label;
  return (
    <article className="job-card">
      {showSave && (
        <button
          className="job-save"
          disabled={savePending}
          aria-busy={savePending}
          aria-label={saved ? `Unsave ${job.title}` : `Save ${job.title}`}
          aria-pressed={!!saved}
          onClick={() => onToggleSave?.(job._id, !saved)}
        >
          <Icon
            name="bookmark"
            fill={saved ? "currentColor" : "none"}
            className="h-4 w-4"
          />
        </button>
      )}
      <Link prefetch={false} href={jobUrl(job)} className="job-card-link group">
        <div className={`flex items-center gap-3 ${showSave ? "pr-12" : ""}`}>
          <CompanyLogo name={name} logoUrl={job.companyId?.logoUrl} />
          <div>
            <p className="text-sm font-semibold text-ink">{name}</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-teal-800">
              <Icon name="shield" className="h-3 w-3" />
              Official source
            </p>
          </div>
        </div>
        <h3 className="mb-3 mt-5 font-display text-lg font-bold leading-snug tracking-tight text-ink group-hover:text-primary">
          {job.title}
        </h3>
        <div className="flex flex-wrap gap-x-3 gap-y-2 text-sm text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <Icon name="pin" className="h-4 w-4" />
            {locationLabel(job)}
          </span>
          {job.remoteType && job.remoteType !== "unknown" && (
            <span className="capitalize">{job.remoteType}</span>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {[job.techRole || track, job.seniority, ...cardSkills(job)]
            .filter(Boolean)
            .map((label, i) => (
              <span
                key={`${label}-${i}`}
                className="rounded-md bg-surface px-2.5 py-1 text-xs font-medium text-slate-600"
              >
                {label}
              </span>
            ))}
        </div>
        {!!job.matchedSkills?.length && (
          <p className="mt-3 text-xs text-teal-800">
            Employer lists {job.matchedSkills.join(", ")}. Skill evidence, not a
            role match.
          </p>
        )}
        {experienceLabel(job) && (
          <p className="mt-2 text-sm text-slate-600">{experienceLabel(job)}</p>
        )}
        {salaryLabel(job.salary) && (
          <p className="mt-2 text-sm font-semibold text-ink">
            {salaryLabel(job.salary)}
          </p>
        )}
        {(job.department || job.externalJobId) && (
          <p className="mt-2 break-words text-xs text-slate-500">
            {[
              job.department,
              job.externalJobId
                ? `Posting reference ${job.externalJobId}`
                : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}
        <div
          className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs text-slate-600"
          style={{ marginTop: 24 }}
        >
          <JobFreshness job={job} />
          <span className="inline-flex items-center gap-2 font-semibold text-primary">
            View role
            <Icon name="arrow" className="h-4 w-4" />
          </span>
        </div>
      </Link>
    </article>
  );
}
