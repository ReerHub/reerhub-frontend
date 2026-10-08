import type { Company } from "@/lib/reerhub";

export function topHiringCompanies(companies: Company[], limit = 16) {
  return [...companies]
    .filter((company) => (company.activeJobs || 0) > 0)
    .sort(
      (a, b) =>
        (b.activeJobs || 0) - (a.activeJobs || 0) ||
        a.name.localeCompare(b.name) ||
        a._id.localeCompare(b._id),
    )
    .slice(0, limit);
}
