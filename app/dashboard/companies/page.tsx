import { workspaceMetadata } from "@/lib/seo";
import Content from "@/app/companies/page";
export const metadata = workspaceMetadata(
  "Companies",
  "Browse company profiles and official tech openings inside your ReerHub workspace.",
);
export default async function Page(props: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  return Content(props);
}
