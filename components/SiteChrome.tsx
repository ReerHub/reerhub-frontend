"use client";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import MemberWorkspace from "./MemberWorkspace";
import Footer from "./Footer";
import CookieConsent from "./CookieConsent";
export default function SiteChrome({
  children,
  sessionHint,
  canonicalOrigin,
  analyticsAvailable,
}: {
  children: ReactNode;
  sessionHint: boolean;
  canonicalOrigin: string;
  analyticsAvailable: boolean;
}) {
  const path = usePathname();
  if (path === "/resume" || path.startsWith("/resume/")) return children;
  return (
    <>
      <Navbar sessionHint={sessionHint} />
      <main
        id="main-content"
        className="min-h-dvh relative pt-[72px]"
        tabIndex={-1}
      >
        <MemberWorkspace
          sessionHint={sessionHint}
          canonicalOrigin={canonicalOrigin}
        >
          {children}
        </MemberWorkspace>
      </main>
      <Footer />
      <CookieConsent analyticsAvailable={analyticsAvailable} />
    </>
  );
}
