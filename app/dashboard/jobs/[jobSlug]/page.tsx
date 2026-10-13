import { workspaceMetadata } from "@/lib/seo";
import Content from "@/components/pages/JobDetailContent";
export const metadata = workspaceMetadata(
  "Job details",
  "Review an official opening, its requirements and employer application link in your workspace.",
);
export default async function Page(props: {
  params: Promise<{ jobSlug: string }>;
}) {
  return Content({ ...props, privateView: true });
}
