import type { Metadata } from "next";
import CityJobs from "@/components/CityJobs";

// Job counts move daily — refresh the prerender on the same cadence.

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Remote Tech Jobs in India | ReerHub",
  description:
    "Remote-friendly engineering and AI roles open to India, indexed from official company career pages.",
  alternates: { canonical: "/remote-jobs" },
};

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
