import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JobCard from "@/components/JobCard";
import { API_BASE, TECH_TRACKS } from "@/lib/reerhub";
import { companyTile, locationLabel, timeAgo } from "@/lib/format";

async function fetchJob(jobId: string) {
  const res = await fetch(`${API_BASE}/jobs/${jobId}`, { cache: "no-store" });
  if (res.status === 404) notFound();
  if (!res.ok) throw new Error("Could not load job");
  const json = await res.json();
  return json.data;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ jobId: string }>;
}): Promise<Metadata> {
  try {
    const { jobId } = await params;
    const job = await fetchJob(jobId);
    const companyName = job.companyId?.name || "Company";
    const title = `${job.title} at ${companyName} | ReerHub`;
    const description =
      `${job.title} (${job.techRole || "tech role"}) at ${companyName}` +
      `${job.locations?.[0]?.city ? ` in ${job.locations[0].city}` : ""}. ` +
      `Apply directly on the company's official site.`;
    return { title, description };
  } catch {
    return { title: "Job | ReerHub" };
  }
}

async function fetchRelatedJobs(companyId: string, excludeId: string) {
  try {
    const res = await fetch(`${API_BASE}/jobs?companyId=${companyId}&limit=4`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data ?? [])
      .filter((j: { _id: string }) => j._id !== excludeId)
      .slice(0, 3);
  } catch {
    return [];
  }
}

function Fact({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-[#F1F5F9] dark:border-white/10 last:border-0">
      <dt className="text-[13px] text-[#64748B] dark:text-[#94A3B8]">
        {label}
      </dt>
      <dd className="text-[13px] text-[#0F172A] dark:text-white font-semibold text-right">
        {value}
      </dd>
    </div>
  );
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  const job = await fetchJob(jobId);
  const company = job.companyId || {};
  const companyName: string = company.name || "Company";
  const posted = timeAgo(job.postedAt || job.firstSeenAt);
  const relatedJobs = company._id
    ? await fetchRelatedJobs(company._id, job._id || jobId)
    : [];

  const facts: { label: string; value?: string }[] = [
    {
      label: "Track",
      value: TECH_TRACKS.find((t) => t.value === job.techTrack)?.label,
    },
    { label: "Role", value: job.techRole },
    { label: "Location", value: locationLabel(job) },
    {
      label: "Work mode",
      value:
        job.remoteType && job.remoteType !== "unknown"
          ? job.remoteType
          : undefined,
    },
    { label: "Employment", value: job.employmentType },
    { label: "Department", value: job.department },
    { label: "Seniority", value: job.seniority },
    {
      label: "Posted",
      value: job.postedAt
        ? new Date(job.postedAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : posted || undefined,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <nav
        className="text-[13px] font-medium text-[#64748B] dark:text-[#94A3B8] mb-6 flex items-center gap-2"
        aria-label="Breadcrumb"
      >
        <Link
          href="/"
          className="hover:text-[#2563EB] dark:hover:text-[#60A5FA] transition-colors"
        >
          Jobs
        </Link>
        <span aria-hidden>/</span>
        {company.slug ? (
          <Link
            href={`/companies/${company.slug}`}
            className="hover:text-[#2563EB] dark:hover:text-[#60A5FA] transition-colors"
          >
            {companyName}
          </Link>
        ) : (
          <span>{companyName}</span>
        )}
        <span aria-hidden>/</span>
        <span className="text-[#0F172A] dark:text-white font-semibold truncate max-w-52 sm:max-w-xs">
          {job.title}
        </span>
      </nav>

      <div className="grid lg:grid-cols-[1fr_340px] gap-5 items-start">
        <article className="min-w-0">
          <div className="bg-white dark:bg-[#0B1A33] border border-[#E2E8F0] dark:border-white/10 rounded-xl p-6 sm:p-8 shadow-[0_1px_2px_rgba(15,23,42,0.04)] mb-4">
            <div className="flex items-center gap-4 mb-5">
              <span
                className={`w-12 h-12 rounded-[10px] ${companyTile()} flex items-center justify-center font-bold text-xl shrink-0`}
                aria-hidden
              >
                {companyName.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                {company.slug ? (
                  <Link
                    href={`/companies/${company.slug}`}
                    className="text-sm font-semibold text-[#2563EB] dark:text-[#60A5FA] hover:underline"
                  >
                    {companyName}
                  </Link>
                ) : (
                  <p className="text-sm font-semibold text-[#2563EB] dark:text-[#60A5FA]">
                    {companyName}
                  </p>
                )}
                {posted && (
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                    Posted {posted.toLowerCase()}
                  </p>
                )}
              </div>
              <span className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-[#047857] dark:text-[#34D399] bg-[#ECFDF5] dark:bg-[#10B981]/10 px-2.5 py-1 rounded-md shrink-0">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-[#10B981]"
                  aria-hidden
                />
                Active
              </span>
            </div>

            <h1 className="text-2xl sm:text-[32px] leading-[1.25] font-bold text-[#0F172A] dark:text-white tracking-tight mb-4">
              {job.title}
            </h1>

            <div className="flex flex-wrap gap-1.5">
              {(job.locations || []).map(
                (loc: { city?: string; state?: string }, i: number) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-md bg-[#F1F5F9] dark:bg-white/5 text-[#475569] dark:text-[#B6C2D2] text-[13px] font-medium"
                  >
                    {[loc.city, loc.state].filter(Boolean).join(", ") ||
                      "India"}
                  </span>
                ),
              )}
              {job.employmentType && (
                <span className="px-2.5 py-1 rounded-md bg-[#F1F5F9] dark:bg-white/5 text-[#475569] dark:text-[#B6C2D2] text-[13px] font-medium">
                  {job.employmentType}
                </span>
              )}
              {job.department && (
                <span className="px-2.5 py-1 rounded-md bg-[#F1F5F9] dark:bg-white/5 text-[#475569] dark:text-[#B6C2D2] text-[13px] font-medium">
                  {job.department}
                </span>
              )}
              {job.remoteType && job.remoteType !== "unknown" && (
                <span className="px-2.5 py-1 rounded-md bg-[#EFF6FF] dark:bg-[#2563EB]/15 text-[#2563EB] dark:text-[#60A5FA] text-[13px] font-semibold capitalize">
                  {job.remoteType}
                </span>
              )}
            </div>
          </div>

          {job.skills?.length > 0 && (
            <div className="bg-white dark:bg-[#0B1A33] border border-[#E2E8F0] dark:border-white/10 rounded-xl p-6 sm:p-8 shadow-[0_1px_2px_rgba(15,23,42,0.04)] mb-4">
              <h2 className="font-bold text-[#0F172A] dark:text-white text-[15px] mb-4">
                Skills
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {job.skills.map((skill: string) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 rounded-md bg-[#F1F5F9] dark:bg-white/5 text-[#475569] dark:text-[#B6C2D2] text-[13px] font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {job.description && (
            <div className="bg-white dark:bg-[#0B1A33] border border-[#E2E8F0] dark:border-white/10 rounded-xl p-6 sm:p-8 shadow-[0_1px_2px_rgba(15,23,42,0.04)] mb-4">
              <h2 className="font-bold text-[#0F172A] dark:text-white text-[15px] mb-4">
                About this role
              </h2>
              <div
                className="job-description"
                dangerouslySetInnerHTML={{ __html: job.description }}
              />
            </div>
          )}

          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] px-1">
            Sourced from the{" "}
            <a
              href={job.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#2563EB] dark:text-[#60A5FA] font-semibold underline underline-offset-2"
            >
              official listing
            </a>
            . Details may have changed — the company page is the source of
            truth.
          </p>

          {relatedJobs.length > 0 && (
            <section className="mt-8">
              <h2 className="font-bold text-[#0F172A] dark:text-white text-xl mb-4">
                More from {companyName}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {relatedJobs.map(
                  (related: React.ComponentProps<typeof JobCard>["job"]) => (
                    <JobCard key={related._id} job={related} />
                  ),
                )}
              </div>
            </section>
          )}
        </article>

        <aside className="lg:sticky lg:top-24 space-y-4">
          <div className="bg-[#07152E] text-white rounded-xl p-6 shadow-[0_4px_12px_rgba(15,23,42,0.08)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#2DD4BF] mb-2">
              Official application
            </p>
            <p className="text-sm text-white/70 leading-relaxed mb-5">
              You&apos;ll finish your application on {companyName}&apos;s own
              site. ReerHub never takes a cut or holds your data.
            </p>
            <a
              href={job.applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-[#2563EB] text-white rounded-lg font-semibold text-[15px] hover:bg-[#3B82F6] active:bg-[#1E40AF] transition-all"
            >
              Apply Now
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
                  d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                />
              </svg>
            </a>
          </div>

          <div className="bg-white dark:bg-[#0B1A33] border border-[#E2E8F0] dark:border-white/10 rounded-xl p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <h2 className="font-bold text-[#0F172A] dark:text-white text-[15px] mb-2">
              At a glance
            </h2>
            <dl>
              {facts.map((f) => (
                <Fact key={f.label} label={f.label} value={f.value} />
              ))}
            </dl>
            {company.slug && (
              <Link
                href={`/companies/${company.slug}`}
                className="mt-4 flex items-center justify-center w-full px-6 py-2.5 bg-white dark:bg-transparent border border-[#E2E8F0] dark:border-white/15 rounded-lg font-semibold text-sm text-[#2563EB] dark:text-[#60A5FA] hover:bg-[#F8FAFC] dark:hover:bg-white/5 transition-all"
              >
                More from {companyName}
              </Link>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
