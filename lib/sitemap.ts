import { SITE } from "./seo";
import { jobSlug } from "./reerhub";

const API = (process.env.API_URL || "http://localhost:8000/api/v1").replace(
  /\/$/,
  "",
);
const STATIC = [
  "",
  "jobs",
  "companies",
  "engineering-jobs",
  "ai-jobs",
  "bengaluru-jobs",
  "chennai-jobs",
  "hyderabad-jobs",
  "mumbai-jobs",
  "delhi-jobs",
  "pune-jobs",
  "remote-jobs",
  "billing",
  "privacy",
  "terms",
];
type Entry = { url: string; updatedAt?: string };
export const xmlEscape = (value: string) =>
  value.replace(
    /[<>&"']/g,
    (c) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        '"': "&quot;",
        "'": "&apos;",
      })[c]!,
  );
export function sitemapChunks(entries: Entry[]) {
  const chunks: Entry[][] = [[]];
  let bytes = 0;
  for (const entry of entries) {
    const size = Buffer.byteLength(xmlEscape(entry.url)) + 150;
    if (chunks.at(-1)!.length >= 10000 || bytes + size > 45 * 1024 * 1024) {
      chunks.push([]);
      bytes = 0;
    }
    chunks.at(-1)!.push(entry);
    bytes += size;
  }
  return chunks;
}
async function api(path: string) {
  const res = await fetch(`${API}${path}`, {
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error("Sitemap source unavailable");
  return res.json();
}
export async function sitemapEntries(): Promise<Entry[]> {
  const entries: Entry[] = STATIC.map((path) => ({ url: `${SITE}/${path}` }));
  const companies = await api("/companies");
  if (!Array.isArray(companies.data))
    throw new Error("Invalid companies sitemap feed");
  for (const c of companies.data)
    if (c.slug && c.isActive !== false)
      entries.push({
        url: `${SITE}/companies/${encodeURIComponent(c.slug)}`,
        updatedAt: c.updatedAt,
      });
  let cursor: string | null = null;
  const seen = new Set<string>();
  do {
    const page = await api(
      `/jobs/sitemap?limit=1000${cursor ? `&after=${cursor}` : ""}`,
    );
    if (!Array.isArray(page.data)) throw new Error("Invalid jobs sitemap feed");
    for (const job of page.data)
      if (job._id && job.title && job.companyId)
        entries.push({
          url: `${SITE}/jobs/${jobSlug(job)}`,
          updatedAt: job.updatedAt,
        });
    cursor = page.nextCursor || null;
    if (cursor && (!/^[a-f\d]{24}$/i.test(cursor) || seen.has(cursor)))
      throw new Error("Invalid sitemap cursor");
    if (cursor) seen.add(cursor);
  } while (cursor);
  return [...new Map(entries.map((e) => [e.url, e])).values()];
}
export function sitemapXml(entries: Entry[]) {
  return (
    '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    entries
      .map((e) => {
        const date = e.updatedAt && new Date(e.updatedAt);
        return `<url><loc>${xmlEscape(e.url)}</loc>${date && Number.isFinite(date.getTime()) ? `<lastmod>${date.toISOString()}</lastmod>` : ""}</url>`;
      })
      .join("") +
    "</urlset>"
  );
}
export const XML_HEADERS = {
  "Content-Type": "application/xml; charset=utf-8",
  "Cache-Control": "public, max-age=0, s-maxage=3600",
};
