import FaqContent from "@/components/pages/FaqContent";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata(
  "Frequently Asked Questions",
  "Find answers about ReerHub job discovery, official applications, accounts, Pro matches, alerts, trials, billing and privacy.",
  "/faq",
);
export default function Page() {
  return <FaqContent />;
}
