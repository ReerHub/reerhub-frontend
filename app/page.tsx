import { SOCIAL_LINKS } from "@/lib/social-links";
import HomePage from "@/components/HomePage";
import { getHome, listCompanies, DataUnavailableError } from "@/lib/reerhub";
import { pageMetadata, safeJsonLd, SITE } from "@/lib/seo";
export const metadata = pageMetadata(
  "Engineering, AI & Tech Jobs in India",
  "Discover engineering, AI and data jobs from official company career pages in India. Apply free, save roles, or get personalized matches with Pro.",
  "/",
);
export default async function Home() {
  const unavailableAsNull = (error: unknown) => {
    if (error instanceof DataUnavailableError) return null;
    throw error;
  };
  const [data, directory] = await Promise.all([
    getHome().catch(unavailableAsNull),
    listCompanies().catch(unavailableAsNull),
  ]);
  const logoCompanies = (directory ?? data?.companies ?? []).map(
    ({ _id, name, slug, logoUrl }) => ({ _id, name, slug, logoUrl }),
  );
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
              name: "REERHUB",
              alternateName: "REERHUB TECHNOLOGIES",
              legalName: "REERHUB TECHNOLOGIES",
              slogan: "Real Effective Engineering Roles Hub",
              url: SITE,
              logo: `${SITE}/reerhub-icon-logo.png`,
              sameAs: SOCIAL_LINKS.map((link) => link.url),
            },
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "@id": `${SITE}/#website`,
              name: "REERHUB",
              url: SITE,
              publisher: { "@id": `${SITE}/#organization` },
            },
          ]),
        }}
      />
      <HomePage data={data} logoCompanies={logoCompanies} />
    </>
  );
}
