import { accountMetadata } from "@/lib/seo";
import type { ReactNode } from "react";
export const metadata = accountMetadata(
  "Sign in",
  "Sign in to ReerHub with Google or an email magic link to access your private job-search workspace.",
);
export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
