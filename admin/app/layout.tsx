import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ReerHub Admin",
  description: "ReerHub operations console",
  robots: { index: false, follow: false },
};

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // System fonts keep this operational tool buildable even where outbound
  // font requests are blocked; the public brand typography is unaffected.
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
