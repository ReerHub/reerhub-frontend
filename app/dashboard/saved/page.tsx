import { workspaceMetadata } from "@/lib/seo";
import Results from "@/components/MemberResultsPage";
export const metadata = workspaceMetadata(
  "Saved roles",
  "Revisit and manage the official openings saved to your ReerHub shortlist.",
);
export default function Page() {
  return <Results view="saved" />;
}
