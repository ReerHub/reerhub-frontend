import { pageMetadata } from "@/lib/seo";
import CityJobs from "@/components/CityJobs";

export const metadata = pageMetadata(
  "Tech jobs in Delhi | REERHUB",
  "Explore tech jobs across Delhi NCR, Gurgaon and Noida from official company career pages. Read role details and apply directly on the hiring site.",
  "/delhi-jobs",
);

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
