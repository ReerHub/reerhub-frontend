import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { JSDOM } from "jsdom";
import { compileFixture } from "./location-fixtures.mjs";
const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const origin = "https://reerhub.com";
const seoUrl = compileFixture(`export const SITE=${JSON.stringify(origin)};`);
const landingsUrl = compileFixture(await read("../lib/seo-landings.ts"));
const slugSource = await read("../lib/reerhub.ts");
const slugUrl = compileFixture(
  slugSource.slice(slugSource.indexOf("export const slugify")),
);
const sitemapSource = (await read("../lib/sitemap.ts"))
  .replace(
    '"./blog-catalog"',
    JSON.stringify(compileFixture(await read("../lib/blog-catalog.ts"))),
  )
  .replace('"./seo"', JSON.stringify(seoUrl))
  .replace('"./seo-landings"', JSON.stringify(landingsUrl))
  .replace('"./reerhub"', JSON.stringify(slugUrl));
const sitemapUrl = compileFixture(sitemapSource);
const sitemap = await import(sitemapUrl);
const primary = await import(
  compileFixture(
    (await read("../app/sitemap.xml/route.ts")).replace(
      '"@/lib/sitemap"',
      JSON.stringify(sitemapUrl),
    ),
  )
);
const child = await import(
  compileFixture(
    (await read("../app/sitemaps/[id]/route.ts")).replace(
      '"@/lib/sitemap"',
      JSON.stringify(sitemapUrl),
    ),
  )
);
const xml = (body) =>
  new JSDOM(body, { contentType: "application/xml" }).window.document;
const job = (i) => ({
  _id: i.toString(16).padStart(24, "0"),
  title: "Engineer & data",
  companyId: { name: "Employer" },
  updatedAt: "2026-10-13T00:00:00Z",
});
const feeds = (url, init) => {
  assert.equal(init.cache, "no-store");
  assert.ok(init.signal);
  if (url.includes("earlyCareer="))
    return Response.json({
      data: [],
      editorialInventory: { activeRoles: 0, employers: 0 },
    });
  if (url.endsWith("/companies"))
    return Response.json({
      data: [
        { slug: "example", updatedAt: "2026-10-13" },
        { slug: "example" },
        { slug: "inactive", isActive: false },
      ],
    });
  return Response.json({ data: [job(1), job(1)], nextCursor: null });
};

test("root sitemap contains canonical public URLs directly and preserves the legacy child", async () => {
  const prior = globalThis.fetch;
  globalThis.fetch = async (...args) => feeds(...args);
  try {
    const response = await primary.GET();
    assert.equal(response.status, 200);
    assert.match(
      response.headers.get("Content-Type"),
      /application\/xml.*utf-8/,
    );
    assert.equal(response.headers.get("Cache-Control"), "no-store");
    const body = await response.text(),
      doc = xml(body),
      urls = [...doc.querySelectorAll("url > loc")].map((e) => e.textContent);
    assert.equal(doc.documentElement.localName, "urlset");
    assert.equal(
      doc.documentElement.namespaceURI,
      "http://www.sitemaps.org/schemas/sitemap/0.9",
    );
    assert.equal(new Set(urls).size, urls.length);
    assert.ok(
      urls.every(
        (value) =>
          new URL(value).origin === origin &&
          !new URL(value).search &&
          !new URL(value).hash,
      ),
    );
    assert.ok(urls.some((value) => value === origin + "/companies/example"));
    assert.ok(
      urls.some((value) => value.includes("/jobs/engineer-data-employer-")),
    );
    assert.ok(
      !urls.some((value) =>
        /dashboard|login|profile|admin|verify-|\/api\/|inactive|fresher-jobs|internship-jobs/.test(
          value,
        ),
      ),
    );
    assert.doesNotMatch(body, /<lastmod>|<priority>|<changefreq>/);
    const legacy = await child.GET(new Request(origin + "/sitemaps/0"), {
      params: Promise.resolve({ id: "0" }),
    });
    assert.equal(await legacy.text(), body);
    assert.equal(
      (
        await child.GET(new Request(origin + "/sitemaps/1"), {
          params: Promise.resolve({ id: "1" }),
        })
      ).status,
      404,
    );
    assert.equal(
      (
        await child.GET(new Request(origin + "/sitemaps/bad"), {
          params: Promise.resolve({ id: "bad" }),
        })
      ).status,
      404,
    );
  } finally {
    globalThis.fetch = prior;
  }
});

test("large inventories produce an index with complete, bounded child maps", async () => {
  const prior = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    if (!url.includes("/jobs/sitemap")) return feeds(url, init);
    const cursor = new URL(url).searchParams.get("after");
    const offset = cursor ? parseInt(cursor, 16) : 0;
    const count = Math.min(1000, 10001 - offset);
    return Response.json({
      data: Array.from({ length: count }, (_, i) => job(offset + i + 1)),
      nextCursor:
        offset + count < 10001
          ? (offset + count).toString(16).padStart(24, "0")
          : null,
    });
  };
  try {
    const response = await primary.GET(),
      doc = xml(await response.text());
    assert.equal(doc.documentElement.localName, "sitemapindex");
    assert.deepEqual(
      [...doc.querySelectorAll("sitemap > loc")].map((e) => e.textContent),
      [origin + "/sitemaps/0", origin + "/sitemaps/1"],
    );
    let all = [];
    for (const id of ["0", "1"]) {
      const part = await child.GET(new Request(origin + "/sitemaps/" + id), {
        params: Promise.resolve({ id }),
      });
      const body = await part.text();
      assert.ok(Buffer.byteLength(body) <= sitemap.SITEMAP_BYTE_LIMIT);
      const urls = [...xml(body).querySelectorAll("url > loc")].map(
        (e) => e.textContent,
      );
      assert.ok(urls.length <= sitemap.SITEMAP_URL_LIMIT);
      all.push(...urls);
    }
    assert.equal(all.filter((value) => value.includes("/jobs/")).length, 10001);
    assert.equal(new Set(all).size, all.length);
  } finally {
    globalThis.fetch = prior;
  }
});

test("chunk byte limits include escaped UTF-8 entries and XML framing", () => {
  // Escaping greatly expands this input; estimating raw URL bytes would miss the split.
  const entries = Array.from({ length: 25 }, (_, i) => ({
    url: origin + "/" + i + "雪&".repeat(250000),
  }));
  const chunks = sitemap.sitemapChunks(entries);
  assert.ok(chunks.length > 1);
  assert.equal(chunks.flat().length, entries.length);
  for (const chunk of chunks)
    assert.ok(
      Buffer.byteLength(sitemap.sitemapXml(chunk)) <=
        sitemap.SITEMAP_BYTE_LIMIT,
    );
  assert.throws(
    () =>
      sitemap.sitemapChunks([
        { url: "&".repeat(sitemap.SITEMAP_BYTE_LIMIT / 5) },
      ]),
    /exceeds size limit/,
  );
});

test("independent sources begin together; full company inventory and early-career thresholds remain intact", async () => {
  const prior = globalThis.fetch,
    started = [],
    pending = [];
  globalThis.fetch = (url, init) =>
    new Promise((resolve) => {
      assert.equal(init.cache, "no-store");
      started.push(url);
      pending.push(() =>
        resolve(
          Response.json(
            url.includes("earlyCareer=")
              ? {
                  data: [],
                  editorialInventory: { activeRoles: 5, employers: 2 },
                }
              : url.endsWith("/companies")
                ? {
                    data: Array.from({ length: 150 }, (_, i) => ({
                      slug: "company-" + i,
                    })),
                  }
                : { data: [], nextCursor: null },
          ),
        ),
      );
    });
  try {
    const read = sitemap.sitemapEntries();
    assert.equal(started.length, 4);
    for (const resolve of pending) resolve();
    const entries = await read;
    assert.equal(
      entries.filter((e) => e.url.includes("/companies/")).length,
      150,
    );
    assert.ok(entries.some((e) => e.url.endsWith("/fresher-jobs")));
    assert.ok(entries.some((e) => e.url.endsWith("/internship-jobs")));
  } finally {
    globalThis.fetch = prior;
  }
});

test("outages and malformed feeds fail closed with 503 and retry guidance", async () => {
  const prior = globalThis.fetch;
  try {
    for (const bad of [
      () => new Response("", { status: 503 }),
      () => Response.json({ data: null }),
      () =>
        Response.json({
          data: [
            { _id: "bad", title: "Engineer", companyId: { name: "Employer" } },
          ],
        }),
      () => Response.json({ data: [], nextCursor: "bad" }),
      () => Response.json({ success: false, data: [] }),
      () => new Response("broken json"),
    ]) {
      globalThis.fetch = async (url, init) =>
        url.includes("/jobs/sitemap") ? bad() : feeds(url, init);
      for (const response of [
        await primary.GET(),
        await child.GET(new Request(origin + "/sitemaps/0"), {
          params: Promise.resolve({ id: "0" }),
        }),
      ]) {
        assert.equal(response.status, 503);
        assert.equal(response.headers.get("Retry-After"), "60");
        assert.equal(response.headers.get("Cache-Control"), "no-store");
        assert.doesNotMatch(await response.text(), /<urlset|<sitemapindex/);
      }
    }
    globalThis.fetch = async (url, init) =>
      url.endsWith("/companies")
        ? Response.json({ data: [{ slug: "" }] })
        : feeds(url, init);
    assert.equal((await primary.GET()).status, 503);
  } finally {
    globalThis.fetch = prior;
  }
});

test("robots preserves public AI/search access, rendering and readable noindex routes", async () => {
  const source = await read("../app/robots.ts");
  for (const base of [
    origin,
    origin + "/",
    "  " + origin + "///  ",
    "https://staging.reerhub.com/",
  ]) {
    const routeModule = await import(
      compileFixture(
        source.replace(
          '"@/lib/seo"',
          JSON.stringify(
            compileFixture(
              (await read("../lib/seo.ts")).replace(
                'process.env.SITE_URL || "http://localhost:3000"',
                JSON.stringify(base),
              ),
            ),
          ),
        ),
      )
    );
    const value = routeModule.default();
    assert.deepEqual(value.rules[0].userAgent, "*");
    assert.equal(value.rules[0].allow, "/");
    if (base.includes("staging")) assert.equal(value.sitemap, undefined);
    else {
      assert.equal(value.sitemap, origin + "/sitemap.xml");
      assert.deepEqual(value.rules[0].disallow, ["/api/", "/admin-api/"]);
    }
  }
});

test("llms guidance uses absolute links to real public routes and accurate member boundaries", async () => {
  const source = (await read("../app/llms.txt/route.ts")).replace(
    '"@/lib/seo"',
    JSON.stringify(seoUrl),
  );
  const routeModule = await import(compileFixture(source));
  const response = routeModule.GET(),
    body = await response.text();
  assert.match(response.headers.get("Content-Type"), /text\/plain.*utf-8/);
  assert.match(body, /^# REERHUB\n\n>/);
  assert.match(body, /protected member workspace/);
  assert.match(body, /relevance, not hiring probability/);
  assert.doesNotMatch(
    body,
    /\/#why|\/dashboard|\/profile|\/login|\/api\/|\{title\}|₹|INR|15-minute|indexed daily/,
  );
  const links = [...body.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)].map(
    (match) => new URL(match[1]),
  );
  assert.ok(links.length >= 25);
  for (const link of links) {
    assert.equal(link.origin, origin);
    assert.equal(link.hash, "");
    assert.equal(link.search, "");
    const file =
      link.pathname === "/sitemap.xml"
        ? "../app/sitemap.xml/route.ts"
        : "../app" + link.pathname + "/page.tsx";
    try {
      await read(file);
    } catch {
      const landings = await import(landingsUrl);
      assert.ok(
        landings.JOB_LANDINGS[link.pathname.slice(1)],
        "missing public page " + link.pathname,
      );
    }
  }
});
