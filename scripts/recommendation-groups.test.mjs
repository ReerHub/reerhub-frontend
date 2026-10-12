import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { JSDOM } from "jsdom";
import { compileFixture } from "./location-fixtures.mjs";

test("group switching explains gaps and does not call review roles strong matches", async () => {
  const dom = new JSDOM('<div id="root"></div>', { url: "http://localhost/" });
  const previous = new Map();
  for (const [key, value] of Object.entries({ window: dom.window, document: dom.window.document, navigator: dom.window.navigator, IS_REACT_ACT_ENVIRONMENT: true })) {
    previous.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
  }
  const calls = [];
  globalThis.recommendationFixture = async (score, signal, group) => {
    calls.push({ score, group });
    return { profileReady: true, missingProfileFields: [], matchCounts: { all: group === "qualified" ? 0 : 1 }, groupCounts: { qualified: 0, stretch: 1, "needs-review": 1 }, jobs: group === "qualified" ? [] : [{ _id: group, title: "Backend Engineer", companyId: { name: "Fixture employer" }, locations: [{ city: "Pune" }], fit: { relevanceScore: 93, reasons: ["Matches your skills"], fitGaps: group === "stretch" ? ["Employer requires 5 years; your profile has 2 years."] : [], uncertainties: group === "needs-review" ? ["Mandatory experience requirements have not been verified."] : [] } }] };
  };
  let source = await readFile(new URL("../components/RecommendationPanel.tsx", import.meta.url), "utf8");
  source = source.replace(/import \{\s*getRecommendations,[\s\S]*?\} from "@\/lib\/auth";/, 'const getRecommendations = globalThis.recommendationFixture; const setRecommendationFeedback = async () => {};')
    .replace('import Link from "next/link";', 'const Link = ({children, href}) => <a href={href}>{children}</a>;')
    .replace('import CatalogNotice, { catalogInitializing } from "./CatalogNotice";', 'const CatalogNotice = () => null; const catalogInitializing = () => false;')
    .replace('import toast from "react-hot-toast";', 'const toast = {success() {}, error() {}};')
    .replace('import { jobUrl } from "@/lib/reerhub";', 'const jobUrl = (job) => `/jobs/${job._id}`;')
    .replace('import CompanyLogo from "@/components/CompanyLogo";', 'const CompanyLogo = () => null;')
    .replace('import Icon from "@/components/ui/Icon";', 'const Icon = () => null;')
    .replace('import JobFreshness from "./JobFreshness";', 'const JobFreshness = () => null;')
    .replace(/import \{\s*countsAfterHide,[\s\S]*?\} from "@\/lib\/dashboard";/, 'const nextMatchTier = () => null; const experienceLabel = () => ""; const countsAfterHide = (v) => v;');
  const { default: Component } = await import(compileFixture(source));
  const { createElement, act } = await import("react");
  const { createRoot } = await import("react-dom/client");
  const root = createRoot(document.getElementById("root"));
  try {
    await act(async () => root.render(createElement(Component)));
    assert.match(document.body.textContent, /Other roles are available: 1 Stretch roles and 1 Needs review/);
    for (const [group, text] of [["stretch", "Employer requires 5 years"], ["needs-review", "Mandatory experience requirements have not been verified"]]) {
      const button = [...document.querySelectorAll('button')].find((b) => b.textContent.startsWith(group === "stretch" ? "Stretch roles" : "Needs review"));
      await act(async () => button.click());
      assert.equal(calls.at(-1).group, group);
      assert.equal(calls.at(-1).score, 0);
      assert.match(document.body.textContent, new RegExp(text));
      assert.match(document.body.textContent, /not hiring probability/);
    }
  } finally {
    await act(async () => root.unmount());
    delete globalThis.recommendationFixture;
    for (const [key, descriptor] of previous) { if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key]; }
    dom.window.close();
  }
});
