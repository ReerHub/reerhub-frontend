import Link from "next/link";
import { listCompanies } from "@/lib/reerhub";
import { companyTile } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function CompaniesPage() {
  const companies = await listCompanies();
  const totalRoles = companies.reduce((sum, c) => sum + (c.activeJobs ?? 0), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <h1 className="text-4xl font-bold text-[#0F172A] dark:text-white tracking-tight mb-3">
        Tech companies
      </h1>
      <p className="text-[#64748B] dark:text-[#94A3B8] mb-10">
        {companies.length} product companies · {totalRoles} open tech roles ·
        refreshed daily from official pages.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {companies.map((company) => (
          <Link
            key={company._id}
            href={`/companies/${company.slug}`}
            className="group bg-white dark:bg-[#0B1A33] border border-[#E2E8F0] dark:border-white/10 rounded-xl p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:shadow-[0_4px_12px_rgba(15,23,42,0.08)] transition-all duration-150"
          >
            <div className="flex items-center gap-4 mb-5">
              <span
                className={`w-12 h-12 rounded-[10px] ${companyTile()} flex items-center justify-center font-bold text-xl shrink-0`}
                aria-hidden
              >
                {company.name.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <h2 className="font-bold text-[#0F172A] dark:text-white text-lg leading-tight truncate group-hover:text-[#2563EB] dark:group-hover:text-[#60A5FA] transition-colors">
                  {company.name}
                </h2>
                {company.industry && (
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                    {company.industry}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-[#E2E8F0] dark:border-white/10">
              <span className="text-sm font-semibold text-[#0F172A] dark:text-white">
                {company.activeJobs ?? 0}{" "}
                <span className="font-normal text-[#64748B] dark:text-[#94A3B8]">
                  open {(company.activeJobs ?? 0) === 1 ? "role" : "roles"}
                </span>
              </span>
              <span className="text-sm font-semibold text-[#2563EB] dark:text-[#60A5FA] inline-flex items-center gap-1 group-hover:gap-2 transition-all">
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
