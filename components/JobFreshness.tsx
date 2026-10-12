import type { Job } from "@/lib/reerhub";
import { timeAgo, formatFeedCheckedAt } from "@/lib/format";

export default function JobFreshness({
  job,
}: {
  job: Pick<
    Job,
    "postedAt" | "postedAtProvenance" | "firstSeenAt" | "lastSeenAt"
  >;
}) {
  const original = ["employer", "admin"].includes(job.postedAtProvenance || "")
    ? job.postedAt
    : undefined;
  const listed = [original, job.firstSeenAt].find(
    (value) => value && Number.isFinite(Date.parse(value)),
  );
  const checked = formatFeedCheckedAt(job.lastSeenAt);
  return (
    <span className="flex flex-col gap-1">
      {listed && (
        <span>
          {listed === original ? "Posted" : "First seen"}{" "}
          <time dateTime={listed}>{timeAgo(listed)}</time>
        </span>
      )}
      {checked ? (
        <span title="Last observed in the official employer feed. This is separate from the posting date and an application-link check.">
          Last checked <time dateTime={job.lastSeenAt}>{checked}</time>
        </span>
      ) : (
        <span>Feed check date unavailable</span>
      )}
    </span>
  );
}
