import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DOMPurify from "isomorphic-dompurify";
import CompanyLogo from "@/components/CompanyLogo";
import JobCard from "@/components/JobCard";
import {
  getJob,
  listJobsWithMeta,
  NotFoundError,
  TECH_TRACKS,
  type Job,
} from "@/lib/reerhub";
import { locationLabel, timeAgo } from "@/lib/format";

async function fetchJob(jobId: string): Promise<Job> {
  try {
    return await getJob(jobId);
  } catch (err) {
    if (err instanceof NotFoundError) notFound();
    throw err;
  }
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
    const jobs = await listJobsWithMeta({ companyId, limit: 4 });
    return jobs.jobs.filter((j) => j._id !== excludeId).slice(0, 3);
  } catch {
    return [];
  }
}

function Fact({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-slate-100 last:border-0">
      <dt className="text-[13px] text-slate-500">{label}</dt>
      <dd className="text-[13px] text-slate-900 font-semibold text-right">
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
  const sanitizedDescription = job.description
    ? DOMPurify.sanitize(job.description)
    : "";

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "JobPosting",
            title: job.title,
            description: job.description
              ?.replace(/<[^>]*>/g, " ")
              .slice(0, 5000),
            datePosted: job.postedAt || job.firstSeenAt,
            employmentType: job.employmentType,
            hiringOrganization: {
              "@type": "Organization",
              name: companyName,
              sameAs: company.website,
              logo: company.logoUrl,
            },
            jobLocation:
              job.locations?.length > 0
                ? job.locations.map((l) => ({
                    "@type": "Place",
                    address: {
                      "@type": "PostalAddress",
                      addressLocality: l.city,
                      addressRegion: l.state,
                      addressCountry: l.country || "IN",
                    },
                  }))
                : undefined,
            directApply: true,
          }),
        }}
      />
      <nav
        className="text-[13px] font-medium text-slate-500 mb-6 flex items-center gap-2 flex-wrap"
        aria-label="Breadcrumb"
      >
        <Link href="/" className="hover:text-blue-600 transition-colors">
          Jobs
        </Link>
        <span aria-hidden className="text-slate-300">
          /
        </span>
        {company.slug ? (
          <Link
            href={`/companies/${company.slug}`}
            className="hover:text-blue-600 transition-colors"
          >
            {companyName}
          </Link>
        ) : (
          <span>{companyName}</span>
        )}
        <span aria-hidden className="text-slate-300">
          /
        </span>
        <span className="text-slate-900 font-semibold truncate max-w-52 sm:max-w-xs">
          {job.title}
        </span>
      </nav>

      <div className="grid lg:grid-cols-[1fr_340px] gap-5 items-start">
        <article className="min-w-0">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-card mb-4">
            <div className="flex items-center gap-4 mb-5">
              <CompanyLogo
                name={companyName}
                logoUrl={job.companyId?.logoUrl}
              />
              <div className="min-w-0">
                {company.slug ? (
                  <Link
                    href={`/companies/${company.slug}`}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-500"
                  >
                    {companyName}
                  </Link>
                ) : (
                  <p className="text-sm font-semibold text-blue-600">
                    {companyName}
                  </p>
                )}
                {posted && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    Posted {posted.toLowerCase()}
                  </p>
                )}
              </div>
              <span className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg shrink-0">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                  aria-hidden
                />
                Active
              </span>
            </div>

            <h1 className="text-2xl sm:text-[32px] leading-[1.25] font-bold text-slate-900 tracking-tight mb-4">
              {job.title}
            </h1>

            <div className="flex flex-wrap gap-1.5">
              {(job.locations || []).map(
                (loc: { city?: string; state?: string; country?: string }) => (
                  <span
                    key={[loc.city, loc.state, loc.country].join(",")}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[13px] font-medium"
                  >
                    {[loc.city, loc.state].filter(Boolean).join(", ") ||
                      "India"}
                  </span>
                ),
              )}
              {job.employmentType && (
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[13px] font-medium">
                  {job.employmentType}
                </span>
              )}
              {job.department && (
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[13px] font-medium">
                  {job.department}
                </span>
              )}
              {job.remoteType && job.remoteType !== "unknown" && (
                <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-[13px] font-semibold capitalize">
                  {job.remoteType}
                </span>
              )}
            </div>
          </div>

          {job.skills?.length > 0 && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-card mb-4">
              <h2 className="font-bold text-slate-900 text-[15px] mb-4">
                Skills
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {job.skills.map((skill: string) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-[13px] font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {sanitizedDescription && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-card mb-4">
              <h2 className="font-bold text-slate-900 text-[15px] mb-4">
                About this role
              </h2>
              <div
                className="job-description"
                dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
              />
            </div>
          )}

          {job.sourceUrl && (
            <p className="text-xs text-slate-500 px-1">
              Sourced from the{" "}
              <a
                href={job.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 font-semibold underline underline-offset-2"
              >
                official listing
              </a>
              . Details may have changed &mdash; the company page is the source
              of truth.
            </p>
          )}

          {relatedJobs.length > 0 && (
            <section className="mt-8">
              <h2 className="font-bold text-slate-900 text-xl mb-4">
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
          {job.applicationUrl && (
            <div className="bg-[#0B1730] text-white rounded-2xl p-6 shadow-card-hover">
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-teal-300 mb-2">
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
                className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold text-[15px] hover:bg-blue-500 active:bg-blue-700 transition-all shadow-[0_8px_20px_rgba(59,130,246,0.35)]"
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
          )}

          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-card">
            <h2 className="font-bold text-slate-900 text-[15px] mb-2">
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
                className="mt-4 flex items-center justify-center w-full px-6 py-2.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-xl font-semibold text-sm hover:bg-blue-100 transition-all"
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
