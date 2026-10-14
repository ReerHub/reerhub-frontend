import Link from "@/components/AppLink";
import CompanyLogo from "@/components/CompanyLogo";
import JobFreshness from "@/components/JobFreshness";
import Icon from "@/components/ui/Icon";
import { jobUrl, type Job } from "@/lib/reerhub";
import { locationLabel } from "@/lib/format";
import styles from "./HomePage.module.css";

export default function HomeJobPreview({ job }: { job: Job }) {
  const company = job.companyId?.name || "Company";
  const labels = [...new Set([job.techRole, job.seniority].filter(Boolean))];
  return (
    <article className={styles.openingCard}>
      <Link
        href={jobUrl(job)}
        prefetch={false}
        className={styles.openingLink}
        aria-label={`${job.title} at ${company}`}
      >
        <div className={styles.openingIdentity}>
          <CompanyLogo name={company} logoUrl={job.companyId?.logoUrl} />
          <div>
            <p>{company}</p>
            <span>
              <Icon name="shield" className="h-3 w-3" /> Official source
            </span>
          </div>
        </div>
        <h3>{job.title}</h3>
        <p className={styles.openingLocation}>
          <Icon name="pin" className="h-4 w-4" /> {locationLabel(job)}
        </p>
        <div className={styles.openingLabels}>
          {job.remoteType && job.remoteType !== "unknown" && (
            <span className="capitalize">{job.remoteType}</span>
          )}
          {labels.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
        <div className={styles.openingFooter}>
          <JobFreshness job={job} />
          <span className={styles.openingAction}>
            View role <Icon name="arrow" className="h-4 w-4" />
          </span>
        </div>
      </Link>
    </article>
  );
}
