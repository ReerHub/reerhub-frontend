import type { Job } from "./reerhub";

const TYPES: Record<string, string> = {
  "full-time": "FULL_TIME",
  "full time": "FULL_TIME",
  full_time: "FULL_TIME",
  "part-time": "PART_TIME",
  "part time": "PART_TIME",
  part_time: "PART_TIME",
  contract: "CONTRACTOR",
  contractor: "CONTRACTOR",
  internship: "INTERN",
  intern: "INTERN",
  temporary: "TEMPORARY",
  volunteer: "VOLUNTEER",
  voluntary: "VOLUNTEER",
  per_diem: "PER_DIEM",
  other: "OTHER",
};
export function jobPosting(job: Job, description: string) {
  const posted = job.postedAt && new Date(job.postedAt);
  const locations = job.locations.filter(
    (l) => l.country && (l.city || l.state),
  );
  // A normalized remote flag alone is not proof of fully remote eligibility.
  const remote =
    job.remoteType === "remote" &&
    /(?:fully remote|100% remote)/i.test(description);
  if (
    job.status !== "active" ||
    !job.title ||
    !job.companyId?.name ||
    !description.replace(/<[^>]*>/g, "").trim() ||
    !posted ||
    !Number.isFinite(posted.getTime()) ||
    posted.getTime() > Date.now() ||
    !/^https?:\/\//.test(job.applicationUrl || "") ||
    (!locations.length && !remote)
  )
    return null;
  const countries = [
    ...new Set(job.locations.map((l) => l.country).filter(Boolean)),
  ];
  if (remote && !countries.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description,
    datePosted: posted.toISOString(),
    hiringOrganization: {
      "@type": "Organization",
      name: job.companyId.name,
      sameAs: job.companyId.website,
      logo: job.companyId.logoUrl,
    },
    employmentType: TYPES[(job.employmentType || "").toLowerCase()],
    jobLocation: locations.length
      ? locations.map((l) => ({
          "@type": "Place",
          address: {
            "@type": "PostalAddress",
            addressLocality: l.city,
            addressRegion: l.state,
            addressCountry: l.country,
          },
        }))
      : undefined,
    ...(remote
      ? {
          jobLocationType: "TELECOMMUTE",
          applicantLocationRequirements: countries.map((name) => ({
            "@type": "Country",
            name,
          })),
        }
      : {}),
  };
}
