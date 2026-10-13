import Content from "@/app/companies/page";
export const metadata = { title: "Companies" };
export default async function Page(props: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  return Content(props);
}
