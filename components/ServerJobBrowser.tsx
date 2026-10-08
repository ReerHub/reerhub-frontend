import JobBrowser from "./JobBrowser";
import { listJobsWithMeta, type TechTrack } from "@/lib/reerhub";

export default async function ServerJobBrowser({
  heading,
  track,
  city,
  remoteOnly,
}: {
  heading: string;
  track?: TechTrack;
  city?: string;
  remoteOnly?: boolean;
}) {
  const initialFilters = {
    ...(city ? { city } : {}),
    ...(remoteOnly ? { remoteType: "remote" } : {}),
  };
  let initialData;
  try {
    initialData = await listJobsWithMeta({
      limit: 10,
      ...(track ? { techTrack: track } : {}),
      ...initialFilters,
    });
  } catch {
    /* The client retry remains available during source outages. */
  }
  return (
    <JobBrowser
      heading={heading}
      initialCategory={track}
      initialFilters={initialFilters}
      initialData={initialData}
    />
  );
}
