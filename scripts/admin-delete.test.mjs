import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import ts from "typescript";
import { JSDOM } from "jsdom";

test("delete dialog requires an inactive record and exact name, blocks double submits and retains errors", async () => {
  const dom = new JSDOM(
    '<button id="trigger">Delete</button><div id="root"></div>',
    { url: "http://admin.localhost" },
  );
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
  dom.window.HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
  dom.window.HTMLDialogElement.prototype.close = function () {
    this.open = false;
  };
  let calls = 0,
    deleted = 0,
    closed = 0;
  globalThis.__deleteTestApi = async (path, method, body) => {
    calls++;
    assert.equal(path, "/admin/companies/fixture");
    assert.equal(method, "DELETE");
    assert.deepEqual(body, { confirmName: "Fixture" });
    await new Promise((resolve) => setTimeout(resolve, 10));
    throw Error("This record has job history.");
  };
  const require = createRequire(import.meta.url);
  let source = await readFile(
    new URL("../components/AdminDeleteDialog.tsx", import.meta.url),
    "utf8",
  );
  source = source.replace(
    /import \{ writeAdmin \} from "@\/lib\/admin";/,
    "const writeAdmin = (...args) => globalThis.__deleteTestApi(...args);",
  );
  let compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;
  for (const name of ["react", "react/jsx-runtime"])
    compiled = compiled.replaceAll(
      `from "${name}"`,
      `from "${pathToFileURL(require.resolve(name)).href}"`,
    );
  const { default: Component } = await import(
    `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`
  );
  const { createElement, act } = await import("react");
  const { createRoot } = await import("react-dom/client");
  const root = createRoot(document.getElementById("root"));
  const render = (active) =>
    createElement(Component, {
      key: String(active),
      kind: "company",
      record: { _id: "fixture", name: "Fixture", isActive: active },
      onClose: () => closed++,
      onDeleted: () => deleted++,
    });
  try {
    document.getElementById("trigger").focus();
    await act(async () => root.render(render(true)));
    assert.equal(
      document.querySelector('button[type="submit"]').disabled,
      true,
    );
    assert.equal(document.querySelector("input").disabled, true);
    await act(async () => root.render(render(false)));
    const input = document.querySelector("input");
    assert.equal(
      document.querySelector('button[type="submit"]').disabled,
      true,
    );
    // React's native input tracker sees a real DOM edit, not a controlled setter.
    await act(async () => {
      Object.getOwnPropertyDescriptor(
        dom.window.HTMLInputElement.prototype,
        "value",
      ).set.call(input, "Fixture");
      input.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
      input.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
    });
    assert.equal(
      document.querySelector('button[type="submit"]').disabled,
      false,
    );
    await act(async () => {
      const form = document.querySelector("form");
      form.dispatchEvent(
        new dom.window.Event("submit", { bubbles: true, cancelable: true }),
      );
      form.dispatchEvent(
        new dom.window.Event("submit", { bubbles: true, cancelable: true }),
      );
      await new Promise((resolve) => setTimeout(resolve, 30));
    });
    assert.equal(calls, 1);
    assert.equal(deleted, 0);
    assert.match(document.body.textContent, /job history/);
    assert.equal(input.value, "Fixture");
    await act(async () =>
      document
        .querySelector("dialog")
        .dispatchEvent(new dom.window.Event("cancel", { cancelable: true })),
    );
    assert.equal(closed, 1);
    globalThis.__deleteTestApi = async (path, method, body) => {
      calls++;
      assert.equal(path, "/admin/sources/fixture/archive");
      assert.equal(method, "POST");
      assert.deepEqual(body, { confirmName: "Fixture" });
      await new Promise((resolve) => setTimeout(resolve, 10));
      return { closedJobs: 2 };
    };
    await act(async () =>
      root.render(
        createElement(Component, {
          key: "archive",
          kind: "source",
          archive: true,
          record: { _id: "fixture", name: "Fixture", isActive: true },
          onClose: () => closed++,
          onDeleted: (result) => {
            assert.equal(result.closedJobs, 2);
            deleted++;
          },
        }),
      ),
    );
    assert.match(
      document.body.textContent,
      /closes only its linked active jobs/,
    );
    const archiveInput = document.querySelector("input");
    assert.equal(archiveInput.disabled, false);
    await act(async () => {
      Object.getOwnPropertyDescriptor(
        dom.window.HTMLInputElement.prototype,
        "value",
      ).set.call(archiveInput, "Fixture");
      archiveInput.dispatchEvent(
        new dom.window.Event("input", { bubbles: true }),
      );
    });
    await act(async () => {
      document
        .querySelector("form")
        .dispatchEvent(
          new dom.window.Event("submit", { bubbles: true, cancelable: true }),
        );
      document
        .querySelector("form")
        .dispatchEvent(
          new dom.window.Event("submit", { bubbles: true, cancelable: true }),
        );
      await new Promise((resolve) => setTimeout(resolve, 30));
    });
    assert.equal(calls, 2);
    assert.equal(deleted, 1);
  } finally {
    await act(async () => root.unmount());
    assert.equal(document.body.style.overflow, "");
    dom.window.close();
    delete globalThis.__deleteTestApi;
    for (const [key, descriptor] of saved) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
});
