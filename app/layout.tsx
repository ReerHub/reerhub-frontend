import "./globals.css";
import { Inter } from "next/font/google";
import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";
import { AuthProvider } from "@/components/AuthProvider";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: "ReerHub | Engineering & AI jobs in India",
  description:
    "Engineering, data, and AI roles from India's top product companies — indexed daily from official career pages. Apply on the company site.",
  keywords: [
    "ReerHub",
    "India tech jobs",
    "engineering jobs India",
    "AI jobs India",
    "SDE jobs",
    "product company careers India",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "ReerHub",
    locale: "en_IN",
    url: "/",
    title: "ReerHub | Engineering & AI jobs in India",
    description:
      "Engineering, data, and AI roles from India's top product companies — indexed daily from official career pages.",
    images: ["/reerhub-text-logo-640.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "ReerHub | Engineering & AI jobs in India",
    description:
      "Engineering, data, and AI roles from India's top product companies.",
    images: ["/reerhub-text-logo-640.png"],
  },
  icons: {
    icon: "/reerhub-logo-64.png",
    apple: "/reerhub-logo-180.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen relative pt-16">{children}</main>
          <Footer />
        </AuthProvider>
        <CookieConsent />
        <Toaster position="top-right" reverseOrder={false} />
      </body>
    </html>
  );
}
