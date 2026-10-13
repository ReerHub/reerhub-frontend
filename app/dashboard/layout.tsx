import type { ReactNode } from "react";
export const metadata = {
  title: {
    default: "Your workspace | REERHUB",
    template: "%s | REERHUB workspace",
  },
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};
export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return children;
}
