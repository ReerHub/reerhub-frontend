import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import ts from "typescript";
import { JSDOM } from "jsdom";

test("company listings upgrade previews, paginate, stay scoped and retry failures", async () => {
  const dom = new JSDOM('<div id="root"></div>', {
    url: "http://localhost/companies/example?companyId=wrong",
  });
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
  const calls = [];
  let user = null,
    fail = false;
  const job = (n) => ({ _id: String(n), title: `Role ${n}` });
  globalThis.__companyFixture = {
    auth: () => ({ user, loading: false }),
    saved: () => [],
    toggle: async () => {},
    pathname: () => "/companies/example",
    params: () => new URLSearchParams("companyId=wrong"),
    companies: async () => {
      throw Error("Unnecessary directory read");
    },
    list: async (query) => {
      calls.push(query);
      if (fail) throw Error("offline");
      return {
        jobs:
          query.page === 1
            ? Array.from({ length: 21 }, (_, n) => job(n))
            : [job(21)],
        total: 22,
        totalPages: 2,
      };
    },
  };
  const require = createRequire(import.meta.url);
  const promptSource = (
    await readFile(
      new URL("../components/DiscoveryPrompt.tsx", import.meta.url),
      "utf8",
    )
  )
    .replace(
      /import Link from "next\/link";/,
      "const Link = ({children,...props}) => <a {...props}>{children}</a>;",
    )
    .replace(
      /import \{ useAuth \} from .*?;/,
      "const useAuth = globalThis.__companyFixture.auth;",
    )
    .replace(
      /import \{ usePathname, useSearchParams \} from "next\/navigation";/,
      "const {pathname:usePathname,params:useSearchParams} = globalThis.__companyFixture;",
    )
    .replace(/import Icon from .*?;/, "const Icon = () => null;");
  let promptCompiled = ts.transpileModule(promptSource, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;
  promptCompiled = promptCompiled.replaceAll(
    'from "react/jsx-runtime"',
    `from "${pathToFileURL(require.resolve("react/jsx-runtime")).href}"`,
  );
  globalThis.__companyFixture.Prompt = (
    await import(
      `data:text/javascript;base64,${Buffer.from(promptCompiled).toString("base64")}`
    )
  ).default;
  let source = await readFile(
    new URL("../components/JobBrowser.tsx", import.meta.url),
    "utf8",
  );
  source = source
    .replace(
      /import \{ usePathname, useSearchParams \} from "next\/navigation";/,
      "const {pathname:usePathname,params:useSearchParams} = globalThis.__companyFixture;",
    )
    .replace(
      /import toast from "react-hot-toast";/,
      "const toast = {success:()=>{},error:()=>{}};",
    )
    .replace(
      /import JobCard from .*?;/,
      "const JobCard = ({job}) => <article>{job.title}</article>;",
    )
    .replace(
      /import DiscoveryPrompt from .*?;/,
      "const DiscoveryPrompt = globalThis.__companyFixture.Prompt;",
    )
    .replace(
      /import \{ useAuth \} from .*?;/,
      "const useAuth = globalThis.__companyFixture.auth;",
    )
    .replace(
      /import \{ useSavedJobs, toggleSaved \} from .*?;/,
      "const {saved:useSavedJobs,toggle:toggleSaved} = globalThis.__companyFixture;",
    )
    .replace(
      /import SearchFilters, \{ Filters \} from .*?;/,
      "type Filters = Record<string, any>; const SearchFilters = () => null;",
    )
    .replace(
      /import \{[^;]*?\} from "@\/lib\/reerhub";/,
      "const {list:listJobsWithMeta,companies:listCompanies} = globalThis.__companyFixture;",
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
  const render = (key) =>
    root.render(
      createElement(Component, {
        key,
        companyId: "correct",
        companyTotal: 22,
        showFilters: false,
        initialData: {
          jobs: Array.from({ length: 10 }, (_, n) => job(n)),
          total: 10,
          totalPages: 1,
        },
      }),
    );
  const settle = () => new Promise((resolve) => setTimeout(resolve, 20));
  try {
    await act(async () => {
      render("first");
      await settle();
    });
    assert.equal(document.querySelectorAll("article").length, 10);
    assert.equal(calls.length, 0, "anonymous hydration reuses preview");
    assert.match(document.body.textContent, /Showing 10 of 22 roles/);
    assert.match(document.body.textContent, /12 more roles available/);
    const login = document.querySelector('a[href^="/login?"]');
    assert.equal(login.textContent, "Sign in to view all roles");
    assert.equal(
      new URL(login.href).searchParams.get("next"),
      "/companies/example?companyId=wrong",
    );
    assert.equal(document.querySelectorAll('a[href^="/login?"]').length, 1);
    user = { id: "member" };
    await act(async () => {
      render("first");
      await settle();
    });
    assert.equal(document.querySelectorAll("article").length, 21);
    assert.doesNotMatch(
      document.body.textContent,
      /more roles available|Sign in to view all/,
    );
    assert.equal(
      calls[0].companyId,
      "correct",
      "URL cannot replace the company scope",
    );
    const more = [...document.querySelectorAll("button")].find((b) =>
      b.textContent.includes("Load more"),
    );
    await act(async () => {
      more.click();
      await settle();
    });
    assert.equal(document.querySelectorAll("article").length, 22);
    assert.equal(calls.at(-1).page, 2);
    assert.equal(calls.at(-1).companyId, "correct");
    fail = true;
    await act(async () => {
      render("failure");
      await settle();
    });
    assert.match(document.body.textContent, /couldn’t load/);
    assert.doesNotMatch(document.body.textContent, /No tech roles/);
    fail = false;
    await act(async () => {
      [...document.querySelectorAll("button")]
        .find((b) => b.textContent === "Try again")
        .click();
      await settle();
    });
    assert.equal(document.querySelectorAll("article").length, 21);
    user = null;
    for (const [count, total, expected, forbidden] of [
      [3, 3, /Save your shortlist/, /more roles|first 10/],
      [0, 0, /Save your shortlist/, /more roles|first 10/],
      [10, 10, /Save your shortlist/, /more roles|first 10/],
      [10, undefined, /limited preview/, /\d+ more roles/],
      [10, 11, /1 more role available/, /1 more roles/],
    ]) {
      await act(async () =>
        root.render(
          createElement(globalThis.__companyFixture.Prompt, {
            count,
            total,
            card: true,
          }),
        ),
      );
      assert.match(document.body.textContent, expected);
      assert.doesNotMatch(document.body.textContent, forbidden);
    }
  } finally {
    await act(async () => root.unmount());
    dom.window.close();
    delete globalThis.__companyFixture;
    for (const [key, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
});
