import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { JSDOM } from "jsdom";
import { compileFixture } from "./location-fixtures.mjs";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const publicPagesUrl = compileFixture(
  (await read("../lib/public-analytics.ts")).replace(
    '"./blog-catalog"',
    JSON.stringify(compileFixture(await read("../lib/blog-catalog.ts"))),
  ),
);
const companiesUrl = compileFixture(await read("../lib/home-companies.ts"));
const { homepageCompanies, knownCompanyOpenings } = await import(companiesUrl);
const company = (id, name, activeJobs) => ({
  _id: String(id),
  slug: `company-${id}`,
  name,
  activeJobs,
});

test("30-company selection is distinct, hiring-first, stable and does not mutate its source", () => {
  const source = Array.from({ length: 40 }, (_, i) =>
    company(i, `Company ${String(i).padStart(2, "0")}`, i < 5 ? 4 : 0),
  );
  source.push({ ...source[0] }, { ...source[1], _id: "duplicate-slug" });
  const before = structuredClone(source);
  const result = homepageCompanies(source);
  assert.equal(result.length, 30);
  assert.equal(new Set(result.map((c) => c.slug)).size, 30);
  assert.deepEqual(
    result.slice(0, 5).map((c) => c._id),
    ["0", "1", "2", "3", "4"],
  );
  assert.deepEqual(source, before);
  assert.deepEqual(homepageCompanies(source.slice(0, 2)), source.slice(0, 2));
});

test("missing counts are not fabricated zeros, and genuine zeros remain available", () => {
  assert.equal(knownCompanyOpenings(company(1, "Unknown", undefined)), null);
  assert.equal(knownCompanyOpenings(company(2, "Zero", 0)), 0);
  assert.equal(knownCompanyOpenings(company(3, "Invalid", NaN)), null);
  assert.equal(knownCompanyOpenings(company(4, "Negative", -1)), null);
  assert.deepEqual(
    homepageCompanies([
      company(3, "Zulu", 0),
      company(2, "Beta", undefined),
      company(1, "Alpha", 2),
    ]).map((c) => c.name),
    ["Alpha", "Beta", "Zulu"],
  );
});

const linkMock =
  "const Link=({children,href,prefetch,...props})=><a href={href} {...props}>{children}</a>;";
let homeSource = await read("../components/HomePage.tsx");
homeSource = homeSource
  .replace('import Link from "@/components/AppLink";', linkMock)
  .replace(
    /import \{ HomeAccountAction, HomeGuestNote \} from "\.\/HomeAccountAction";/,
    'const HomeAccountAction=({guest})=><a href="/login">{guest}</a>; const HomeGuestNote=({children})=><>{children}</>;',
  )
  .replace(
    /import HomeJobPreview from [^;]+;/,
    "const HomeJobPreview=({job})=><article data-opening>{job.title}</article>;",
  )
  .replace(
    /import CompanyLogo from [^;]+;/,
    "const CompanyLogo=({name})=><img alt={`${name} logo`} />;",
  )
  .replace(/import HomeHeroScene from [^;]+;/, "const HomeHeroScene=()=>null;")
  .replace(
    /import HomeFeaturePreview from [^;]+;/,
    "const HomeFeaturePreview=()=>null;",
  )
  .replace(
    /import CompanyMarquee from [^;]+;/,
    "const CompanyMarquee=()=>null;",
  )
  .replace('"@/lib/home-companies"', JSON.stringify(companiesUrl))
  .replace(
    /import styles from [^;]+;/,
    "const styles=new Proxy({}, {get:(_,key)=>key});",
  )
  .replace(
    /import CatalogNotice, \{ catalogInitializing \} from [^;]+;/,
    "const CatalogNotice=()=>null; const catalogInitializing=()=>false;",
  )
  .replace(
    /import \{ PLANS, billingPlanHref \} from [^;]+;/,
    'const PLANS=[]; const billingPlanHref=()=>"/billing";',
  );
const { default: HomePage } = await import(compileFixture(homeSource));
const renderHome = (data, directory) =>
  new JSDOM(
    renderToStaticMarkup(
      createElement(HomePage, { data, directory, logoCompanies: [] }),
    ),
  ).window.document;

test("homepage renders 30 directory links, caps opening previews at three and removes the full demo", () => {
  const directory = Array.from({ length: 35 }, (_, i) =>
    company(i, `Company ${i}`, i),
  );
  const document = renderHome(
    {
      jobs: Array.from({ length: 5 }, (_, i) => ({
        _id: String(i),
        title: `Role ${i}`,
      })),
      companies: [],
      totalJobs: 310,
    },
    directory,
  );
  assert.equal(document.querySelectorAll("[data-opening]").length, 3);
  assert.equal(document.querySelectorAll(".companyGrid > a").length, 30);
  assert.equal(
    document.querySelectorAll('nav[aria-label="Explore opportunities"]').length,
    1,
  );
  assert.match(
    document.querySelector("#how-pro-works a").getAttribute("href"),
    /^\/how-it-works$/,
  );
  assert.equal(
    document.querySelector("h2#current-openings").textContent,
    "Good work is out there.",
  );
  assert.doesNotMatch(
    document.body.textContent,
    /Less searching\. More direction\./,
  );
});

test("homepage keeps catalog outage, empty directory and missing count states distinct", () => {
  const unavailable = renderHome(null, null);
  assert.match(
    unavailable.body.textContent,
    /Live openings are temporarily unavailable/,
  );
  assert.match(
    unavailable.body.textContent,
    /full company directory is temporarily unavailable/,
  );
  const empty = renderHome(
    { jobs: [], companies: [company(1, "Fallback", 1)], totalJobs: 0 },
    [],
  );
  assert.match(empty.body.textContent, /No companies are available/);
  assert.equal(empty.querySelectorAll(".companyGrid > a").length, 0);
  const partial = renderHome(
    { jobs: [], companies: [company(1, "Unknown", undefined)], totalJobs: 0 },
    null,
  );
  assert.match(
    partial.body.textContent,
    /Showing companies from the available openings snapshot/,
  );
  assert.match(
    partial.querySelector(".companyCount").textContent,
    /Explore company/,
  );
  assert.doesNotMatch(
    partial.querySelector(".companyCount").textContent,
    /0|No current/,
  );
});

test("new explanation route is mapped into the workspace and stays publicly crawlable only outside it", async () => {
  const landingUrl = compileFixture(await read("../lib/seo-landings.ts"));
  const workspaceUrl = compileFixture(
    (await read("../lib/workspace.ts")).replace(
      '"./seo-landings"',
      JSON.stringify(landingUrl),
    ),
  );
  const { memberHref } = await import(workspaceUrl);
  assert.equal(
    memberHref("/how-it-works?next=demo#live-demo"),
    "/dashboard/how-it-works?next=demo#live-demo",
  );
  const { isPublicAnalyticsPath } = await import(publicPagesUrl);
  assert.equal(isPublicAnalyticsPath("/how-it-works"), true);
  assert.equal(isPublicAnalyticsPath("/dashboard/how-it-works"), false);
  assert.match(
    (await read("../lib/sitemap.ts")).replace(
      '"./blog-catalog"',
      JSON.stringify(compileFixture(await read("../lib/blog-catalog.ts"))),
    ),
    /"how-it-works"/,
  );
  assert.doesNotMatch(
    (await read("../lib/sitemap.ts")).replace(
      '"./blog-catalog"',
      JSON.stringify(compileFixture(await read("../lib/blog-catalog.ts"))),
    ),
    /"dashboard\/how-it-works"/,
  );
  assert.match(
    await read("../app/dashboard/how-it-works/page.tsx"),
    /workspaceMetadata/,
  );
});

test("catalog stats use server counts and offline feedback is limited to supplied comments", () => {
  const doc = renderHome(
    { jobs: [], companies: [], totalCompanies: 48, totalJobs: 310 },
    [],
  );
  const stats = doc.querySelector('dl[aria-label="ReerHub at a glance"]');
  assert.deepEqual(
    [...stats.querySelectorAll("dd")].map((e) => e.textContent),
    ["48", "310", "Free", "India-first"],
  );
  assert.equal(doc.querySelectorAll(".feedbackGrid figure").length, 2);
  assert.match(
    doc.querySelector("#community-feedback").textContent,
    /Meraj Pathan/,
  );
  assert.match(
    doc.querySelector("#community-feedback").textContent,
    /Faraz Shaikh/,
  );
  assert.doesNotMatch(
    doc.body.textContent,
    /EARLY WORDS|A clearer search|A better starting point|A little feedback from friends|Personal feedback shared offline|MEET THE TEAMS/,
  );
  assert.equal(
    doc.querySelector("#community-feedback").getAttribute("aria-label"),
    "Community feedback",
  );
  assert.equal(doc.querySelector("#community-feedback img"), null);
  const outage = renderHome(null, null);
  assert.deepEqual(
    [...outage.querySelectorAll(".catalogStats dd")]
      .slice(0, 2)
      .map((e) => e.textContent),
    ["—", "—"],
  );
  const empty = renderHome(
    { jobs: [], companies: [], totalCompanies: 0, totalJobs: 0 },
    [],
  );
  assert.equal(empty.querySelector(".catalogStats dd").textContent, "0");
});
