import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { compileFixture } from "./location-fixtures.mjs";
import { JSDOM } from "jsdom";

test("live examples switch sample profiles, show real evidence and never invent an empty score", async () => {
  const dom = new JSDOM('<div id="root"></div>', { url: "http://localhost/" });
  const previous = new Map();
  for (const [key, value] of Object.entries({
    window: dom.window,
    document: dom.window.document,
    navigator: dom.window.navigator,
    IS_REACT_ACT_ENVIRONMENT: true,
  })) {
    previous.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, {
      value,
      configurable: true,
      writable: true,
    });
  }
  let source = await readFile(
    new URL("../components/LiveMatchingExample.tsx", import.meta.url),
    "utf8",
  );
  source = source
    .replace(
      'import Link from "next/link";',
      "const Link = ({children, href}) => <a href={href}>{children}</a>;",
    )
    .replace(
      'import { jobUrl } from "@/lib/reerhub";',
      "const jobUrl = (job) => `/jobs/${job._id}`;",
    )
    .replace(
      'import { locationLabel } from "@/lib/format";',
      "const locationLabel = (job) => job.locations[0].city;",
    )
    .replace(
      'import JobFreshness from "./JobFreshness";',
      "const JobFreshness = () => <span>Last checked in official feed</span>;",
    );
  const { default: Component } = await import(compileFixture(source));
  const { createElement, act } = await import("react");
  const { createRoot } = await import("react-dom/client");
  const root = createRoot(document.getElementById("root"));
  const profile = {
    skills: ["React", "Node.js", "MongoDB"],
    experienceYears: 5,
  };
  const examples = [
    {
      id: "software",
      label: "Software engineer",
      profile,
      job: {
        _id: "live-role",
        title: "Real API Engineer",
        companyId: { name: "Actual employer" },
        locations: [{ city: "Bengaluru" }],
      },
      fit: {
        relevanceScore: 93,
        reasons: ["Matches React, Node.js", "Matches your tech track"],
      },
    },
    {
      id: "data",
      label: "Data engineer",
      profile: { skills: ["Python", "SQL", "PostgreSQL"], experienceYears: 3 },
      job: null,
      fit: null,
    },
  ];
  try {
    await act(async () => root.render(createElement(Component, { examples })));
    assert.match(document.body.textContent, /made-up profile/);
    assert.match(document.body.textContent, /93% profile relevance/);
    assert.match(document.body.textContent, /Matches React, Node.js/);
    assert.equal(
      document.querySelector("a").getAttribute("href"),
      "/jobs/live-role",
    );
    await act(async () => {
      const select = document.querySelector("select");
      select.value = "data";
      select.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
    });
    assert.match(document.body.textContent, /Python, SQL, PostgreSQL/);
    assert.match(document.body.textContent, /No current role reaches 75%/);
    assert.doesNotMatch(document.body.textContent, /93%|Real API Engineer/);
    await act(async () =>
      root.render(createElement(Component, { examples: [] })),
    );
    assert.match(document.body.textContent, /temporarily unavailable/);
    assert.doesNotMatch(document.body.textContent, /86%|93%/);
  } finally {
    await act(async () => root.unmount());
    for (const [key, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
    dom.window.close();
  }
});
