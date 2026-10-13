import DiscoveryUnavailable from "@/components/DiscoveryUnavailable";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import CompanyLogo from "@/components/CompanyLogo";
import JobBrowser from "@/components/JobBrowser";
import {
  listJobsWithMeta,
  NotFoundError,
  DataUnavailableError,
} from "@/lib/reerhub";
import { readCompany as getCompany } from "@/lib/server-reads";
import { pageMetadata, safeJsonLd, breadcrumb } from "@/lib/seo";
import {
  locationScopeFromParams,
  locationScopeLabel,
} from "@/lib/location-scope";

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
      `Explore engineering, AI and data openings at ${company.name} in India. Read job details and apply on the official company site with REERHUB.`,
      `/companies/${company.slug}`,
    );
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    if (error instanceof DataUnavailableError)
      return pageMetadata(
        "Company openings",
        "Explore official company openings.",
        `/companies/${slug}`,
      );
    throw error;
  }
}

export default async function CompanyDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const locationScope = locationScopeFromParams(
    new URLSearchParams(
      Object.entries(query).filter(
        (entry): entry is [string, string] => entry[1] !== undefined,
      ),
    ),
  );
  let company;
  let initialData;
  try {
    const [summary, roles] = await Promise.all([
      getCompany(slug, locationScope),
      listJobsWithMeta({ companySlug: slug, limit: 21, locationScope }).catch(
        () => undefined,
      ),
    ]);
    company = summary;
    initialData = roles;
  } catch (err) {
    if (err instanceof NotFoundError) notFound();
    if (err instanceof DataUnavailableError)
      return <DiscoveryUnavailable href={`/companies/${slug}`} />;
    throw err;
  }
  // The company count is complete; anonymous job lists are capped previews.
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
      <section className="company-detail-hero">
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
                  {openCount} open roles · {locationScopeLabel(locationScope)}
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
            key={`${company._id}:${locationScope}`}
            companyId={company._id}
            companyTotal={company.activeJobs}
            initialLocationScope={locationScope}
            heading="Open roles"
            showFilters={false}
            initialData={initialData}
          />
        </Suspense>
      </section>
    </div>
  );
}
