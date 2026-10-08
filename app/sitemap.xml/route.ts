import { SITE } from "@/lib/seo";
import {
  sitemapChunks,
  sitemapEntries,
  XML_HEADERS,
  xmlEscape,
} from "@/lib/sitemap";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const chunks = sitemapChunks(await sitemapEntries());
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
        chunks
          .map(
            (_, i) =>
              `<sitemap><loc>${xmlEscape(`${SITE}/sitemaps/${i}`)}</loc></sitemap>`,
          )
          .join("") +
        "</sitemapindex>",
      { headers: XML_HEADERS },
    );
  } catch {
    return new Response("Sitemap temporarily unavailable", {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
