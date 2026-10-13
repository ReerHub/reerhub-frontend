import { workspaceMetadata } from "@/lib/seo";
import Results from "@/components/MemberResultsPage";
export const metadata = workspaceMetadata(
  "Matches",
  "Review your eligible Pro matches, experience groups, matching reasons and profile relevance.",
);
export default function Page() {
  return <Results view="matches" />;
}
