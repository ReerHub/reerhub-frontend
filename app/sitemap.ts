import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

type SitemapEntry = MetadataRoute.Sitemap[number];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE}/jobs`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE}/engineering`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE}/ai`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE}/companies`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  // Enrich with live company + job URLs. Never fail the build if the
  // backend is down — fall back to static routes.
  try {
    const [companiesRes, jobsRes] = await Promise.all([
      fetch(`${API_BASE}/companies`, { next: { revalidate: 86400 } }),
      fetch(`${API_BASE}/jobs?limit=100&indiaOnly=false`, {
        next: { revalidate: 86400 },
      }),
    ]);
    const dynamic: SitemapEntry[] = [];
    if (companiesRes.ok) {
      const json = await companiesRes.json();
      for (const c of json.data ?? []) {
        if (c.slug) {
          dynamic.push({
            url: `${BASE}/companies/${c.slug}`,
            lastModified: now,
            changeFrequency: "daily",
            priority: 0.7,
          });
        }
      }
    }
    if (jobsRes.ok) {
      const json = await jobsRes.json();
      for (const j of json.data ?? []) {
        if (j._id) {
          dynamic.push({
            url: `${BASE}/jobs/${j._id}`,
            lastModified: j.postedAt ? new Date(j.postedAt) : now,
            changeFrequency: "daily",
            priority: 0.6,
          });
        }
      }
    }
    return [...staticRoutes, ...dynamic];
  } catch {
    return staticRoutes;
  }
}
