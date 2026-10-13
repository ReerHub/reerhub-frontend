import { workspaceMetadata } from "@/lib/seo";
import Content from "@/app/contact/page";
export const metadata = workspaceMetadata(
  "Help & support",
  "Find support for listings, your ReerHub account, membership and privacy choices.",
);
export default function Page() {
  return <Content />;
}
