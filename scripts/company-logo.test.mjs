import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import ts from "typescript";
import { JSDOM } from "jsdom";

test("company icons keep one frame across shapes, loading, failure and URL changes", async () => {
  const dom = new JSDOM('<div id="root"></div>', { url: "http://localhost" });
  const saved = new Map();
  for (const [key, value] of Object.entries({
    window: dom.window,
    document: dom.window.document,
    navigator: dom.window.navigator,
    HTMLElement: dom.window.HTMLElement,
    IS_REACT_ACT_ENVIRONMENT: true,
  })) {
    saved.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, {
      value,
      configurable: true,
      writable: true,
    });
  }
  const require = createRequire(import.meta.url);
  const moduleUrl = (source) => {
    let compiled = ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText;
    for (const name of ["react", "react/jsx-runtime", "next/image"])
      compiled = compiled.replaceAll(
        `from "${name}"`,
        `from "${pathToFileURL(require.resolve(name)).href}"`,
      );
    return `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`;
  };
  const helper = moduleUrl(
    await readFile(new URL("../lib/company-logo.ts", import.meta.url), "utf8"),
  );
  const source = (
    await readFile(
      new URL("../components/CompanyLogo.tsx", import.meta.url),
      "utf8",
    )
  )
    .replace('from "@/lib/company-logo"', `from "${helper}"`)
    // Native Node ESM exposes Next's CommonJS entry differently than its bundler.
    .replace(
      'import Image from "next/image";',
      'import NextImage from "next/image"; const Image = NextImage.default || NextImage;',
    );
  const { default: Component } = await import(moduleUrl(source));
  const { createElement, act } = await import("react");
  const { createRoot } = await import("react-dom/client");
  const root = createRoot(document.getElementById("root"));
  const render = async (logoUrl, name = "Fixture") =>
    act(async () => root.render(createElement(Component, { name, logoUrl })));
  const checkFrame = () => {
    const frame = document.querySelector("[data-company-logo]");
    const css = dom.window.getComputedStyle(frame);
    assert.equal(css.width, "48px");
    assert.equal(css.height, "48px");
    assert.equal(css.minWidth, "48px");
    assert.equal(css.minHeight, "48px");
    assert.equal(css.flexShrink, "0");
    assert.equal(css.borderRadius, "12px");
    assert.equal(css.padding, "4px");
    assert.equal(css.boxSizing, "border-box");
    assert.equal(css.backgroundColor, "rgb(255, 255, 255)");
    return frame;
  };
  try {
    for (const [width, height] of [
      [256, 256],
      [60, 240],
      [320, 60],
    ]) {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="red"/></svg>`;
      await render(
        `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`,
      );
      const frame = checkFrame();
      const image = frame.querySelector("img");
      assert.equal(image.style.objectFit, "contain");
      assert.equal(image.style.objectPosition, "center");
      assert.equal(image.style.width, "100%");
      assert.equal(image.style.height, "100%");
      assert.equal(image.getAttribute("loading"), "lazy");
      assert.equal(image.getAttribute("referrerpolicy"), "no-referrer");
      assert.equal(image.alt, "Fixture logo");
      await act(async () => image.dispatchEvent(new dom.window.Event("error")));
      assert.equal(checkFrame(), frame);
      assert.equal(frame.querySelector("img"), null);
      assert.equal(frame.textContent, "F");
    }
    await render("https://assets.example.com/replacement.svg");
    assert.ok(
      checkFrame().querySelector("img"),
      "new URLs recover without remounting",
    );
    await render(undefined, "  Example");
    assert.equal(checkFrame().textContent, "E");
    await render(undefined, "");
    assert.equal(checkFrame().textContent, "C");
  } finally {
    await act(async () => root.unmount());
    dom.window.close();
    for (const [key, descriptor] of saved)
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
  }
});

test("member surfaces and admin company rows reuse the shared icon without per-logo API reads", async () => {
  for (const path of [
    "components/HomePage.tsx",
    "components/CompanyDirectory.tsx",
    "components/CompanyMarquee.tsx",
    "components/MatchJourney.tsx",
    "components/JobCard.tsx",
    "components/DashboardJobCard.tsx",
    "components/RecommendationPanel.tsx",
    "app/companies/[slug]/page.tsx",
    "app/jobs/[jobSlug]/page.tsx",
  ]) {
    const source = await readFile(
      new URL(`../${path}`, import.meta.url),
      "utf8",
    );
    assert.match(source, /<CompanyLogo/);
    assert.doesNotMatch(source, /size="(?:sm|md|lg)"/);
    if (path.includes("DashboardJobCard"))
      assert.doesNotMatch(source, /next\/image/);
  }
  const admin = await readFile(
    new URL("../components/AdminConsole.tsx", import.meta.url),
    "utf8",
  );
  assert.match(admin, /<CompanyLogo name=\{c.name\} logoUrl=\{c.logoUrl\}/);
  assert.doesNotMatch(admin, /company-initial/);
  const logo = await readFile(
    new URL("../components/CompanyLogo.tsx", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(logo, /fetch\(|getAdmin|remotePatterns/);
});
