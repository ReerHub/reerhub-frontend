import Content from "@/components/pages/CompanyDetailContent";
export const metadata = { title: "Company details" };
export default async function Page(props: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  return Content({ ...props, privateView: true });
}
