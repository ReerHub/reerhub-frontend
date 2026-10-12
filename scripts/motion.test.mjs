import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { JSDOM } from "jsdom";
import { compileFixture } from "./location-fixtures.mjs";
test("illustrative motion pauses offscreen, in hidden tabs and on request; reduced motion has a static CSS fallback", async () => {
  const dom = new JSDOM('<div id="root"></div>');
  const previous = new Map();
  let observer,
    hidden = false;
  const Observer = class {
    constructor(callback) {
      observer = callback;
    }
    observe() {}
    disconnect() {}
  };
  for (const [key, value] of Object.entries({
    window: dom.window,
    document: dom.window.document,
    IntersectionObserver: Observer,
    IS_REACT_ACT_ENVIRONMENT: true,
  })) {
    previous.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, {
      value,
      configurable: true,
      writable: true,
    });
  }
  Object.defineProperty(document, "hidden", {
    get: () => hidden,
    configurable: true,
  });
  let source = await readFile(
    new URL("../components/MatchJourney.tsx", import.meta.url),
    "utf8",
  );
  source = source
    .replace(
      'import CompanyLogo from "@/components/CompanyLogo";',
      "const CompanyLogo=()=>null;",
    )
    .replace('import Icon from "@/components/ui/Icon";', "const Icon=()=>null;")
    .replace(
      'import styles from "./MatchJourney.module.css";',
      'const styles={journey:"journey"};',
    );
  const { default: Component } = await import(compileFixture(source));
  const { createElement, act } = await import("react"),
    { createRoot } = await import("react-dom/client");
  const root = createRoot(document.getElementById("root"));
  try {
    await act(async () =>
      root.render(createElement(Component, { companies: [] })),
    );
    const journey = () => document.querySelector(".journey");
    assert.equal(journey().dataset.paused, "true");
    await act(async () => observer([{ isIntersecting: true }]));
    assert.equal(journey().dataset.paused, "false");
    hidden = true;
    await act(async () =>
      document.dispatchEvent(new dom.window.Event("visibilitychange")),
    );
    assert.equal(journey().dataset.paused, "true");
    hidden = false;
    await act(async () =>
      document.dispatchEvent(new dom.window.Event("visibilitychange")),
    );
    assert.equal(journey().dataset.paused, "false");
    await act(async () => document.querySelector("button").click());
    assert.equal(journey().dataset.paused, "true");
    assert.equal(
      document.querySelector("button").getAttribute("aria-pressed"),
      "true",
    );
    const css = await readFile(
      new URL("../components/MatchJourney.module.css", import.meta.url),
      "utf8",
    );
    assert.match(
      css,
      /@media \(prefers-reduced-motion: reduce\)[\s\S]*animation: none !important/,
    );
  } finally {
    await act(async () => root.unmount());
    for (const [key, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
    dom.window.close();
  }
});
