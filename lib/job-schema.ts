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
/** One availability rule for snippets, application controls and structured data. */
export function jobAvailable(
  job: Pick<Job, "status" | "publicEligible" | "applicationDeadline">,
  now = Date.now(),
) {
  return (
    job.status === "active" &&
    job.publicEligible !== false &&
    (!job.applicationDeadline ||
      (Number.isFinite(Date.parse(job.applicationDeadline)) &&
        Date.parse(job.applicationDeadline) > now))
  );
}

// ATS labels sometimes mix work arrangement into a comma-separated address.
// Omit invalid regions; never infer a state from an office city.
const geographicRegion = (state?: string) => {
  const geographic = state
    ?.split(",")
    .map((part) => part.trim())
    .filter(
      (part) =>
        part && !/^(?:on[ -]?site|hybrid|(?:fully |100% )?remote)$/i.test(part),
    )
    .join(", ");
  return geographic || undefined;
};

export function jobPosting(job: Job, description: string) {
  if (!jobAvailable(job)) return null;
  const posted = job.postedAt && new Date(job.postedAt);
  const locations = job.locations.filter(
    (l) => l.country && (l.city || geographicRegion(l.state)),
  );
  // A normalized remote flag alone is not proof of fully remote eligibility.
  const remote =
    job.remoteType === "remote" &&
    /(?:fully remote|100% remote)/i.test(description);
  if (
    !["employer", "admin"].includes(job.postedAtProvenance || "") ||
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
    ...(job.applicationDeadline
      ? { validThrough: new Date(job.applicationDeadline).toISOString() }
      : {}),
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
            addressRegion: geographicRegion(l.state),
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

export function deadlineExpired(value?: string, now = Date.now()) {
  return (
    !!value && Number.isFinite(Date.parse(value)) && Date.parse(value) <= now
  );
}
