import Content from "@/components/pages/CompanyDetailContent";
export { generateMetadata } from "@/components/pages/CompanyDetailContent";
export default async function Page(props: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  return Content(props);
}
