import "./globals.css";
import { Inter } from "next/font/google";
import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Applied before first paint so the saved theme never flashes.
const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("wareers-theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches)){document.documentElement.classList.add("dark");}}catch(e){}})();`;

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: "Wareers | Engineering & AI jobs in India",
  description:
    "Engineering, data, and AI roles from India's top product companies — indexed daily from official career pages. Apply on the company site.",
  keywords: [
    "Wareers",
    "India tech jobs",
    "engineering jobs India",
    "AI jobs India",
    "SDE jobs",
    "product company careers India",
  ],
  icons: {
    icon: "/wareers-logo-64.png",
    apple: "/wareers-logo-180.png",
  },
  openGraph: {
    title: "Wareers | Engineering & AI jobs in India",
    description:
      "Engineering, data, and AI roles from India's top product companies — indexed daily from official career pages.",
    images: ["/wareers-text-logo-640.png"],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/wareers-text-logo-640.png"],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className={`${inter.className} antialiased`}>
        <Navbar />
        <main className="min-h-screen relative pt-16">{children}</main>
        <Footer />
        <Toaster position="top-right" reverseOrder={false} />
      </body>
    </html>
  );
}
