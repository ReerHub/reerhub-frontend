import { pageMetadata } from "@/lib/seo";
import CityJobs from "@/components/CityJobs";

// Job counts move daily — refresh the prerender on the same cadence.

export const revalidate = 86400;

export const metadata = pageMetadata(
  "Remote Tech Jobs in India | ReerHub",
  "Discover remote tech jobs open to India from official company career pages. Read work-mode details and apply directly on the company hiring site.",
  "/remote-jobs",
);

export default function Page() {
  return (
    <CityJobs
      title="Remote tech jobs"
      blurb="Remote-friendly engineering and AI roles open to applicants in India."
      remoteOnly
      heading="Remote-friendly roles"
    />
  );
}
