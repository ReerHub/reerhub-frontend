import type { Metadata } from "next";

// Used for server metadata and structured data; client imports only call safeJsonLd.
export const SITE = (process.env.SITE_URL || "http://localhost:3000")
  .trim()
  .replace(/\/+$/, "");
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
  const brand = " | REERHUB";
  const fullTitle =
    concise(title.replace(/\s*\|\s*REERHUB$/i, ""), 60 - brand.length) + brand;
  const summary = concise(description, 155);
  const images = [
    {
      url: "/share-image",
      width: 1200,
      height: 630,
      alt: "REERHUB — official tech openings and Pro career intelligence",
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
      siteName: "REERHUB",
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

// Employer identity must survive long role titles. There is no search-engine
// requirement to truncate every title to sixty characters.
export function jobMetadata(
  title: string,
  employer: string,
  description: string,
  path: string,
): Metadata {
  const metadata = pageMetadata(title, description, path);
  const fullTitle = `${concise(title, 80)} at ${employer} | REERHUB`;
  return {
    ...metadata,
    title: fullTitle,
    openGraph: { ...metadata.openGraph, title: fullTitle },
    twitter: { ...metadata.twitter, title: fullTitle },
  };
}

/** Private route identity only: never emit member/profile data or public canonicals. */
export function workspaceMetadata(
  title: string,
  description: string,
): Metadata {
  return {
    title: { absolute: `${title} | REERHUB workspace` },
    description: concise(description, 155),
    ...NOINDEX,
    alternates: { canonical: null },
  };
}
export function accountMetadata(title: string, description: string): Metadata {
  return {
    ...workspaceMetadata(title, description),
    title: `${title} | REERHUB`,
  };
}

/** Unfiltered directory pages contain different employers; filters stay non-indexable. */
export function companyDirectoryMetadata(
  page: number,
  filtered: boolean,
): Metadata {
  const metadata = pageMetadata(
    `Product Companies Hiring in India${page > 1 ? ` — Page ${page}` : ""}`,
    "Explore companies hiring engineering, AI and data talent in India. Browse their official openings and find the team behind your next tech role.",
    page > 1 ? `/companies?page=${page}` : "/companies",
  );
  return {
    ...metadata,
    ...(filtered ? { robots: { index: false, follow: true } } : {}),
  };
}
