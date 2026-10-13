import { workspaceMetadata } from "@/lib/seo";
import Content from "@/components/pages/CompanyDetailContent";
export const metadata = workspaceMetadata(
  "Company details",
  "Review a company’s official career sources and available jobs in your workspace.",
);
export default async function Page(props: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  return Content({ ...props, privateView: true });
}
