import type { ReactNode } from "react";
import { NOINDEX } from "@/lib/seo";
export const metadata = NOINDEX;
export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
