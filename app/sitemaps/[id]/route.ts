import {
  sitemapChunks,
  sitemapEntries,
  sitemapXml,
  XML_HEADERS,
} from "@/lib/sitemap";
export const dynamic = "force-dynamic";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) return new Response("Not found", { status: 404 });
  try {
    const chunk = sitemapChunks(await sitemapEntries())[Number(id)];
    if (!chunk) return new Response("Not found", { status: 404 });
    return new Response(sitemapXml(chunk), { headers: XML_HEADERS });
  } catch {
    return new Response("Sitemap temporarily unavailable", {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
