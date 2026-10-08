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

test("metadata is bounded, unique and consistent across social tags", () => {
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
