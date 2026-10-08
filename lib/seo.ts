import type { Metadata } from "next";

// Used for server metadata and structured data; client imports only call safeJsonLd.
export const SITE = (process.env.SITE_URL || "http://localhost:3000").replace(
  /\/$/,
  "",
);
export const NOINDEX: Metadata = { robots: { index: false, follow: false } };

export function concise(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const boundary = cut.lastIndexOf(" ");
  return `${boundary > max / 2 ? cut.slice(0, boundary) : cut}…`;
}

export function pageMetadata(
  title: string,
  description: string,
  path: string,
): Metadata {
  const brand = " | ReerHub";
  const fullTitle =
    concise(title.replace(/\s*\|\s*ReerHub$/, ""), 60 - brand.length) + brand;
  const summary = concise(description, 155);
  const images = [
    {
      url: "/share-image",
      width: 1200,
      height: 630,
      alt: "ReerHub — official tech openings and Pro career intelligence",
    },
  ];
  return {
    title: fullTitle,
    description: summary,
    alternates: { canonical: path },
    openGraph: {
      title: fullTitle,
      description: summary,
      url: path,
      type: "website",
      siteName: "ReerHub",
      locale: "en_IN",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: summary,
      images,
    },
  };
}

export const safeJsonLd = (value: unknown) =>
  JSON.stringify(value).replace(/</g, "\\u003c");

export function breadcrumb(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE}${item.path}`,
    })),
  };
}
