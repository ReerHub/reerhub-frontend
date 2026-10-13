import Content from "@/components/pages/JobDetailContent";
export { generateMetadata } from "@/components/pages/JobDetailContent";
export default async function Page(props: {
  params: Promise<{ jobSlug: string }>;
}) {
  return Content(props);
}
