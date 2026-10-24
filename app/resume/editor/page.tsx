import type { Metadata } from "next";
import Workspace from "@/components/resume/Workspace";
export const metadata: Metadata = {
  title: { absolute: "Your resume | REERHUB Resume Builder" },
  alternates: { canonical: null },
  robots: { index: false, follow: false },
};
export default function Page() {
  return <Workspace />;
}
