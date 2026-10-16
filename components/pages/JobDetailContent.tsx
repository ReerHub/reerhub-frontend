import { experienceLabel, salaryLabel } from "@/lib/job-facts";
import Breadcrumbs from "@/components/Breadcrumbs";
import Link from "@/components/AppLink";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { sanitizeHtml } from "@/lib/sanitize";
import CompanyLogo from "@/components/CompanyLogo";
import { jobMetadata, safeJsonLd, SITE, concise } from "@/lib/seo";
import { jobPosting, jobAvailable, deadlineExpired } from "@/lib/job-schema";
import RelatedJobs from "@/components/RelatedJobs";
import SaveJobButton from "@/components/SaveJobButton";
import JobFreshness from "@/components/JobFreshness";
import JobAccountPrompt from "@/components/JobAccountPrompt";
import {
  jobSlug,
  listJobsWithMeta,
  NotFoundError,
  parseJobSlug,
  TECH_TRACKS,
  type Job,
} from "@/lib/reerhub";
import { readJob as getJob } from "@/lib/server-reads";
import { formatFeedCheckedAt, locationLabel, timeAgo } from "@/lib/format";

async function fetchJob(jobId: string): Promise<Job> {
  try {
    return await getJob(jobId);
  } catch (err) {
    if (err instanceof NotFoundError) notFound();
    throw err;
  }
}

// Bare ids (/jobs/<24hex>) keep working: they resolve to the same job and
// 308 to the canonical slug URL below.
function resolveJobId(slug: string): string {
  return parseJobSlug(slug) || (/^[a-f0-9]{24}$/.test(slug) ? slug : "");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ jobSlug: string }>;
}): Promise<Metadata> {
  try {
    const { jobSlug: slug } = await params;
    const jobId = resolveJobId(slug);
    if (!jobId)
      return {
        title: "Job unavailable | REERHUB",
        description:
          "This job link is unavailable. Explore current official tech openings on REERHUB.",
        robots: { index: false, follow: false },
      };
    const job = await fetchJob(jobId);
    const companyName = job.companyId?.name || "Company";
    const city = job.locations?.[0]?.city;
    const available = jobAvailable(job);
    const closed =
      job.status === "closed" || deadlineExpired(job.applicationDeadline);
    const description = `${concise(job.title, 45)} at ${concise(companyName, 35)}${city ? ` in ${concise(city, 20)}` : ""}. ${!available ? (closed ? "This opening is closed. Browse active roles." : "This listing is unavailable for applications on REERHUB. Browse active roles.") : "Read requirements and apply directly."}`;
    return jobMetadata(
      `${!available ? (closed ? "Closed: " : "Unavailable: ") : ""}${job.title}`,
      companyName,
      description,
      `/jobs/${jobSlug(job)}`,
    );
  } catch {
    return {
      title: "Job unavailable | REERHUB",
      description:
        "Job information is temporarily unavailable. Try again or explore current openings on REERHUB.",
      alternates: { canonical: `/jobs/${(await params).jobSlug}` },
    };
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

const faqs = [
  {
    q: "Where does this listing come from?",
    a: "REERHUB indexes official company career pages and ATS boards daily. The company site is always the source of truth.",
  },
  {
    q: "How do I apply for this role?",
    a: "Use the Apply button to finish your application on the company's official site. REERHUB never takes a cut or holds your application.",
  },
  {
    q: "What does a free account unlock?",
    a: "Full job details and official Apply links are public. A free account unlocks complete browsing, your profile, and a saved shortlist. Sign in with Google or a secure email link; no payment is required.",
  },
  {
    q: "Is REERHUB free?",
    a: "Yes. Browsing, saving roles, and applying are free for job seekers.",
  },
];

export default async function JobDetailContent({
  params,
  privateView = false,
}: {
  params: Promise<{ jobSlug: string }>;
  privateView?: boolean;
}) {
  const { jobSlug: slug } = await params;
  const jobId = resolveJobId(slug);
  if (!jobId) notFound();
  const job = await fetchJob(jobId);
  if (!["employer", "admin"].includes(job.postedAtProvenance || ""))
    job.postedAt = undefined;
  const canonical = `/jobs/${jobSlug(job)}`;
  if (slug !== canonical.split("/")[2])
    permanentRedirect(privateView ? `/dashboard${canonical}` : canonical);
  const company = job.companyId || {};
  const companyName: string = company.name || "Company";
  const posted = timeAgo(job.postedAt || job.firstSeenAt);
  const applyDomain = (() => {
    if (!job.applicationUrl) return null;
    try {
      return new URL(job.applicationUrl).hostname.replace(/^www\./, "");
    } catch {
      return null;
    }
  })();
  const relatedJobs = company._id
    ? await fetchRelatedJobs(company._id, job._id)
    : [];
  const canApply = jobAvailable(job);
  const closed =
    job.status === "closed" || deadlineExpired(job.applicationDeadline);
  const hasApplication = !!job.applicationUrl;
  const sanitizedDescription = job.description
    ? sanitizeHtml(job.description)
    : "";
  const schema = jobPosting(job, sanitizedDescription);

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
    { label: "Posting reference", value: job.externalJobId },
    { label: "Employer salary", value: salaryLabel(job.salary) || undefined },
    { label: "Seniority", value: job.seniority },
    {
      label: "Experience",
      value:
        job.requirementStatus === "verified" &&
        job.experience?.min !== undefined
          ? `Minimum ${job.experience.min} years${job.experienceMaximumRequired && job.experience.max !== undefined ? `; maximum ${job.experience.max} years` : ""}`
          : "Requirement not verified — review the official description",
    },
    {
      label: "Employer update",
      value: job.employerUpdatedAt
        ? formatFeedCheckedAt(job.employerUpdatedAt)
        : undefined,
    },
    {
      label: "Last employer publication",
      value: job.employerPublishedAt
        ? formatFeedCheckedAt(job.employerPublishedAt)
        : undefined,
    },
    {
      label: "Employer record created",
      value: job.employerCreatedAt
        ? formatFeedCheckedAt(job.employerCreatedAt)
        : undefined,
    },
    {
      label: "Application deadline",
      value: job.applicationDeadline
        ? formatFeedCheckedAt(job.applicationDeadline)
        : undefined,
    },
    {
      label: job.postedAt ? "Posted" : "First seen",
      value: job.postedAt
        ? new Date(job.postedAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : posted || undefined,
    },
    {
      label: "Last checked in official feed",
      value: formatFeedCheckedAt(job.lastSeenAt) || "Date unavailable",
    },
    ...(job.status === "closed" && job.closedAt
      ? [
          {
            label: "Closure detected",
            value:
              new Date(job.closedAt).toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
              }) + " IST",
          },
        ]
      : []),
  ];

  return (
    <div className="job-detail-page page-container py-8 sm:py-12">
      {!privateView && (
        <>
          {schema && (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
            />
          )}
        </>
      )}
      <Breadcrumbs
        origin={SITE}
        contained
        items={[
          { name: "Home", path: "/" },
          { name: "Jobs", path: "/jobs" },
          ...(company.slug
            ? [{ name: companyName, path: `/companies/${company.slug}` }]
            : []),
          { name: job.title, path: canonical },
        ]}
      />

      <div className="grid lg:grid-cols-[1fr_340px] gap-5 items-start">
        <article className="min-w-0">
          <div className="job-detail-panel p-6 sm:p-8 mb-4">
            <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-3 sm:flex sm:items-center mb-5">
              <CompanyLogo
                name={companyName}
                logoUrl={job.companyId?.logoUrl}
              />
              <div className="min-w-0 sm:flex-1">
                {company.slug ? (
                  <Link
                    href={`/companies/${company.slug}`}
                    className="text-sm font-semibold text-electric hover:text-electric-dark"
                  >
                    {companyName}
                  </Link>
                ) : (
                  <p className="text-sm font-semibold text-electric">
                    {companyName}
                  </p>
                )}
                <div className="text-xs text-slate-500 mt-0.5">
                  <JobFreshness job={job} />
                </div>
              </div>
              <span className="col-span-2 inline-flex items-center gap-2 sm:ml-auto sm:shrink-0">
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold border px-2.5 py-1 rounded-lg ${job.status === "closed" ? "text-slate-600 bg-slate-100 border-slate-200" : "text-green-700 bg-green-50 border-green-100"}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${job.status === "closed" ? "bg-slate-400" : "bg-green-500"}`}
                    aria-hidden
                  />
                  {!canApply ? "Not accepting applications" : "Open role"}
                </span>
                <SaveJobButton jobId={job._id} variant="icon" />
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
                <span className="px-2.5 py-1 rounded-lg bg-electric-soft text-electric-deep text-[13px] font-semibold capitalize">
                  {job.remoteType}
                </span>
              )}
            </div>
          </div>

          {!canApply && (
            <div className="surface-panel mb-4 border-amber-200 bg-amber-50 p-5">
              <h2 className="font-semibold text-ink">
                {closed
                  ? "This opening is no longer active."
                  : "This listing is unavailable for applications on REERHUB."}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {closed
                  ? "The company may have closed this role."
                  : "We cannot confirm application availability for this listing."}{" "}
                Browse fresh openings, or check its official careers page for
                the latest status.
              </p>
              <Link href="/jobs" className="btn-secondary mt-4">
                Explore open roles
              </Link>
            </div>
          )}
          <div className="mb-4 lg:hidden">
            {job.applicationUrl ? (
              <div className="surface-panel p-5">
                <a
                  href={job.applicationUrl}
                  data-official-apply={canApply ? "true" : undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full"
                >
                  {!canApply
                    ? "Check official listing"
                    : "Apply on company website"}
                </a>
                <p className="mt-3 text-center text-xs text-slate-600">
                  Opens the company’s hiring page in a new tab.
                </p>
              </div>
            ) : (
              <p className="surface-panel p-5 text-sm text-slate-600">
                The official Apply link is unavailable. Check the source listing
                below.
              </p>
            )}
          </div>

          <section
            className="surface-panel p-5 mb-4"
            aria-label="Essential job facts"
          >
            <h2 className="font-semibold text-ink">Before you apply</h2>
            <dl className="mt-3 grid gap-3 sm:grid-cols-2 text-sm">
              <div>
                <dt className="text-slate-500">Location</dt>
                <dd>{locationLabel(job)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Experience</dt>
                <dd>
                  {experienceLabel(job) ||
                    "Requirement not verified — review the official description"}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Work mode</dt>
                <dd className="capitalize">
                  {job.remoteType && job.remoteType !== "unknown"
                    ? job.remoteType
                    : "Not specified"}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Employer salary</dt>
                <dd>{salaryLabel(job.salary) || "Not specified"}</dd>
              </div>
            </dl>
          </section>
          {(job.skills ?? []).length > 0 && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-card mb-4">
              <h2 className="font-bold text-slate-900 text-[15px] mb-4">
                Skills
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {(job.skills ?? []).map((skill: string) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 rounded-lg bg-electric-soft text-electric-deep text-[13px] font-medium"
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

          {!hasApplication && job.excerpt && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-card mb-4">
              <h2 className="font-bold text-slate-900 text-[15px] mb-4">
                About this role
              </h2>
              <p className="text-slate-600 text-[15px] leading-relaxed">
                {job.excerpt}…
              </p>
            </div>
          )}

          {job.sourceUrl && (
            <p className="text-xs text-slate-500 px-1">
              Sourced from the{" "}
              <a
                href={job.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-electric font-semibold underline underline-offset-2"
              >
                official listing
              </a>
              . Details may have changed &mdash; the company page is the source
              of truth.
            </p>
          )}

          <div className="mt-6">
            <JobAccountPrompt path={canonical} />
          </div>

          {relatedJobs.length > 0 && (
            <RelatedJobs jobs={relatedJobs} companyName={companyName} />
          )}

          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-card mt-4">
            <h2 className="font-bold text-slate-900 text-[15px] mb-4">
              Frequently asked questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.q}>
                  <h3 className="font-semibold text-slate-900 text-sm mb-1">
                    {faq.q}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </article>

        <aside className="lg:sticky lg:top-24 space-y-4">
          {job.applicationUrl ? (
            <div className="official-apply-panel hidden lg:block p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-primary-deep mb-2">
                Official application
              </p>
              <p className="text-sm text-slate-600 leading-relaxed mb-5">
                You&apos;ll finish your application on {companyName}&apos;s own
                site. REERHUB never takes a cut or holds your data.
              </p>
              <a
                href={job.applicationUrl}
                data-official-apply={canApply ? "true" : undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-electric text-white rounded-xl font-semibold text-[15px] hover:bg-electric-dark active:bg-electric-deep transition-all shadow-sm"
              >
                {!canApply
                  ? "Check official listing"
                  : "Apply on company website"}
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
              {applyDomain && (
                <p className="text-xs text-slate-600 text-center mt-3 break-words">
                  Opens {applyDomain} in a new tab
                </p>
              )}
            </div>
          ) : (
            <div className="hidden lg:block">
              <p className="surface-panel p-5 text-sm text-slate-600">
                The official Apply link is unavailable. Check the source listing
                below.
              </p>
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
                className="mt-4 flex items-center justify-center w-full px-6 py-2.5 bg-electric-soft text-electric-deep border border-electric-soft rounded-xl font-semibold text-sm hover:bg-electric-soft transition-all"
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
