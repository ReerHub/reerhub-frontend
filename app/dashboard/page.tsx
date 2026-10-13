import { workspaceMetadata } from "@/lib/seo";
export const metadata = workspaceMetadata(
  "Overview",
  "See your saved roles, matching-profile progress, membership and next steps in your private ReerHub workspace.",
);
import DashboardEntry from "@/components/DashboardEntry";
export default function DashboardPage() {
  return <DashboardEntry />;
}
