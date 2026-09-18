import Link from "next/link";
import CompanyLogo from "@/components/CompanyLogo";
import { listCompanies } from "@/lib/reerhub";

export const dynamic = "force-dynamic";

export default async function CompaniesPage() {
  const companies = await listCompanies();
  const totalRoles = companies.reduce((sum, c) => sum + (c.activeJobs ?? 0), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-3">
        Tech companies
      </h1>
      <p className="text-slate-500 mb-10">
        {companies.length} product companies · {totalRoles} open tech roles ·
        refreshed daily from official pages.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {companies.map((company) => (
          <Link
            key={company._id}
            href={`/companies/${company.slug}`}
            className="group bg-white border border-slate-200/80 rounded-2xl p-6 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex items-center gap-4 mb-5">
              <CompanyLogo name={company.name} logoUrl={company.logoUrl} />
              <div className="min-w-0">
                <h2 className="font-bold text-slate-900 text-lg leading-tight truncate group-hover:text-electric transition-colors">
                  {company.name}
                </h2>
                {company.industry && (
                  <p className="text-xs text-slate-500">{company.industry}</p>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <span className="text-sm font-semibold text-slate-900">
                {company.activeJobs ?? 0}{" "}
                <span className="font-normal text-slate-500">
                  open {(company.activeJobs ?? 0) === 1 ? "role" : "roles"}
                </span>
              </span>
              <span className="text-sm font-semibold text-electric inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                View roles
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
        ))}
      </div>
    </div>
  );
}
