import Link from "next/link";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { sanitizeHtml } from "@/lib/sanitize";
import CompanyLogo from "@/components/CompanyLogo";
import { pageMetadata, safeJsonLd, breadcrumb } from "@/lib/seo";
import { jobPosting } from "@/lib/job-schema";
import RelatedJobs from "@/components/RelatedJobs";
import SaveJobButton from "@/components/SaveJobButton";
import JobAccountPrompt from "@/components/JobAccountPrompt";
import {
  getJob,
  jobSlug,
  listJobsWithMeta,
  NotFoundError,
  parseJobSlug,
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
    if (!jobId) return { title: "Job | ReerHub" };
    const job = await fetchJob(jobId);
    const companyName = job.companyId?.name || "Company";
    const title = `${job.status === "closed" ? "Closed: " : ""}${job.title} at ${companyName} | ReerHub`;
    const description =
      `${job.title} (${job.techRole || "tech role"}) at ${companyName}` +
      `${job.locations?.[0]?.city ? ` in ${job.locations[0].city}` : ""}. ` +
      `${job.status === "closed" ? "This opening is closed. Explore related active jobs on ReerHub." : "Read full role requirements and apply on the company's official website."}`;
    return pageMetadata(title, description, `/jobs/${jobSlug(job)}`);
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

const faqs = [
  {
    q: "Where does this listing come from?",
    a: "ReerHub indexes official company career pages and ATS boards daily. The company site is always the source of truth.",
  },
  {
    q: "How do I apply for this role?",
    a: "Use the Apply button to finish your application on the company's official site. ReerHub never takes a cut or holds your application.",
  },
  {
    q: "What does a free account unlock?",
    a: "Full job details and official Apply links are public. A free account unlocks complete browsing, your profile, and a saved shortlist. Sign in with Google or a secure email link; no payment is required.",
  },
  {
    q: "Is ReerHub free?",
    a: "Yes. Browsing, saving roles, and applying are free for job seekers.",
  },
];

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ jobSlug: string }>;
}) {
  const { jobSlug: slug } = await params;
  const jobId = resolveJobId(slug);
  if (!jobId) notFound();
  const job = await fetchJob(jobId);
  const canonical = `/jobs/${jobSlug(job)}`;
  if (slug !== canonical.split("/")[2]) permanentRedirect(canonical);
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
    <div className="page-container py-8 sm:py-12">
      <JobAccountPrompt path={canonical} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(
            breadcrumb([
              { name: "Home", path: "/" },
              { name: "Jobs", path: "/jobs" },
              { name: job.title, path: canonical },
            ]),
          ),
        }}
      />
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((faq) => ({
              "@type": "Question",
              name: faq.q,
              acceptedAnswer: { "@type": "Answer", text: faq.a },
            })),
          }),
        }}
      />
      <nav
        className="text-[13px] font-medium text-slate-500 mb-6 flex items-center gap-2 flex-wrap"
        aria-label="Breadcrumb"
      >
        <Link href="/jobs" className="hover:text-electric transition-colors">
          Jobs
        </Link>
        <span aria-hidden className="text-slate-300">
          /
        </span>
        {company.slug ? (
          <Link
            href={`/companies/${company.slug}`}
            className="hover:text-electric transition-colors"
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
                    className="text-sm font-semibold text-electric hover:text-electric-dark"
                  >
                    {companyName}
                  </Link>
                ) : (
                  <p className="text-sm font-semibold text-electric">
                    {companyName}
                  </p>
                )}
                {posted && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    Posted {posted.toLowerCase()}
                  </p>
                )}
              </div>
              <span className="ml-auto inline-flex items-center gap-2 shrink-0">
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold border px-2.5 py-1 rounded-lg ${job.status === "closed" ? "text-slate-600 bg-slate-100 border-slate-200" : "text-green-700 bg-green-50 border-green-100"}`}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-green-500"
                    aria-hidden
                  />
                  {job.status === "closed" ? "Closed" : "Open role"}
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

          {job.status === "closed" && (
            <div className="surface-panel mb-4 border-amber-200 bg-amber-50 p-5">
              <h2 className="font-semibold text-ink">
                This opening is no longer active.
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                The company may have closed this role. Browse fresh openings, or
                check its official careers page for the latest status.
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
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full"
                >
                  {job.status === "closed"
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
            <div className="hidden lg:block bg-ink text-white rounded-2xl p-6 shadow-card-hover">
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
                className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-electric text-white rounded-xl font-semibold text-[15px] hover:bg-electric-dark active:bg-electric-deep transition-all shadow-sm"
              >
                {job.status === "closed"
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
                <p className="text-xs text-white/80 text-center mt-2">
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
