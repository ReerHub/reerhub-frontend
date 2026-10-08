import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata(
  "Pro Plans & Personalized Job Matching",
  "Choose ReerHub Pro from ₹49 weekly for ranked profile matches and one daily email with up to five strong-fit jobs. Seven-day trial included.",
  "/billing",
);
export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
