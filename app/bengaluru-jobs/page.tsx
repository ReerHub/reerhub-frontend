import { pageMetadata } from "@/lib/seo";
import CityJobs from "@/components/CityJobs";

// Job counts move daily — refresh the prerender on the same cadence.

export const revalidate = 86400;

export const metadata = pageMetadata(
  "Tech jobs in Bengaluru | ReerHub",
  "Explore software, AI and data jobs in Bengaluru from official company career pages. Read full role details and apply directly on the hiring site.",
  "/bengaluru-jobs",
);

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
