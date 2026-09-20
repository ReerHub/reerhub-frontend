import type { Metadata } from "next";
import CityJobs from "@/components/CityJobs";

// Job counts move daily — refresh the prerender on the same cadence.

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Tech jobs in Bengaluru | ReerHub",
  description:
    "Software, AI, and data roles in Bengaluru — India's startup capital — indexed from official company career pages.",
  alternates: { canonical: "/bengaluru-jobs" },
};

export default function Page() {
  return (
    <CityJobs
      title="Tech jobs in Bengaluru"
      blurb="Software, AI, and data roles in Bengaluru — India's startup capital — indexed from official company career pages."
      city="Bengaluru"
      heading="Tech roles in Bengaluru"
    />
  );
}
