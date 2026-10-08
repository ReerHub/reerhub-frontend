import HomePage from "@/components/HomePage";
import { pageMetadata, safeJsonLd, SITE } from "@/lib/seo";
export const metadata = pageMetadata(
  "Engineering, AI & Tech Jobs in India",
  "Discover engineering, AI and data jobs from official company career pages in India. Apply free, save roles, or get personalized matches with Pro.",
  "/",
);
export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd([
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              "@id": `${SITE}/#organization`,
              name: "ReerHub",
              url: SITE,
              logo: `${SITE}/reerhub-icon-logo.png`,
            },
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "@id": `${SITE}/#website`,
              name: "ReerHub",
              url: SITE,
              publisher: { "@id": `${SITE}/#organization` },
            },
          ]),
        }}
      />
      <HomePage />
    </>
  );
}
