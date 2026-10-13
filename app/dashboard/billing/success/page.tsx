import { workspaceMetadata } from "@/lib/seo";
import Content from "@/app/billing/success/page";
export const metadata = workspaceMetadata(
  "Membership confirmation",
  "Check your verified membership status and continue to your ReerHub workspace.",
);
export default function Page() {
  return <Content />;
}
