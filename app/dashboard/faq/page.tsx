import FaqContent from "@/components/pages/FaqContent";
import { workspaceMetadata } from "@/lib/seo";
export const metadata = workspaceMetadata(
  "Frequently asked questions",
  "Find help with your ReerHub workspace, official jobs, profile, matches, alerts, membership and privacy.",
);
export default function Page() {
  return <FaqContent memberView />;
}
