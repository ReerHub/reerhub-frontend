import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { renderToStaticMarkup } from "react-dom/server";
import { compileFixture } from "./location-fixtures.mjs";
const { JOB_LANDINGS, landingQuery, editorialReady } = await import(
  compileFixture(
    await readFile(new URL("../lib/seo-landings.ts", import.meta.url), "utf8"),
  )
);
test("focused role pages map exactly to supported track/role filters", async () => {
  const catalog = JSON.parse(
    await readFile(
      new URL("./fixtures/profile-options.json", import.meta.url),
      "utf8",
    ),
  );
  for (const [slug, track, role] of [
    ["backend-jobs", "software", "Backend Engineer"],
    ["frontend-jobs", "software", "Frontend Engineer"],
    ["full-stack-jobs", "software", "Full Stack Engineer"],
    ["data-engineering-jobs", "data", "Data Engineer"],
    ["devops-jobs", "cloud-infra", "DevOps Engineer"],
    ["qa-jobs", "qa", undefined],
  ]) {
    const landing = JOB_LANDINGS[slug];
    assert.equal(landingQuery(landing).techTrack, track);
    assert.equal(landingQuery(landing).techRole, role);
    if (role) assert.ok(JSON.stringify(catalog).includes(`"${role}"`));
    assert.equal(landing.guidance.length, 3);
    assert.equal(editorialReady(landing), true);
  }
});
test("early-career editorial gates require five roles, two employers and complete original content", () => {
  for (const slug of ["fresher-jobs", "internship-jobs"]) {
    const landing = JOB_LANDINGS[slug];
    for (const inventory of [
      undefined,
      { activeRoles: 4, employers: 2 },
      { activeRoles: 5, employers: 1 },
    ])
      assert.equal(editorialReady(landing, inventory), false);
    assert.equal(
      editorialReady(landing, { activeRoles: 5, employers: 2 }),
      true,
    );
    assert.equal(
      editorialReady(
        { ...landing, editorialComplete: false },
        { activeRoles: 5, employers: 2 },
      ),
      false,
    );
  }
});

test("engineering hub links every dedicated engineering role through HTML anchors", async () => {
  const page = await readFile(
    new URL("../app/engineering-jobs/page.tsx", import.meta.url),
    "utf8",
  );
  for (const slug of [
    "backend-jobs",
    "frontend-jobs",
    "full-stack-jobs",
    "data-engineering-jobs",
    "devops-jobs",
    "qa-jobs",
  ]) {
    assert.ok(page.includes(`"/${slug}"`), `missing ${slug}`);
  }
  assert.match(page, /aria-label="Engineering roles"/);
  assert.match(page, /<Link href=\{href\}/);
});

test("engineering role links exist in initial rendered HTML", async () => {
  const source = (
    await readFile(
      new URL("../app/engineering-jobs/page.tsx", import.meta.url),
      "utf8",
    )
  ).replace(/import[\s\S]*?from "[^"]+";/g, "");
  const { default: Page } = await import(
    compileFixture(`
    const pageMetadata=()=>({});
    const Link=({href,children})=><a href={href}>{children}</a>;
    const Suspense=({children})=><>{children}</>;
    const ServerJobBrowser=()=>null, PageHeader=()=>null, Icon=()=>null;
    ${source}
  `)
  );
  const html = renderToStaticMarkup(Page());
  for (const slug of [
    "backend-jobs",
    "frontend-jobs",
    "full-stack-jobs",
    "data-engineering-jobs",
    "devops-jobs",
    "qa-jobs",
  ]) {
    assert.ok(html.includes(`href="/${slug}"`), `missing rendered ${slug}`);
  }
});

test("curated skills use exact filters and require complete cross-employer inventory", () => {
  for (const [slug, skill] of [
    ["react", "React"],
    ["nodejs", "Node.js"],
    ["python", "Python"],
    ["java", "Java"],
    ["typescript", "TypeScript"],
  ]) {
    const landing = JOB_LANDINGS[`${slug}-jobs`];
    assert.equal(landingQuery(landing).skills, skill);
    assert.equal(
      editorialReady(landing, { activeRoles: 4, employers: 2 }),
      false,
    );
    assert.equal(
      editorialReady(landing, { activeRoles: 5, employers: 1 }),
      false,
    );
    assert.equal(
      editorialReady(landing, { activeRoles: 5, employers: 2 }),
      true,
    );
    assert.equal(editorialReady(landing), false);
  }
});
