import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const base = SITE;
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
