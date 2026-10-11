import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import ts from "typescript";
import { JSDOM } from "jsdom";

test("location review requires evidence, retains failed input and prevents duplicate writes", async () => {
  const dom = new JSDOM('<div id="root"></div>', {
      url: "http://admin.localhost",
    }),
    saved = new Map();
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
  let calls = 0,
    success = 0,
    fail = true;
  globalThis.__qualityWrite = async (path, method, body) => {
    calls++;
    assert.equal(path, "/admin/jobs/fixture/location-review");
    assert.equal(method, "POST");
    assert.equal(body.signature, "a".repeat(64));
    assert.equal(body.acknowledgeEvidence, true);
    await new Promise((resolve) => setTimeout(resolve, 10));
    if (fail) throw Error("Temporary failure");
  };
  const require = createRequire(import.meta.url);
  const source = (
    await readFile(
      new URL("../components/AdminLocationReview.tsx", import.meta.url),
      "utf8",
    )
  ).replace(
    'import { writeAdmin } from "@/lib/admin";',
    "const writeAdmin=(...args)=>globalThis.__qualityWrite(...args);",
  );
  let code = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;
  for (const name of ["react", "react/jsx-runtime"])
    code = code.replaceAll(
      `from "${name}"`,
      `from "${pathToFileURL(require.resolve(name)).href}"`,
    );
  const { default: Component } = await import(
    `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`
  );
  const { createElement, act } = await import("react"),
    { createRoot } = await import("react-dom/client");
  const root = createRoot(document.getElementById("root"));
  const settle = () => new Promise((resolve) => setTimeout(resolve, 25));
  try {
    await act(async () =>
      root.render(
        createElement(Component, {
          job: {
            _id: "fixture",
            locationScope: "unknown",
            locationSignature: "a".repeat(64),
          },
          onSaved: () => success++,
        }),
      ),
    );
    const button = () => document.querySelector("button");
    assert.equal(button().disabled, true);
    const input = document.querySelector('input[type="url"]'),
      textarea = document.querySelector("textarea");
    await act(async () => {
      Object.getOwnPropertyDescriptor(
        dom.window.HTMLInputElement.prototype,
        "value",
      ).set.call(input, "https://example.com/careers");
      input.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
      Object.getOwnPropertyDescriptor(
        dom.window.HTMLTextAreaElement.prototype,
        "value",
      ).set.call(textarea, "Official employer confirms eligibility in India.");
      textarea.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
      document.querySelector('input[type="checkbox"]').click();
    });
    assert.equal(button().disabled, false);
    await act(async () => {
      button().click();
      button().click();
      await settle();
    });
    assert.equal(calls, 1);
    assert.match(document.body.textContent, /Temporary failure/);
    assert.equal(input.value, "https://example.com/careers");
    assert.match(textarea.value, /Official/);
    fail = false;
    await act(async () => {
      button().click();
      await settle();
    });
    assert.equal(calls, 2);
    assert.equal(success, 1);
    await act(async () =>
      root.render(
        createElement(Component, {
          job: { _id: "fixture", locationSignature: "a".repeat(64) },
          onSaved: () => success++,
          disabled: true,
        }),
      ),
    );
    assert.equal(document.querySelector("fieldset").disabled, true);
  } finally {
    await act(async () => root.unmount());
    dom.window.close();
    delete globalThis.__qualityWrite;
    for (const [key, descriptor] of saved) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
});
