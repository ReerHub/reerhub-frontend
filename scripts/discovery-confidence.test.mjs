import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { compileFixture } from "./location-fixtures.mjs";
const read = (p) => readFile(new URL(p, import.meta.url), "utf8");
const { experienceLabel, salaryLabel, cardSkills } = await import(
  compileFixture(await read("../lib/job-facts.ts"))
);
const { safeAnalyticsEvent } = await import(
  compileFixture(await read("../lib/analytics-events.ts"))
);
test("decision facts preserve required evidence and employer money units without inventing unknowns", () => {
  assert.equal(
    experienceLabel({ requirementStatus: "unknown", experience: { min: 5 } }),
    null,
  );
  assert.equal(
    experienceLabel({
      requirementStatus: "verified",
      experience: { min: 2, max: 5 },
    }),
    "2+ years required",
  );
  assert.equal(
    experienceLabel({
      requirementStatus: "verified",
      experience: { min: 2, max: 5 },
      experienceMaximumRequired: true,
    }),
    "2–5 years required",
  );
  assert.equal(
    salaryLabel({ min: 100000, max: 200000, currency: "INR", period: "year" }),
    "INR 1,00,000–2,00,000 / year",
  );
  assert.equal(
    salaryLabel({ min: 50, currency: "USD", period: "hour" }),
    "USD from 50 / hour",
  );
  assert.equal(
    salaryLabel({ max: 2000, currency: "EUR", period: "month" }),
    "EUR up to 2,000 / month",
  );
  for (const value of [
    undefined,
    {},
    { min: 10, max: 5, currency: "INR", period: "year" },
    { min: NaN, currency: "INR", period: "year" },
    { min: 1, currency: "INR" },
    { min: -1, currency: "USD", period: "hour" },
  ])
    assert.equal(salaryLabel(value), null);
  assert.deepEqual(
    cardSkills({
      matchedSkills: ["React"],
      skills: ["AI", "React", "TypeScript"],
    }),
    ["React", "AI"],
  );
});
test("public funnel accepts bounded events and strips sensitive and unbounded inputs", () => {
  for (const name of [
    "search_submit",
    "empty_results",
    "signup_prompt_click",
    "outbound_apply",
  ]) {
    assert.deepEqual(
      safeAnalyticsEvent(name, {
        page_family: "discovery",
        result_bucket: "zero",
        query: "private employer",
        email: "private@example.com",
        url: "https://secret",
        profile: { skills: ["React"] },
      }),
      { name, params: { page_family: "discovery", result_bucket: "zero" } },
    );
  }
  assert.deepEqual(
    safeAnalyticsEvent("outbound_apply", {
      result_bucket: "123456",
      page_family: "unknown",
    }),
    { name: "outbound_apply", params: {} },
  );
  assert.equal(safeAnalyticsEvent("application_completed"), null);
});

test("public action observers dispatch once, never read inputs or block navigation, and clean up", async () => {
  const { JSDOM } = await import("jsdom");
  const dom = new JSDOM(
    '<a data-official-apply="true"><span id="apply">Apply</span></a><a data-signup-prompt="true" id="signup">Sign in</a><form data-public-search="true"><input value="private query"></form>',
  );
  const previous = new Map();
  for (const [key, value] of Object.entries({
    document: dom.window.document,
    Element: dom.window.Element,
    HTMLFormElement: dom.window.HTMLFormElement,
  })) {
    previous.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { value, configurable: true });
  }
  const { listenPublicFunnel } = await import(
    compileFixture(await read("../lib/public-funnel.ts"))
  );
  const events = [];
  const stop = listenPublicFunnel((name, input) =>
    events.push({ name, input }),
  );
  try {
    const click = new dom.window.MouseEvent("click", {
      bubbles: true,
      cancelable: true,
    });
    document.querySelector("#apply").dispatchEvent(click);
    assert.equal(click.defaultPrevented, false);
    document
      .querySelector("#signup")
      .dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
    document
      .querySelector("form")
      .dispatchEvent(
        new dom.window.Event("submit", { bubbles: true, cancelable: true }),
      );
    assert.deepEqual(
      events.map((e) => e.name),
      ["outbound_apply", "signup_prompt_click", "search_submit"],
    );
    assert.ok(!JSON.stringify(events).includes("private query"));
    stop();
    document
      .querySelector("#apply")
      .dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
    assert.equal(events.length, 3);
  } finally {
    stop();
    dom.window.close();
    for (const [key, value] of previous) {
      if (value) Object.defineProperty(globalThis, key, value);
      else delete globalThis[key];
    }
  }
});

test("availability client rejects malformed counts and timestamps rather than displaying false availability", async () => {
  const source = await read("../lib/auth.ts");
  const block = source.slice(
    source.indexOf("export type MatchAvailability"),
    source.indexOf("export const getRecommendations"),
  );
  const { getMatchAvailability } = await import(
    compileFixture(
      "const request=async()=>globalThis.__availabilityClient;\n" + block,
    )
  );
  try {
    const valid = {
      profileReady: true,
      missingProfileFields: [],
      strongMatchCount: 0,
      checkedAt: new Date().toISOString(),
    };
    globalThis.__availabilityClient = valid;
    assert.deepEqual(await getMatchAvailability(), valid);
    for (const bad of [
      null,
      { ...valid, strongMatchCount: null },
      { ...valid, strongMatchCount: -1 },
      { ...valid, checkedAt: "bad" },
      { ...valid, missingProfileFields: [42] },
    ]) {
      globalThis.__availabilityClient = bad;
      await assert.rejects(getMatchAvailability(), /temporarily unavailable/);
    }
  } finally {
    delete globalThis.__availabilityClient;
  }
});
