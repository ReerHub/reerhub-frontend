import Link from "next/link";
import { notFound } from "next/navigation";
import JobCard from "@/components/JobCard";
import { getCompany, listCompanyJobs, NotFoundError } from "@/lib/reerhub";
import { companyTile } from "@/lib/format";

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let company;
  try {
    company = await getCompany(slug);
  } catch (err) {
    if (err instanceof NotFoundError) notFound();
    throw err;
  }
  let jobs: React.ComponentProps<typeof JobCard>["job"][] = [];
  let total = 0;
  try {
    const result = await listCompanyJobs(company._id, 50);
    jobs = result.jobs;
    total = result.total;
  } catch {
    // Jobs failing must not 404 the company page; count falls back below.
  }
  // Backend counts and job lists both default to indiaOnly=true, so these
  // always agree. Use the server count as the source of truth.
  const openCount = company.activeJobs ?? total ?? jobs.length;

  return (
    <div>
      <section className="border-b border-[#E2E8F0] dark:border-white/10 bg-white dark:bg-[#0B1A33]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
          <nav
            className="text-[13px] text-[#64748B] dark:text-[#94A3B8] mb-6 flex items-center gap-2"
            aria-label="Breadcrumb"
          >
            <Link
              href="/companies"
              className="hover:text-[#2563EB] dark:hover:text-[#60A5FA] transition-colors font-medium"
            >
              Companies
            </Link>
            <span aria-hidden>/</span>
            <span className="text-[#0F172A] dark:text-white font-semibold">
              {company.name}
            </span>
          </nav>
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <span
              className={`w-16 h-16 rounded-[10px] ${companyTile()} flex items-center justify-center font-bold text-3xl shrink-0`}
              aria-hidden
            >
              {company.name.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <h1 className="text-3xl sm:text-4xl font-bold text-[#0F172A] dark:text-white tracking-tight">
                {company.name}
              </h1>
              <p className="text-[#64748B] dark:text-[#94A3B8] text-[15px] mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                {company.industry && <span>{company.industry}</span>}
                <span className="inline-flex items-center gap-1.5 text-[#047857] font-semibold">
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-[#10B981]"
                    aria-hidden
                  />
                  {openCount} open roles
                </span>
              </p>
            </div>
            <div className="sm:ml-auto flex flex-wrap gap-2">
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-white dark:bg-transparent text-[#2563EB] dark:text-[#60A5FA] border border-[#E2E8F0] dark:border-white/15 rounded-lg text-sm font-semibold hover:bg-[#F8FAFC] dark:hover:bg-white/5 transition-all"
              >
                Website
              </a>
              <a
                href={company.careersUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-[#2563EB] text-white rounded-lg text-sm font-semibold hover:bg-[#1D4ED8] transition-all"
              >
                Official careers page
              </a>
            </div>
          </div>

          {company.sources?.length ? (
            <div className="flex flex-wrap gap-1.5 mt-6">
              {company.sources.map(
                (s: {
                  name: string;
                  type: string;
                  lastSuccessfulSyncAt?: string;
                }) => (
                  <span
                    key={s.name}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F1F5F9] dark:bg-white/5 rounded-md text-xs font-medium text-[#64748B] dark:text-[#94A3B8]"
                    title={
                      s.lastSuccessfulSyncAt
                        ? `Last synced ${new Date(s.lastSuccessfulSyncAt).toLocaleString("en-IN")}`
                        : "Source"
                    }
                  >
                    {s.name} · {s.type}
                  </span>
                ),
              )}
            </div>
          ) : null}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <h2 className="font-bold text-[#0F172A] dark:text-white text-xl mb-5">
          Open roles{" "}
          <span className="text-[#64748B] dark:text-[#94A3B8] font-medium">
            ({openCount})
          </span>
        </h2>
        {jobs.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {jobs.map((job: React.ComponentProps<typeof JobCard>["job"]) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-[#0B1A33] border border-[#E2E8F0] dark:border-white/10 rounded-xl">
            <p className="font-semibold text-[#0F172A] dark:text-white mb-1">
              No open roles right now
            </p>
            <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
              Check back tomorrow — we sync daily.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
