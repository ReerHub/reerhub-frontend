import { workspaceMetadata } from "@/lib/seo";
import Content from "@/app/about/page";
export const metadata = workspaceMetadata(
  "About ReerHub",
  "Learn about ReerHub and its approach to official tech-job discovery in India.",
);
export default function Page() {
  return <Content />;
}
