import { workspaceMetadata } from "@/lib/seo";
import Content from "@/app/terms/page";
export const metadata = workspaceMetadata(
  "Terms of use",
  "Read the terms for ReerHub discovery, accounts, Pro subscriptions and cancellation.",
);
export default function Page() {
  return <Content />;
}
