import { pageMetadata } from "@/lib/seo";
import CityJobs from "@/components/CityJobs";

export const metadata = pageMetadata(
  "Tech jobs in Hyderabad | REERHUB",
  "Browse engineering, AI and data jobs in Hyderabad from official company career pages. Explore role details and apply directly to the hiring team.",
  "/hyderabad-jobs",
);

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
