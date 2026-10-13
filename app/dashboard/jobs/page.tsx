import { workspaceMetadata } from "@/lib/seo";
import Results from "@/components/MemberResultsPage";
export const metadata = workspaceMetadata(
  "Jobs",
  "Search official engineering, AI and data openings in your ReerHub workspace.",
);
export default function Page() {
  return <Results view="discover" />;
}
