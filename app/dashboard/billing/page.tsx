import { workspaceMetadata } from "@/lib/seo";
import Content from "@/components/pages/BillingContent";
export const metadata = workspaceMetadata(
  "Membership",
  "Review your ReerHub membership, choose a billing cycle or manage subscription renewal.",
);
export default async function Page(props: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  return Content({ ...props, memberView: true });
}
