import { accountMetadata } from "@/lib/seo";
import type { ReactNode } from "react";
export const metadata = accountMetadata(
  "Verify your email",
  "Verify your email address securely and continue to your ReerHub account.",
);
export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
