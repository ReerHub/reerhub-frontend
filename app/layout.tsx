import { SITE } from "@/lib/seo";
import { analyticsConfig } from "@/lib/analytics-config";
import "./globals.css";
import "./admin.css";
import "./public.css";
import "./apple-design.css";
import { Inter, Space_Grotesk } from "next/font/google";
import { headers } from "next/headers";
import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import SiteChrome from "@/components/SiteChrome";
import PublicAnalyticsBoundary from "@/components/PublicAnalyticsBoundary";
import AnalyticsProvider from "@/components/AnalyticsProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { isDedicatedAdminHost } from "@/lib/admin-host";
import PerformanceProbe from "@/components/PerformanceProbe";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
  variable: "--font-space-grotesk",
});

export const metadata = {
  metadataBase: new URL(process.env.SITE_URL || "http://localhost:3000"),
  title: "REERHUB",
  icons: { icon: "/favicon.ico", apple: "/icon.png" },
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const requestHeaders = await headers();
  const isAdminHost =
    isDedicatedAdminHost(requestHeaders.get("host") || "") ||
    requestHeaders.get("x-reerhub-admin-surface") === "1";
  const sessionHint = /(?:^|;\s*)(?:accessToken|refreshToken)=([^;]+)/.test(
    requestHeaders.get("cookie") || "",
  );
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body
        className={`${inter.className} ${inter.variable} ${spaceGrotesk.variable} antialiased ${isAdminHost ? "admin-site" : "public-site"}`}
      >
        {isAdminHost ? (
          <>{children}</>
        ) : (
          <AuthProvider>
            <a href="#main-content" className="skip-link">
              Skip to content
            </a>
            <AnalyticsProvider />
            <PublicAnalyticsBoundary>
              <SiteChrome
                sessionHint={sessionHint}
                canonicalOrigin={SITE}
                analyticsAvailable={analyticsConfig().available}
              >
                {children}
              </SiteChrome>
            </PublicAnalyticsBoundary>
          </AuthProvider>
        )}
        <noscript>
          <style>{`.reveal { opacity: 1 !important; transform: none !important; } .faq-controls, .privacy-panel { display: none !important; }`}</style>
        </noscript>
        <Toaster position="top-right" reverseOrder={false} />
        {process.env.REERHUB_UI_FIXTURES === "1" && <PerformanceProbe />}
      </body>
    </html>
  );
}
