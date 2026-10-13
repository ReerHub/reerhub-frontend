import {
  sitemapChunks,
  sitemapEntries,
  sitemapXml,
  sitemapIndexXml,
  sitemapUnavailable,
  XML_HEADERS,
} from "@/lib/sitemap";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const chunks = sitemapChunks(await sitemapEntries());
    return new Response(
      chunks.length === 1 ? sitemapXml(chunks[0]) : sitemapIndexXml(chunks),
      { headers: XML_HEADERS },
    );
  } catch {
    return sitemapUnavailable();
  }
}
