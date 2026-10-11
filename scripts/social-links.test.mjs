import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import ts from "typescript";
import { JSDOM } from "jsdom";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

test("footer renders four confirmed social profiles with accessible secure external links", async () => {
  const require = createRequire(import.meta.url);
  const compile = (source) => {
    let code = ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText;
    code = code.replace(
      'from "react/jsx-runtime"',
      `from "${pathToFileURL(require.resolve("react/jsx-runtime")).href}"`,
    );
    return `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`;
  };
  const catalog = compile(
    await readFile(new URL("../lib/social-links.ts", import.meta.url), "utf8"),
  );
  const source = (
    await readFile(
      new URL("../components/SocialLinks.tsx", import.meta.url),
      "utf8",
    )
  ).replace('"@/lib/social-links"', JSON.stringify(catalog));
  const { default: SocialLinks } = await import(compile(source));
  const dom = new JSDOM(renderToStaticMarkup(createElement(SocialLinks)));
  const anchors = [...dom.window.document.querySelectorAll("a")];
  assert.deepEqual(
    anchors.map((a) => a.href),
    [
      "https://www.linkedin.com/company/reerhub/",
      "https://www.instagram.com/reerhub/",
      "https://www.youtube.com/@reerhub",
      "https://x.com/reerhub",
    ],
  );
  for (const a of anchors) {
    assert.equal(a.target, "_blank");
    assert.equal(a.rel, "noopener noreferrer");
    assert.match(a.getAttribute("aria-label"), /opens in a new tab/);
    assert.match(a.className, /min-h-11/);
    assert.match(a.className, /focus-visible/);
  }
  assert.ok(
    dom.window.document.querySelector('nav[aria-label="REERHUB social media"]'),
  );
  const footer = await readFile(
    new URL("../components/Footer.jsx", import.meta.url),
    "utf8",
  );
  assert.match(footer, /<SocialLinks \/>/);
  dom.window.close();
});
