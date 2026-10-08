import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.SITE_URL || "http://localhost:3000";
  // Let crawlers read staging's noindex headers instead of blocking them.
  if (base.includes("staging")) {
    return { rules: [{ userAgent: "*", allow: "/" }] };
  }
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin-api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
