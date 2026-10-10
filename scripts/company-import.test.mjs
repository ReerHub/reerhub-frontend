import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import ts from "typescript";
import { JSDOM } from "jsdom";

test("admin import UI retains failed saves, requires approval and prevents duplicate confirmation", async () => {
  const dom = new JSDOM('<div id="root"></div>', {
    url: "http://admin.localhost",
  });
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
  const batch = {
    _id: "fixture-batch",
    batchId: "weekly-fixture",
    status: "review",
    rows: [
      {
        status: "ready",
        checkedAt: "2026-10-09T00:00:00Z",
        feedResults: [{ name: "Careers", fetched: 0, indiaEngineering: 0 }],
        entry: {
          company: {
            name: "Fixture Company",
            website: "https://example.com",
            careersUrl: "https://example.com/careers",
          },
          sources: [
            {
              name: "Careers",
              type: "greenhouse",
              evidenceUrl: "https://example.com/careers",
              verifiedAt: "2026-10-09T00:00:00Z",
            },
          ],
        },
      },
    ],
  };
  let calls = 0,
    fail = true;
  globalThis.__importTestApi = {
    get: async (path) =>
      path.endsWith("company-imports")
        ? [{ ...batch }]
        : structuredClone(batch),
    write: async (path, _method, body) => {
      calls += 1;
      assert.ok(path.endsWith("/confirm"));
      assert.equal(body.acknowledgeEvidence, true);
      await new Promise((resolve) => setTimeout(resolve, 10));
      if (fail) throw new Error("Fixture API unavailable");
      return {
        ...structuredClone(batch),
        status: "completed",
        rows: [
          {
            ...structuredClone(batch.rows[0]),
            status: "imported",
            sources: [
              {
                id: "fixture-source",
                name: "Careers",
                nextScheduledSyncAt: "2026-10-10T00:30:00Z",
              },
            ],
          },
        ],
      };
    },
  };
  const require = createRequire(import.meta.url);
  let source = await readFile(
    new URL("../components/AdminCompanyImport.tsx", import.meta.url),
    "utf8",
  );
  source = source
    .replace(
      /import \{ getAdmin, writeAdmin \} from "@\/lib\/admin";/,
      "const getAdmin = (...args) => globalThis.__importTestApi.get(...args); const writeAdmin = (...args) => globalThis.__importTestApi.write(...args);",
    )
    .replace(
      /import styles from "\.\/AdminCompanyImport.module.css";/,
      "const styles = {};",
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
  const settle = async () => {
    await new Promise((resolve) => setTimeout(resolve, 30));
  };
  try {
    await act(async () => {
      root.render(createElement(Component));
      await settle();
    });
    const history = document.querySelector("select");
    await act(async () => {
      history.value = batch._id;
      history.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
      await settle();
    });
    assert.match(document.body.textContent, /Fixture Company/);
    assert.match(document.body.textContent, /0 India engineering openings/);
    assert.match(document.body.textContent, /not employer ownership/);
    const button = () =>
      [...document.querySelectorAll("button")].find((item) =>
        item.textContent.startsWith("Import "),
      );
    assert.equal(button().disabled, true);
    await act(async () => {
      document.querySelector('input[type="checkbox"]').click();
    });
    assert.equal(button().disabled, false);
    await act(async () => {
      button().click();
      button().click();
      await settle();
    });
    assert.equal(calls, 1);
    assert.match(document.body.textContent, /Fixture API unavailable/);
    assert.match(document.body.textContent, /Fixture Company/);
    fail = false;
    await act(async () => {
      button().click();
      await settle();
    });
    assert.equal(calls, 2);
    assert.match(document.body.textContent, /Imported/);
    assert.match(document.body.textContent, /Awaiting first sync/);
    assert.equal(button().disabled, true);
    const input = document.querySelector('input[type="file"]');
    Object.defineProperty(input, "files", {
      value: [{ size: 512001, text: async () => "{}" }],
      configurable: true,
    });
    await act(async () => {
      input.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
      await settle();
    });
    assert.match(document.body.textContent, /File exceeds 500 KiB/);
    assert.equal(calls, 2);
    const metadataBatch = {
      ...structuredClone(batch),
      rows: [
        {
          ...structuredClone(batch.rows[0]),
          status: "already-exists",
          metadataPreview: {
            eligible: true,
            updatedAt: "2026-10-10T01:00:00.000Z",
            changes: { industry: { before: "", after: "Analytics" } },
          },
        },
      ],
    };
    globalThis.__importTestApi.get = async () => structuredClone(metadataBatch);
    globalThis.__importTestApi.write = async (path, method, body) => {
      calls += 1;
      assert.ok(path.endsWith("/metadata"));
      assert.equal(method, "POST");
      assert.equal(body.acknowledgeMetadata, true);
      assert.deepEqual(body.expectations, [
        { row: 0, updatedAt: "2026-10-10T01:00:00.000Z" },
      ]);
      await settle();
      return {
        ...metadataBatch,
        rows: [
          {
            ...metadataBatch.rows[0],
            metadataUpdatedAt: "2026-10-10T01:01:00.000Z",
            metadataPreview: {
              eligible: false,
              reason: "Metadata already applied by this batch.",
            },
          },
        ],
      };
    };
    await act(async () => {
      [...document.querySelectorAll("button")]
        .find((item) => item.textContent === "Refresh status")
        .click();
      await settle();
    });
    assert.match(document.body.textContent, /Already exists/);
    assert.match(document.body.textContent, /Metadata-only update preview/);
    const updateButton = () =>
      [...document.querySelectorAll("button")].find((item) =>
        item.textContent.startsWith("Update metadata only"),
      );
    assert.equal(updateButton().disabled, true);
    await act(async () =>
      document.querySelector('input[type="checkbox"]').click(),
    );
    await act(async () => {
      updateButton().click();
      updateButton().click();
      await settle();
      await settle();
    });
    assert.equal(calls, 3);
    assert.match(
      document.body.textContent,
      /Company identity, jobs and sources preserved/,
    );
    assert.equal(updateButton(), undefined);
  } finally {
    await act(async () => root.unmount());
    dom.window.close();
    delete globalThis.__importTestApi;
    for (const [key, descriptor] of saved) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
});
