import type { Metadata } from "next";
import CityJobs from "@/components/CityJobs";

// Job counts move daily — refresh the prerender on the same cadence.

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Tech jobs in Mumbai | ReerHub",
  description: "Product and fintech engineering roles in Mumbai, hiring now.",
  alternates: { canonical: "/mumbai-jobs" },
};

export default function Page() {
  return (
    <CityJobs
      title="Tech jobs in Mumbai"
      blurb="Product and fintech engineering roles in Mumbai, hiring now."
      city="Mumbai"
      heading="Tech roles in Mumbai"
    />
  );
}
