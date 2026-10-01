import type { Metadata } from "next";
import CityJobs from "@/components/CityJobs";

// Job counts move daily — refresh the prerender on the same cadence.

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Tech jobs in Pune | ReerHub",
  description:
    "Engineering roles in Pune, indexed from official company career pages.",
  alternates: { canonical: "/pune-jobs" },
};

export default function Page() {
  return (
    <CityJobs
      title="Tech jobs in Pune"
      blurb="Engineering roles in Pune, indexed from official company career pages."
      city="Pune"
      heading="Tech roles in Pune"
    />
  );
}
