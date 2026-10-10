import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import CompanyLogo from "@/components/CompanyLogo";
import JobBrowser from "@/components/JobBrowser";
import { listJobsWithMeta, NotFoundError } from "@/lib/reerhub";
import { readCompany as getCompany } from "@/lib/server-reads";
import { pageMetadata, safeJsonLd, breadcrumb } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  try {
    const company = await getCompany(slug);
    return pageMetadata(
      `${company.name} Careers & Tech Jobs`,
      `Explore engineering, AI and data openings at ${company.name} in India. Read job details and apply on the official company site with ReerHub.`,
      `/companies/${company.slug}`,
    );
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }
}

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let company;
  let initialData;
  try {
    const [summary, roles] = await Promise.all([
      getCompany(slug),
      listJobsWithMeta({ companySlug: slug, limit: 21 }).catch(() => undefined),
    ]);
    company = summary;
    initialData = roles;
  } catch (err) {
    if (err instanceof NotFoundError) notFound();
    throw err;
  }
  // Backend counts and job lists both default to indiaOnly=true, so these
  // always agree. Use the server count as the source of truth.
  const openCount = company.activeJobs ?? initialData?.total ?? 0;

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(
            breadcrumb([
              { name: "Home", path: "/" },
              { name: "Companies", path: "/companies" },
              { name: company.name, path: `/companies/${company.slug}` },
            ]),
          ),
        }}
      />
      <section className="border-b border-slate-200 bg-white">
        <div className="page-container py-10 sm:py-12">
          <nav
            className="text-[13px] text-slate-500 mb-6 flex items-center gap-2"
            aria-label="Breadcrumb"
          >
            <Link
              href="/companies"
              className="hover:text-electric transition-colors font-medium"
            >
              Companies
            </Link>
            <span aria-hidden className="text-slate-300">
              /
            </span>
            <span className="text-slate-900 font-semibold">{company.name}</span>
          </nav>
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <CompanyLogo name={company.name} logoUrl={company.logoUrl} />
            <div className="min-w-0">
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                {company.name}
              </h1>
              <p className="text-slate-500 text-[15px] mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                {company.industry && <span>{company.industry}</span>}
                <span className="inline-flex items-center gap-1.5 text-green-700 font-semibold">
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-green-500"
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
                className="px-5 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all"
              >
                Website
              </a>
              <a
                href={company.careersUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-electric text-white rounded-xl text-sm font-semibold hover:bg-electric-dark transition-all shadow-sm"
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
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-600"
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

      <section className="page-container py-10">
        <Suspense>
          <JobBrowser
            key={company._id}
            companyId={company._id}
            heading="Open roles"
            showFilters={false}
            initialData={initialData}
          />
        </Suspense>
      </section>
    </div>
  );
}
