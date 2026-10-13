import { workspaceMetadata } from "@/lib/seo";
import Content from "@/app/privacy/page";
export const metadata = workspaceMetadata(
  "Privacy policy",
  "Read how ReerHub handles account data and optional analytics, and manages privacy choices.",
);
export default function Page() {
  return <Content />;
}
