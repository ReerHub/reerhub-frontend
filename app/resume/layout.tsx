import type { ReactNode } from "react";
import Providers from "@/components/resume/Providers";
import "./resume.css";
export default function ResumeLayout({ children }: { children: ReactNode }) {
  return (
    <div className="resume-app">
      <Providers>{children}</Providers>
    </div>
  );
}
