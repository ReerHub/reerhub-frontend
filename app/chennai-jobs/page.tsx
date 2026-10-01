import type { Metadata } from "next";
import CityJobs from "@/components/CityJobs";

// Job counts move daily — refresh the prerender on the same cadence.

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Tech jobs in Chennai | ReerHub",
  description:
    "Software and SaaS roles in Chennai, from product companies hiring now.",
  alternates: { canonical: "/chennai-jobs" },
};

export default function Page() {
  return (
    <CityJobs
      title="Tech jobs in Chennai"
      blurb="Software and SaaS roles in Chennai, from product companies hiring now."
      city="Chennai"
      heading="Tech roles in Chennai"
    />
  );
}
