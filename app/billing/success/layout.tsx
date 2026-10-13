import type { ReactNode } from "react";
import { accountMetadata } from "@/lib/seo";
export const metadata = accountMetadata(
  "Membership confirmation",
  "Check your verified ReerHub subscription status after secure checkout.",
);
export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
