import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
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
