import { workspaceMetadata } from "@/lib/seo";
import Content from "@/app/profile/page";
export const metadata = workspaceMetadata(
  "Profile & preferences",
  "Manage your matching profile, role preferences, email alerts and private account data.",
);
export default function Page() {
  return <Content />;
}
