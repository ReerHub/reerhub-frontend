import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import ts from "typescript";
const source = await readFile(
  new URL("../lib/dashboard.ts", import.meta.url),
  "utf8",
);
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const { dashboardView, nextMatchTier, countsAfterHide, experienceLabel } =
  await import(
    `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`
  );
test("both memberships can discover and save; only Pro defaults to matches", () => {
  for (const pro of [true, false]) {
    assert.equal(dashboardView("discover", pro), "discover");
    assert.equal(dashboardView("saved", pro), "saved");
  }
  assert.equal(dashboardView(null, true), "matches");
  assert.equal(dashboardView("matches", false), "discover");
});
test("empty results skip unavailable lower tiers", () => {
  assert.equal(nextMatchTier(90, { 75: 0, 50: 2, 25: 2, all: 2 }), 50);
  assert.equal(nextMatchTier(75, { 50: 0, 25: 0, all: 1 }), 0);
  assert.equal(nextMatchTier(75, { all: 0 }), null);
  assert.equal(nextMatchTier(0, { all: 2 }), null);
});
test("hiding a role decrements only its eligible tiers without negatives", () => {
  assert.deepEqual(
    countsAfterHide({ 90: 1, 75: 2, 50: 2, 25: 2, all: 2 }, 86),
    { 90: 1, 75: 1, 50: 1, 25: 1, all: 1 },
  );
  assert.equal(countsAfterHide({ all: 0 }, 90).all, 0);
});
test("experience renders available requirements including zero and fractions", () => {
  assert.equal(experienceLabel({ min: 0, max: 2 }), "0–2 years experience");
  assert.equal(experienceLabel({ min: 2.5 }), "2.5+ years experience");
  assert.equal(experienceLabel({ max: 3 }), "Up to 3 years experience");
  assert.equal(experienceLabel(), "");
});
test("cards preserve actual reasons, explicit outcomes and safe request lifetimes", async () => {
  const panel = await readFile(
    new URL("../components/RecommendationPanel.tsx", import.meta.url),
    "utf8",
  );
  assert.match(panel, /reasons.slice\(0, 3\)/);
  assert.match(panel, /reasons.slice\(3\)/);
  assert.match(panel, /pending.current.has\(id\)/);
  assert.match(panel, /if \(active\)/);
  assert.doesNotMatch(panel, /Exceptional fit|onClick=\{load\}/);
  assert.match(panel, /Added/);
});
