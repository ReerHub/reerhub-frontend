import type { Metadata } from "next";
import CityJobs from "@/components/CityJobs";

// Job counts move daily — refresh the prerender on the same cadence.

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Tech jobs in Hyderabad | ReerHub",
  description:
    "Engineering and data roles in Hyderabad, indexed from official career pages.",
  alternates: { canonical: "/hyderabad-jobs" },
};

export default function Page() {
  return (
    <CityJobs
      title="Tech jobs in Hyderabad"
      blurb="Engineering and data roles in Hyderabad, indexed from official career pages."
      city="Hyderabad"
      heading="Tech roles in Hyderabad"
    />
  );
}
