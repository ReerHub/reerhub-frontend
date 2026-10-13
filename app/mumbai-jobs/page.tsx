import { pageMetadata } from "@/lib/seo";
import CityJobs from "@/components/CityJobs";

export const metadata = pageMetadata(
  "Tech jobs in Mumbai | REERHUB",
  "Discover product and fintech engineering jobs in Mumbai from official company sources. Read role requirements and apply on the company website.",
  "/mumbai-jobs",
);

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
