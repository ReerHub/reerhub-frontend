import type { Company } from "@/lib/reerhub";

export function knownCompanyOpenings(company: Company): number | null {
  const count = company.activeJobs;
  return typeof count === "number" && Number.isFinite(count) && count >= 0
    ? count
    : null;
}

export function homepageCompanies(companies: Company[], limit = 30) {
  const ids = new Set<string>();
  const slugs = new Set<string>();
  return companies
    .filter((company) => {
      if (ids.has(company._id) || slugs.has(company.slug)) return false;
      ids.add(company._id);
      slugs.add(company.slug);
      return true;
    })
    .sort(
      (a, b) =>
        (knownCompanyOpenings(b) || 0) - (knownCompanyOpenings(a) || 0) ||
        a.name.localeCompare(b.name) ||
        a._id.localeCompare(b._id),
    )
    .slice(0, limit);
}

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
