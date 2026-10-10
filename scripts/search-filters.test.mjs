import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import ts from "typescript";
import { JSDOM } from "jsdom";

test("search filters stay compact, apply once, cancel safely and expose removable selections", async () => {
  const dom = new JSDOM('<div id="root"></div>', {
    url: "http://localhost/jobs",
  });
  const previous = new Map();
  for (const [key, value] of Object.entries({
    window: dom.window,
    document: dom.window.document,
    navigator: dom.window.navigator,
    HTMLElement: dom.window.HTMLElement,
    IS_REACT_ACT_ENVIRONMENT: true,
  })) {
    previous.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, {
      value,
      configurable: true,
      writable: true,
    });
  }
  const require = createRequire(import.meta.url);
  let source = await readFile(
    new URL("../components/SearchFilters.tsx", import.meta.url),
    "utf8",
  );
  source = source
    .replace(
      'import { TECH_TRACKS } from "@/lib/reerhub";',
      'const TECH_TRACKS = [{value: "software", label: "Software"}, {value: "data", label: "Data"}];',
    )
    .replace(
      'import Icon from "@/components/ui/Icon";',
      "const Icon = () => null;",
    )
    .replace(
      'import styles from "./SearchFilters.module.css";',
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
  const defaults = {
    q: "",
    city: "",
    techTrack: "",
    companyId: "",
    remoteType: "",
    techRole: "",
    skills: "",
    seniority: "",
    employmentType: "",
    sort: "",
    indiaOnly: true,
  };
  let filters = { ...defaults, q: "Node", city: "Pune" },
    calls = [];
  const companies = Array.from({ length: 12 }, (_, i) => ({
    _id: String(i),
    name: `Company ${i}`,
    activeJobs: i,
  }));
  const render = () =>
    root.render(
      createElement(Component, {
        filters,
        companies,
        onChange: (patch) => {
          filters = { ...filters, ...patch };
          render();
        },
        onSubmit: (patch) => {
          calls.push(patch);
          filters = { ...filters, ...patch };
          render();
        },
        onClear: () => {
          filters = { ...defaults };
          render();
        },
      }),
    );
  const button = (text) =>
    Array.from(document.querySelectorAll("button")).find(
      (element) => element.textContent.trim() === text,
    );
  const toggle = () => document.querySelector("[aria-controls]");
  const panel = () =>
    document.getElementById(toggle().getAttribute("aria-controls"));
  const select = (label, value) => {
    const control = Array.from(document.querySelectorAll("label"))
      .find((element) => element.firstChild.textContent === label)
      ?.querySelector("select");
    assert.ok(control, label);
    control.value = value;
    control.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
  };
  try {
    await act(async () => render());
    assert.equal(toggle().getAttribute("aria-expanded"), "false");
    assert.ok(panel().hidden);
    assert.equal(document.querySelectorAll("button[aria-pressed]").length, 0);
    await act(async () => toggle().click());
    await act(async () => {
      select("Engineering track", "software");
      select("Company", "11");
      select("Work mode", "remote");
    });
    assert.equal(calls.length, 0);
    await act(async () => button("Cancel").click());
    assert.ok(panel().hidden);
    assert.equal(document.activeElement, toggle());
    await act(async () => toggle().click());
    assert.equal(panel().querySelector("select").value, "");
    await act(async () => {
      select("Engineering track", "software");
      select("Company", "11");
      select("Work mode", "remote");
    });
    await act(async () => button("Apply filters").click());
    assert.equal(calls.length, 1);
    assert.equal(calls[0].companyId, "11");
    assert.ok(!Object.hasOwn(calls[0], "q"));
    assert.ok(!Object.hasOwn(calls[0], "city"));
    assert.equal(filters.q, "Node");
    assert.equal(filters.city, "Pune");
    assert.ok(panel().hidden);
    assert.equal(
      document.querySelector('[aria-label="Remove Company: Company 11"]')
        .textContent,
      "Company: Company 11",
    );
    await act(async () => toggle().click());
    await act(async () => select("Engineering track", "data"));
    await act(async () =>
      document.querySelector('[aria-label="Remove Work mode: Remote"]').click(),
    );
    assert.equal(filters.remoteType, "");
    assert.equal(filters.companyId, "11");
    await act(async () => button("Apply filters").click());
    assert.equal(filters.techTrack, "data");
    assert.equal(filters.remoteType, "");
    await act(async () => toggle().click());
    await act(async () =>
      panel().dispatchEvent(
        new dom.window.KeyboardEvent("keydown", {
          key: "Escape",
          bubbles: true,
        }),
      ),
    );
    assert.ok(panel().hidden);
    await act(async () => button("Clear all").click());
    assert.ok(!document.querySelector('[aria-label="Active search filters"]'));
    assert.equal(filters.indiaOnly, true);
    filters = { ...defaults, indiaOnly: false, sort: "az" };
    await act(async () => render());
    await act(async () =>
      document
        .querySelector('[aria-label="Remove Including international roles"]')
        .click(),
    );
    assert.equal(filters.indiaOnly, true);
    assert.equal(filters.sort, "az");
    await act(async () => button("Search jobs").click());
    assert.equal(calls.at(-1), undefined);
    assert.equal(document.querySelectorAll("form form").length, 0);
  } finally {
    await act(async () => root.unmount());
    for (const [key, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
    dom.window.close();
  }
});
