import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  // Staging is publicly reachable (no SSO) for testing — keep crawlers out.
  if (base.includes("staging")) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/profile",
          "/login",
          "/signup",
          "/verify-email",
          "/verify-magic",
          "/forgot-password",
          "/reset-password",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
