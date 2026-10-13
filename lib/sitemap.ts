import { JOB_LANDINGS, editorialReady } from "./seo-landings";
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
  "backend-jobs",
  "frontend-jobs",
  "full-stack-jobs",
  "data-engineering-jobs",
  "devops-jobs",
  "qa-jobs",
  "about",
  "matching-methodology",
  "contact",
  "privacy",
  "terms",
];
type Entry = { url: string };
export const SITEMAP_URL_LIMIT = 10000;
export const SITEMAP_BYTE_LIMIT = 45 * 1024 * 1024;
const XML_START =
  '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
const XML_END = "</urlset>";
const entryXml = (entry: Entry) =>
  `<url><loc>${xmlEscape(entry.url)}</loc></url>`;
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
  const overhead = Buffer.byteLength(XML_START + XML_END);
  let bytes = overhead;
  for (const entry of entries) {
    const size = Buffer.byteLength(entryXml(entry));
    if (overhead + size > SITEMAP_BYTE_LIMIT)
      throw new Error("Sitemap entry exceeds size limit");
    if (
      chunks.at(-1)!.length >= SITEMAP_URL_LIMIT ||
      bytes + size > SITEMAP_BYTE_LIMIT
    ) {
      chunks.push([]);
      bytes = overhead;
    }
    chunks.at(-1)!.push(entry);
    bytes += size;
  }
  return chunks;
}
type Feed = {
  data: unknown[];
  editorialInventory?: { activeRoles: number; employers: number };
  nextCursor?: unknown;
};
async function api(path: string): Promise<Feed> {
  const res = await fetch(`${API}${path}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error("Sitemap source unavailable");
  const value = await res.json();
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    value.success === false ||
    !Array.isArray(value.data)
  )
    throw new Error("Invalid sitemap source response");
  const inventory = value.editorialInventory;
  if (
    inventory != null &&
    (!inventory ||
      typeof inventory !== "object" ||
      !Number.isInteger(inventory.activeRoles) ||
      inventory.activeRoles < 0 ||
      !Number.isInteger(inventory.employers) ||
      inventory.employers < 0)
  )
    throw new Error("Invalid editorial inventory");
  return value;
}
export async function sitemapEntries(): Promise<Entry[]> {
  const entries: Entry[] = STATIC.map((path) => ({ url: `${SITE}/${path}` }));
  // These four reads are independent; later cursor pages remain sequential.
  const [freshers, internships, companies, firstJobs] = await Promise.all([
    api("/jobs?earlyCareer=fresher&limit=1"),
    api("/jobs?earlyCareer=internship&limit=1"),
    api("/companies"),
    api("/jobs/sitemap?limit=1000"),
  ]);
  for (const [path, inventory] of [
    ["fresher-jobs", freshers.editorialInventory],
    ["internship-jobs", internships.editorialInventory],
  ] as const) {
    if (editorialReady(JOB_LANDINGS[path], inventory))
      entries.push({ url: `${SITE}/${path}` });
  }
  if (!Array.isArray(companies.data))
    throw new Error("Invalid companies sitemap feed");
  for (const row of companies.data) {
    if (!row || typeof row !== "object")
      throw new Error("Invalid company sitemap record");
    const company = row as { slug?: unknown; isActive?: unknown };
    if (company.isActive === false) continue;
    if (typeof company.slug !== "string" || !company.slug.trim())
      throw new Error("Invalid company sitemap record");
    entries.push({
      url: `${SITE}/companies/${encodeURIComponent(company.slug)}`,
    });
  }
  let page = firstJobs;
  const seen = new Set<string>();
  while (true) {
    if (!Array.isArray(page.data)) throw new Error("Invalid jobs sitemap feed");
    for (const row of page.data) {
      if (!row || typeof row !== "object")
        throw new Error("Invalid job sitemap record");
      const job = row as {
        _id?: unknown;
        title?: unknown;
        companyId?: { name?: unknown; isActive?: boolean };
        publicEligible?: boolean;
        status?: string;
      };
      if (
        job.publicEligible === false ||
        job.companyId?.isActive === false ||
        (job.status && job.status !== "active")
      )
        continue;
      if (
        typeof job._id !== "string" ||
        !/^[a-f\d]{24}$/i.test(job._id) ||
        typeof job.title !== "string" ||
        !job.title.trim() ||
        typeof job.companyId?.name !== "string" ||
        !job.companyId.name.trim()
      )
        throw new Error("Invalid job sitemap record");
      entries.push({
        url: `${SITE}/jobs/${jobSlug({ _id: job._id, title: job.title, companyId: { name: job.companyId.name } })}`,
      });
    }
    const cursor = page.nextCursor;
    if (cursor == null) break;
    if (
      typeof cursor !== "string" ||
      !/^[a-f\d]{24}$/i.test(cursor) ||
      seen.has(cursor)
    )
      throw new Error("Invalid sitemap cursor");
    seen.add(cursor);
    page = await api(`/jobs/sitemap?limit=1000&after=${cursor}`);
  }
  return [...new Map(entries.map((entry) => [entry.url, entry])).values()];
}
export function sitemapXml(entries: Entry[]) {
  return XML_START + entries.map(entryXml).join("") + XML_END;
}
export function sitemapIndexXml(chunks: Entry[][]) {
  return (
    '<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    chunks
      .map(
        (_, i) =>
          `<sitemap><loc>${xmlEscape(`${SITE}/sitemaps/${i}`)}</loc></sitemap>`,
      )
      .join("") +
    "</sitemapindex>"
  );
}
export function sitemapUnavailable() {
  return new Response("Sitemap temporarily unavailable", {
    status: 503,
    headers: {
      "Cache-Control": "no-store",
      "Retry-After": "60",
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
export const XML_HEADERS = {
  "Content-Type": "application/xml; charset=utf-8",
  "Cache-Control": "no-store",
};
