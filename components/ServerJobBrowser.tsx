import JobBrowser from "./JobBrowser";
import {
  listJobsWithMeta,
  DataUnavailableError,
  type TechTrack,
} from "@/lib/reerhub";

export default async function ServerJobBrowser({
  heading,
  track,
  city,
  remoteOnly,
  locationScope = "india",
}: {
  heading: string;
  track?: TechTrack;
  city?: string;
  remoteOnly?: boolean;
  locationScope?: import("@/lib/location-scope").LocationScope;
}) {
  const initialFilters = {
    ...(city ? { city } : {}),
    ...(remoteOnly ? { remoteType: "remote" } : {}),
  };
  let initialData;
  try {
    initialData = await listJobsWithMeta({
      limit: 10,
      locationScope,
      ...(track ? { techTrack: track } : {}),
      ...initialFilters,
    });
  } catch (error) {
    if (!(error instanceof DataUnavailableError)) throw error;
    /* The client retry remains available during source outages. */
  }
  return (
    <JobBrowser
      heading={heading}
      initialCategory={track}
      initialFilters={initialFilters}
      initialData={initialData}
      initialLocationScope={locationScope}
    />
  );
}
