import { pageMetadata } from "@/lib/seo";
import CityJobs from "@/components/CityJobs";

export const metadata = pageMetadata(
  "Tech jobs in Pune | REERHUB",
  "Find software engineering and data jobs in Pune from official company career pages. Explore requirements and apply directly on the hiring site.",
  "/pune-jobs",
);

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
