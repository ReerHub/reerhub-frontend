import { workspaceMetadata } from "@/lib/seo";
import Content from "@/app/matching-methodology/page";
export const metadata = workspaceMetadata(
  "Matching methodology",
  "Understand verified job eligibility, experience groups and profile-relevance scoring.",
);
export default function Page() {
  return <Content />;
}
