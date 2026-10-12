import type { Job } from "@/lib/reerhub";
import { timeAgo } from "@/lib/format";

export default function JobFreshness({
  job,
}: {
  job: Pick<Job, "postedAt" | "firstSeenAt" | "lastSeenAt">;
}) {
  const listed = job.postedAt || job.firstSeenAt;
  return (
    <span className="flex flex-col gap-1">
      {listed && (
        <span>
          {job.postedAt ? "Posted" : "First seen"}{" "}
          <time dateTime={listed}>{timeAgo(listed)}</time>
        </span>
      )}
      {job.lastSeenAt && (
        <span title="Last observed in the official employer feed. This is separate from the posting date and an application-link check.">
          Last checked{" "}
          <time dateTime={job.lastSeenAt}>{timeAgo(job.lastSeenAt)}</time>
        </span>
      )}
    </span>
  );
}
