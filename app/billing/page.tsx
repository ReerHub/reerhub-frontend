import Content from "@/components/pages/BillingContent";
export default async function Page(props: {
  searchParams: Promise<{ plan?: string | string[] }>;
}) {
  return Content(props);
}
