import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { JSDOM } from "jsdom";
import { compileFixture } from "./location-fixtures.mjs";
for (const component of ["MatchJourney", "HomeHeroScene", "CompanyMarquee"]) {
  test(`${component}: illustrative motion pauses offscreen, in hidden tabs and on request; reduced motion has a static CSS fallback`, async () => {
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
      new URL(`../components/${component}.tsx`, import.meta.url),
      "utf8",
    );
    source = source
      .replace(
        'import CompanyLogo from "@/components/CompanyLogo";',
        "const CompanyLogo=()=>null;",
      )
      .replace(
        'import Icon from "@/components/ui/Icon";',
        "const Icon=()=>null;",
      )
      .replace(
        'import CompanyLogo from "./CompanyLogo";',
        "const CompanyLogo=()=>null;",
      )
      .replace(
        'import styles from "./HomePage.module.css";',
        'const styles={scene:"journey"};',
      )
      .replace(
        'import Link from "next/link";',
        'import {createElement} from "react"; const Link=({children,prefetch,...props})=>createElement("a",props,children);',
      )
      .replace(
        'import styles from "./CompanyMarquee.module.css";',
        'const styles={marquee:"journey"};',
      )
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
        root.render(
          createElement(Component, {
            companies:
              component === "CompanyMarquee"
                ? Array.from({ length: 4 }, (_, i) => ({
                    _id: String(i),
                    slug: "fixture-" + i,
                    name: "Fixture " + i,
                  }))
                : [],
          }),
        ),
      );
      const journey = () => document.querySelector(".journey");
      if (component === "CompanyMarquee") {
        assert.equal(
          document.querySelectorAll(
            'ul[aria-hidden="true"] a, ul[aria-hidden="true"] button',
          ).length,
          0,
        );
        assert.equal(
          document.querySelectorAll('a[href^="/companies/fixture-"]').length,
          4,
        );
      }
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
        new URL(
          `../components/${component === "MatchJourney" ? "MatchJourney" : component === "CompanyMarquee" ? "CompanyMarquee" : "HomePage"}.module.css`,
          import.meta.url,
        ),
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
}

test("homepage navigation initializes at restored scroll, tracks the glass threshold and stays isolated to home", async () => {
  const dom = new JSDOM('<div id="root"></div>');
  const previous = new Map();
  let frame;
  for (const [key, value] of Object.entries({
    window: dom.window,
    document: dom.window.document,
    requestAnimationFrame: (callback) => {
      frame = callback;
      return 1;
    },
    cancelAnimationFrame: () => {},
    IS_REACT_ACT_ENVIRONMENT: true,
  })) {
    previous.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, {
      value,
      configurable: true,
      writable: true,
    });
  }
  let scroll = 120;
  Object.defineProperty(window, "scrollY", {
    get: () => scroll,
    configurable: true,
  });
  window.testPathname = "/";
  let source = await readFile(
    new URL("../components/Navbar.jsx", import.meta.url),
    "utf8",
  );
  source = source
    .replace('import Image from "next/image";', "const Image=()=>null;")
    .replace(
      'import Link from "next/link";',
      "const Link=({children,...props})=><a {...props}>{children}</a>;",
    )
    .replace(
      'import { usePathname, useRouter } from "next/navigation";',
      "const usePathname=()=>window.testPathname; const useRouter=()=>({});",
    )
    .replace(
      'import { useAuth } from "@/components/AuthProvider";',
      "const useAuth=()=>({user:null,loading:false});",
    );
  for (const name of ["ProBadge", "Icon", "UserAvatar", "BrandWordmark"])
    source = source.replace(
      new RegExp(`import ${name} from "[^"\\n]+";`),
      `const ${name}=()=>null;`,
    );
  const { default: Navbar } = await import(compileFixture(source));
  const { createElement, act } = await import("react");
  const { createRoot } = await import("react-dom/client");
  const root = createRoot(document.getElementById("root"));
  try {
    await act(async () => root.render(createElement(Navbar)));
    await act(async () => frame());
    const header = () => document.querySelector("header");
    assert.equal(header().dataset.scrolled, "true");
    scroll = 32;
    await act(async () => window.dispatchEvent(new dom.window.Event("scroll")));
    assert.equal(header().dataset.scrolled, "false");
    scroll = 33;
    await act(async () => window.dispatchEvent(new dom.window.Event("scroll")));
    assert.equal(header().dataset.scrolled, "true");
    scroll = 0;
    await act(async () =>
      window.dispatchEvent(new dom.window.Event("pageshow")),
    );
    assert.equal(header().dataset.scrolled, "false");
    window.testPathname = "/jobs";
    await act(async () => root.render(createElement(Navbar)));
    scroll = 200;
    await act(async () => window.dispatchEvent(new dom.window.Event("scroll")));
    assert.equal(header().dataset.scrolled, "false");
  } finally {
    await act(async () => root.unmount());
    for (const [key, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
    dom.window.close();
  }
});
