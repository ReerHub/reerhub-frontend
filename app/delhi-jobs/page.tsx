import type { Metadata } from "next";
import CityJobs from "@/components/CityJobs";

// Job counts move daily — refresh the prerender on the same cadence.

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Tech jobs in Delhi | ReerHub",
  description:
    "Software roles across Delhi NCR — Delhi, Gurgaon, and Noida — from top product companies.",
  alternates: { canonical: "/delhi-jobs" },
};

export default function Page() {
  return (
    <CityJobs
      title="Tech jobs in Delhi"
      blurb="Software roles across Delhi NCR — Delhi, Gurgaon, and Noida — from top product companies."
      city="Delhi"
      heading="Tech roles in Delhi NCR"
    />
  );
}
