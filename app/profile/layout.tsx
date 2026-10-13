import type { ReactNode } from "react";
import { accountMetadata } from "@/lib/seo";
export const metadata = accountMetadata(
  "Profile & preferences",
  "Manage your private ReerHub profile, job preferences, alerts and account data.",
);
export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
