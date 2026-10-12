import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = (path) => readFile(new URL(path, import.meta.url), "utf8");
const url = (code) =>
  `data:text/javascript;base64,${Buffer.from(ts.transpileModule(code, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText).toString("base64")}`;
const seoUrl = url(await source("../lib/seo.ts"));
const seo = await import(seoUrl);
const jobs = await import(url(await source("../lib/job-schema.ts")));
const sitemapSource = (await source("../lib/sitemap.ts"))
  .replace('"./seo"', JSON.stringify(seoUrl))
  .replace(
    'import { jobSlug } from "./reerhub";',
    'const jobSlug = job => `${job.title.toLowerCase().replace(/ /g,"-")}-${job._id}`;',
  );
const sitemap = await import(url(sitemapSource));

test("discovery explicitly offers only jobs with confirmed India eligibility", async () => {
  const page = await source("../app/jobs/page.tsx");
  assert.match(page, /"Tech Jobs in India"/);
  assert.match(
    page,
    /description="Engineering and AI jobs with confirmed India eligibility, from official employer sources\."/,
  );
  assert.doesNotMatch(page, /international openings|International openings/);
  assert.match(page, /locationScope=\{locationScope\}/);
});

test("metadata is bounded, unique and consistent across social tags", () => {
  assert.equal(
    seo.pageMetadata("Jobs | REERHUB", "Jobs", "/jobs").title,
    "Jobs | REERHUB",
  );
  assert.equal(
    seo.pageMetadata("Jobs | ReerHub", "Jobs", "/jobs").title,
    "Jobs | REERHUB",
  );
  const m = seo.pageMetadata(
    "Very long engineering role ".repeat(8),
    "A useful summary ".repeat(30),
    "/jobs/example",
  );
  assert.ok(m.title.length <= 60);
  assert.ok(m.description.length <= 155);
  assert.equal(m.alternates.canonical, "/jobs/example");
  assert.equal(m.openGraph.title, m.title);
  assert.equal(m.twitter.description, m.description);
  assert.equal(m.openGraph.images[0].width, 1200);
  assert.ok(
    !seo
      .safeJsonLd({ name: "</script><script>alert(1)</script>" })
      .includes("<"),
  );
});

test("uppercase identity uses live text and distinguishes ongoing enterprise registration", async () => {
  const wordmark = await source("../components/BrandWordmark.tsx");
  assert.match(wordmark, />REERHUB</);
  const css = await source("../app/globals.css");
  assert.match(
    css,
    /\.brand-wordmark[\s\S]*?--font-inter[\s\S]*?font-weight: 700/,
  );
  const adminCss = await source("../app/admin.css");
  assert.match(
    adminCss,
    /\.admin-ui \.brand \{[\s\S]*?700 22px\/1\.1 var\(--font-inter\)/,
  );
  for (const file of ["../components/Navbar.jsx", "../components/Footer.jsx"]) {
    const text = await source(file);
    assert.match(text, /BrandWordmark/);
    assert.doesNotMatch(text, /src="[^"\n]*(?:logo-text|footer-logo)/);
  }
  for (const file of ["../app/terms/page.tsx", "../app/privacy/page.tsx"]) {
    const text = await source(file);
    assert.match(text, /REERHUB TECHNOLOGIES/);
    assert.match(text, /sole\s+proprietorship/);
    assert.doesNotMatch(text, /registration is in progress/);
    assert.doesNotMatch(text, /®|registered trademark/i);
  }
  const page = await source("../app/page.tsx");
  assert.match(page, /name: "REERHUB"/);
  assert.match(page, /alternateName: "REERHUB TECHNOLOGIES"/);
  assert.match(page, /slogan: "Real Effective Engineering Roles Hub"/);
});

test("public contact surfaces consistently use the support mailbox", async () => {
  for (const file of [
    "../components/Footer.jsx",
    "../app/billing/page.tsx",
    "../app/terms/page.tsx",
    "../app/privacy/page.tsx",
  ]) {
    const text = await source(file);
    assert.match(text, /support@reerhub\.com/);
    assert.doesNotMatch(text, /(?:hello|privacy|billing)@reerhub\.com/);
  }
});

test("only eligible active jobs emit complete structured data", () => {
  const job = {
    title: "Engineer",
    status: "active",
    description: "",
    postedAt: "2025-01-01",
    employmentType: "full-time",
    applicationUrl: "https://example.com/apply",
    companyId: { name: "Example" },
    locations: [{ city: "Pune", country: "India" }],
  };
  const schema = jobs.jobPosting(job, "<p>Build and maintain services.</p>");
  assert.equal(
    jobs.jobPosting({ ...job, publicEligible: false }, "description"),
    null,
  );
  assert.equal(schema.employmentType, "FULL_TIME");
  assert.ok(!("directApply" in schema));
  assert.equal(
    jobs.jobPosting({ ...job, status: "closed" }, "description"),
    null,
  );
  assert.equal(
    jobs.jobPosting({ ...job, postedAt: undefined }, "description"),
    null,
  );
  assert.equal(jobs.jobPosting(job, ""), null);
  assert.equal(jobs.jobPosting({ ...job, locations: [] }, "description"), null);
  assert.equal(
    jobs.jobPosting(
      { ...job, remoteType: "remote", locations: [{ country: "India" }] },
      "100% remote engineering role",
    ).jobLocationType,
    "TELECOMMUTE",
  );
  assert.equal(
    jobs.jobPosting(
      { ...job, remoteType: "remote", locations: [] },
      "100% remote engineering role",
    ),
    null,
  );
});

test("sitemap partitions URLs, escapes XML and preserves actual dates", () => {
  const entries = Array.from({ length: 20001 }, (_, i) => ({
    url: `https://reerhub.com/jobs/${i}`,
  }));
  assert.deepEqual(
    sitemap.sitemapChunks(entries).map((c) => c.length),
    [10000, 10000, 1],
  );
  const xml = sitemap.sitemapXml([
    { url: "https://example.com/?a=1&b=2", updatedAt: "2025-01-01" },
    { url: "https://example.com/other", updatedAt: "invalid" },
  ]);
  assert.ok(xml.includes("&amp;"));
  assert.equal((xml.match(/<lastmod>/g) || []).length, 1);
});

test("sitemap follows cursor beyond anonymous cap and rejects repeated cursors", async () => {
  const original = globalThis.fetch;
  let calls = 0;
  const id = "abcdefabcdefabcdefabcdef";
  try {
    globalThis.fetch = async (u) => {
      if (u.includes("/companies"))
        return Response.json({
          data: [{ slug: "example", updatedAt: "2025-01-01" }],
        });
      calls++;
      return Response.json({
        data: Array.from({ length: 100 }, (_, i) => ({
          _id: `${calls}-${i}`,
          title: "Engineer",
          companyId: { name: "Example" },
          updatedAt: "2025-01-01",
        })),
        nextCursor: calls === 1 ? id : null,
      });
    };
    const entries = await sitemap.sitemapEntries();
    assert.equal(entries.filter((e) => e.url.includes("/jobs/")).length, 200);
    calls = 0;
    globalThis.fetch = async (u) =>
      Response.json(
        u.includes("/companies") ? { data: [] } : { data: [], nextCursor: id },
      );
    await assert.rejects(sitemap.sitemapEntries(), /Invalid sitemap cursor/);
  } finally {
    globalThis.fetch = original;
  }
});

test("deleted job URLs return real 404s before streaming, without hiding outages", async () => {
  const hostUrl = url(await source("../lib/admin-host.ts"));
  const proxySource = (await source("../proxy.ts"))
    .replace('"@/lib/admin-host"', JSON.stringify(hostUrl))
    .replace(
      '"next/server"',
      JSON.stringify(
        new URL("../node_modules/next/server.js", import.meta.url).href,
      ),
    );
  const { proxy } = await import(url(proxySource));
  const { NextRequest } = await import("next/server.js");
  const originalFetch = globalThis.fetch;
  const route = (slug) =>
    proxy(
      new NextRequest(`https://reerhub.com/jobs/${slug}`, {
        headers: { host: "reerhub.com" },
      }),
    );
  const id = "6ac744ab12024421f03b25d2";
  try {
    let calls = 0;
    globalThis.fetch = async (input, options) => {
      calls++;
      assert.ok(String(input).endsWith(`/jobs/${id}`));
      assert.equal(options.cache, "no-store");
      assert.ok(options.signal);
      return new Response("{}", { status: 404 });
    };
    for (const slug of [id, `foreign-role-employer-${id}`]) {
      const result = await route(slug);
      assert.equal(result.status, 404);
      assert.match(
        result.headers.get("x-middleware-rewrite"),
        /__reerhub_not_found/,
      );
      assert.equal(result.headers.get("x-robots-tag"), "noindex, nofollow");
    }
    assert.equal((await route("invalid-id")).status, 404);
    assert.equal(calls, 2);
    for (const status of [200, 429, 503]) {
      globalThis.fetch = async () => new Response("{}", { status });
      assert.equal((await route(id)).headers.get("x-middleware-next"), "1");
    }
    globalThis.fetch = async () => {
      throw new Error("unavailable");
    };
    assert.equal((await route(id)).headers.get("x-middleware-next"), "1");
  } finally {
    globalThis.fetch = originalFetch;
  }
});
