import { pageMetadata } from "@/lib/seo";
import CityJobs from "@/components/CityJobs";

// Job counts move daily — refresh the prerender on the same cadence.

export const revalidate = 86400;

export const metadata = pageMetadata(
  "Tech jobs in Chennai | ReerHub",
  "Find software engineering and SaaS jobs in Chennai from official company sources. Read full descriptions and apply directly on the hiring site.",
  "/chennai-jobs",
);

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
