import Content from "@/components/pages/JobDetailContent";
export const metadata = { title: "Job details" };
export default async function Page(props: {
  params: Promise<{ jobSlug: string }>;
}) {
  return Content({ ...props, privateView: true });
}
