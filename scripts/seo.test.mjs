import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";
import { compileFixture } from "./location-fixtures.mjs";

const source = (path) => readFile(new URL(path, import.meta.url), "utf8");
const url = (code) =>
  `data:text/javascript;base64,${Buffer.from(ts.transpileModule(code, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText).toString("base64")}`;
const seoUrl = url(await source("../lib/seo.ts"));
const seo = await import(seoUrl);
const jobs = await import(url(await source("../lib/job-schema.ts")));
const landingsUrl = url(await source("../lib/seo-landings.ts"));
const sitemapSource = (await source("../lib/sitemap.ts"))
  .replace(
    '"./blog-catalog"',
    JSON.stringify(url(await source("../lib/blog-catalog.ts"))),
  )
  .replace('"./seo-landings"', JSON.stringify(landingsUrl))
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
    "../components/pages/BillingContent.tsx",
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
    postedAtProvenance: "employer",
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

test("sitemap partitions URLs, escapes XML and omits generic persistence dates", () => {
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
  assert.equal((xml.match(/<lastmod>/g) || []).length, 0);
});

test("sitemap follows cursor beyond anonymous cap and rejects repeated cursors", async () => {
  const original = globalThis.fetch;
  let calls = 0;
  const id = "abcdefabcdefabcdefabcdef";
  try {
    globalThis.fetch = async (u) => {
      if (u.includes("earlyCareer=") || u.includes("skills="))
        return Response.json({
          data: [],
          editorialInventory: { activeRoles: 0, employers: 0 },
        });
      if (u.includes("/companies"))
        return Response.json({
          data: [{ slug: "example", updatedAt: "2025-01-01" }],
        });
      calls++;
      return Response.json({
        data: Array.from({ length: 100 }, (_, i) => ({
          _id: String((calls - 1) * 100 + i).padStart(24, "0"),
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
        u.includes("/companies") ||
          u.includes("earlyCareer=") ||
          u.includes("skills=")
          ? { data: [], editorialInventory: { activeRoles: 0, employers: 0 } }
          : { data: [], nextCursor: id },
      );
    await assert.rejects(sitemap.sitemapEntries(), /Invalid sitemap cursor/);
  } finally {
    globalThis.fetch = original;
  }
});

test("deleted job URLs return real 404s before streaming, without hiding outages", async () => {
  const hostUrl = url(await source("../lib/admin-host.ts"));
  const reerhubSource = await source("../lib/reerhub.ts");
  const reerhubUrl = url(
    reerhubSource.slice(reerhubSource.indexOf("export const slugify")),
  );
  const statusUrl = url(
    (await source("../lib/public-route-status.ts"))
      .replace('"./seo-landings"', JSON.stringify(landingsUrl))
      .replace('"./reerhub"', JSON.stringify(reerhubUrl))
      .replace(
        '"next/server"',
        JSON.stringify(
          new URL("../node_modules/next/server.js", import.meta.url).href,
        ),
      ),
  );
  const proxySource = (await source("../proxy.ts"))
    .replace('"@/lib/public-route-status"', JSON.stringify(statusUrl))
    .replace('"@/lib/reerhub"', JSON.stringify(reerhubUrl))
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
      assert.equal(new URL(input).searchParams.get("id"), id);
      assert.ok(String(input).includes("/discovery/status?kind=job"));
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
      assert.equal((await route(id)).status, 503);
    }
    globalThis.fetch = async () =>
      Response.json({
        success: true,
        data: {
          _id: id,
          title: "Backend Engineer",
          companyId: { name: "Fixture Labs" },
        },
      });
    const moved = await route(id);
    assert.equal(moved.status, 308);
    assert.match(
      moved.headers.get("location"),
      /backend-engineer-fixture-labs-/,
    );
    assert.equal(
      (await route(`backend-engineer-fixture-labs-${id}`)).headers.get(
        "x-middleware-next",
      ),
      "1",
    );
    globalThis.fetch = async () => {
      throw new Error("unavailable");
    };
    assert.equal((await route(id)).status, 503);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("original date provenance, deadlines and employer identity remain truthful", () => {
  const job = {
    title: "Engineer",
    status: "active",
    postedAt: "2025-01-01",
    postedAtProvenance: "employer",
    applicationUrl: "https://example.com/apply",
    companyId: { name: "Example" },
    locations: [{ city: "Pune", country: "India" }],
  };
  assert.equal(
    jobs.jobPosting({ ...job, postedAtProvenance: undefined }, "Description"),
    null,
  );
  assert.equal(
    jobs.jobPosting(
      { ...job, applicationDeadline: "2020-01-01" },
      "Description",
    ),
    null,
  );
  assert.equal(
    jobs.jobPosting(
      { ...job, applicationDeadline: "2099-01-01" },
      "Description",
    ).validThrough,
    "2099-01-01T00:00:00.000Z",
  );
  const metadata = seo.jobMetadata(
    "Very long role ".repeat(15),
    "Distinct Employer Identity",
    "Description",
    "/jobs/role",
  );
  assert.match(metadata.title, /at Distinct Employer Identity/);
  assert.equal(metadata.openGraph.title, metadata.title);
});

test("expired or malformed deadlines share one availability decision", async () => {
  const now = Date.parse("2026-10-15T12:00:00Z");
  const job = { status: "active", publicEligible: true };
  assert.equal(jobs.jobAvailable(job, now), true);
  for (const overrides of [
    { status: "closed" },
    { publicEligible: false },
    { applicationDeadline: "2026-10-15T12:00:00Z" },
    { applicationDeadline: "2026-10-14T12:00:00Z" },
    { applicationDeadline: "invalid" },
  ])
    assert.equal(jobs.jobAvailable({ ...job, ...overrides }, now), false);
  assert.equal(
    jobs.jobAvailable(
      { ...job, applicationDeadline: "2026-10-16T12:00:00Z" },
      now,
    ),
    true,
  );
  const detail = await source("../components/pages/JobDetailContent.tsx");
  assert.match(detail, /const available = jobAvailable\(job\)/);
  assert.match(detail, /const canApply = jobAvailable\(job\)/);
  assert.match(detail, /closed \? "Closed: " : "Unavailable: "/);
});

test("structured job addresses omit work arrangements but preserve real regions", () => {
  const job = {
    title: "Engineer",
    status: "active",
    postedAt: "2025-01-01",
    postedAtProvenance: "employer",
    applicationUrl: "https://example.com/apply",
    companyId: { name: "Example" },
  };
  for (const state of [
    "Onsite",
    "on-site",
    "Hybrid",
    " remote ",
    "fully remote",
    "100% remote",
    "Karnataka",
    "Karnataka, Onsite",
  ]) {
    const schema = jobs.jobPosting(
      { ...job, locations: [{ city: "Bengaluru", state, country: "India" }] },
      "Build services",
    );
    const address = JSON.parse(JSON.stringify(schema)).jobLocation[0].address;
    assert.equal(address.addressLocality, "Bengaluru");
    assert.equal(address.addressCountry, "India");
    assert.equal(
      address.addressRegion,
      state.startsWith("Karnataka") ? "Karnataka" : undefined,
    );
  }
});

test("directory pages have distinct canonicals; filters are noindex", () => {
  assert.equal(
    seo.companyDirectoryMetadata(1, false).alternates.canonical,
    "/companies",
  );
  const second = seo.companyDirectoryMetadata(2, false);
  assert.equal(second.alternates.canonical, "/companies?page=2");
  assert.match(second.title, /Page 2/);
  assert.equal(second.robots, undefined);
  assert.equal(seo.companyDirectoryMetadata(2, true).robots.index, false);
});

test("directory metadata follows pagination without fetching the catalog", async () => {
  const code = (await source("../app/companies/page.tsx"))
    .replace(/import[\s\S]*?from "[^"]+";/g, "")
    .replace("export default async function", "async function");
  globalThis.directoryMetadataFixture = {
    companyDirectoryMetadata: seo.companyDirectoryMetadata,
  };
  try {
    const { generateMetadata } = await import(
      compileFixture(`
      const {companyDirectoryMetadata}=globalThis.directoryMetadataFixture;
      const listCompanyPage=()=>{throw Error("metadata must not fetch inventory")};
      ${code}
    `)
    );
    const metadata = await generateMetadata({
      searchParams: Promise.resolve({ page: "2" }),
    });
    assert.equal(metadata.alternates.canonical, "/companies?page=2");
    assert.equal(metadata.robots, undefined);
  } finally {
    delete globalThis.directoryMetadataFixture;
  }
});

test("job snippets distinguish employer closure from unavailable publication", async () => {
  const code = (
    await source("../components/pages/JobDetailContent.tsx")
  ).replace(/import[\s\S]*?from "[^"]+";/g, "");
  const fixture = {
    ...jobs,
    jobMetadata: seo.jobMetadata,
    concise: seo.concise,
    getJob: async () => globalThis.jobMetadataFixture.job,
  };
  globalThis.jobMetadataFixture = fixture;
  try {
    const { generateMetadata } = await import(
      compileFixture(`
      const {jobAvailable,deadlineExpired,jobMetadata,concise,getJob}=globalThis.jobMetadataFixture;
      const parseJobSlug=()=>"012345678901234567890123", jobSlug=()=>"test-role-012345678901234567890123";
      class NotFoundError extends Error {}
      ${code}
    `)
    );
    for (const [overrides, prefix, phrase] of [
      [{ status: "closed" }, "Closed:", "This opening is closed"],
      [
        { applicationDeadline: "2000-01-01" },
        "Closed:",
        "This opening is closed",
      ],
      [
        { publicEligible: false },
        "Unavailable:",
        "This listing is unavailable",
      ],
      [
        { applicationDeadline: "invalid" },
        "Unavailable:",
        "This listing is unavailable",
      ],
      [{}, "Engineer at", "Read requirements and apply directly"],
    ]) {
      fixture.job = {
        title: "Engineer",
        status: "active",
        companyId: { name: "Example" },
        ...overrides,
      };
      const metadata = await generateMetadata({
        params: Promise.resolve({ jobSlug: "test-role" }),
      });
      assert.ok(metadata.title.startsWith(prefix), metadata.title);
      assert.ok(metadata.description.includes(phrase), metadata.description);
    }
  } finally {
    delete globalThis.jobMetadataFixture;
  }
});
