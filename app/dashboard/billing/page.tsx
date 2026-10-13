import Content from "@/components/pages/BillingContent";
export const metadata = { title: "Billing" };
export default async function Page(props: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  return Content({ ...props, memberView: true });
}
