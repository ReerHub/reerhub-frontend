import { accountMetadata } from "@/lib/seo";
import type { ReactNode } from "react";
export const metadata = accountMetadata(
  "Complete sign-in",
  "Verify your single-use email sign-in link and continue securely to your ReerHub workspace.",
);
export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
