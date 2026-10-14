import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { JSDOM } from "jsdom";
import { compileFixture } from "./location-fixtures.mjs";
const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const landings = compileFixture(await read("../lib/seo-landings.ts"));
const workspaceUrl = compileFixture(
  (await read("../lib/workspace.ts")).replace(
    '"./seo-landings"',
    JSON.stringify(landings),
  ),
);
const { memberHref, workspaceLinks } = await import(workspaceUrl);
test("member destinations preserve filters, anchors and auth verification flows", () => {
  for (const [input, output] of [
    ["/", "/dashboard"],
    ["/jobs?q=Node&page=2#results", "/dashboard/jobs?q=Node&page=2#results"],
    ["/jobs/engineer-123", "/dashboard/jobs/engineer-123"],
    ["/companies/labs?page=2", "/dashboard/companies/labs?page=2"],
    ["/dashboard?view=saved&page=2", "/dashboard/saved?page=2"],
    ["/dashboard?view=matches", "/dashboard/matches"],
    ["/profile#account", "/dashboard/profile#account"],
    ["/billing?plan=annual", "/dashboard/billing?plan=annual"],
    [
      "/billing/success?checkout=123",
      "/dashboard/billing/success?checkout=123",
    ],
    ["/contact", "/dashboard/help"],
    ["/privacy", "/dashboard/privacy"],
    [
      "/backend-jobs?page=2",
      "/dashboard/jobs?page=2&techTrack=software&techRole=Backend+Engineer",
    ],
    ["/bengaluru-jobs?q=Node", "/dashboard/jobs?q=Node&city=Bengaluru"],
    ["/remote-jobs?remoteType=hybrid", "/dashboard/jobs?remoteType=hybrid"],
    ["/ai-jobs", "/dashboard/jobs?techTrack=ai-ml"],
    ["/verify-magic?token=secret", "/verify-magic?token=secret"],
    ["https://example.com/apply", "https://example.com/apply"],
    ["//example.com", "//example.com"],
    ["/admin/dashboard", "/admin/dashboard"],
    ["/dashboard/jobs?q=Node", "/dashboard/jobs?q=Node"],
  ])
    assert.equal(memberHref(input), output);
  assert.equal(workspaceLinks(false).length, 7);
  assert.ok(
    workspaceLinks(false).some(
      (l) => l.href === "/dashboard/matches" && l.label.includes("Pro"),
    ),
  );
});
test("workspace waits for verified sessions, replaces public/legacy links and isolates expiry", async () => {
  const dom = new JSDOM('<div id="root"></div>', {
    url: "http://localhost/jobs?q=Node#results",
  });
  const previous = new Map();
  for (const [key, value] of Object.entries({
    window: dom.window,
    document: dom.window.document,
    IS_REACT_ACT_ENVIRONMENT: true,
  })) {
    previous.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, {
      value,
      configurable: true,
      writable: true,
    });
  }
  const replacements = [];
  globalThis.workspaceFixture = {
    pathname: "/jobs",
    params: "q=Node",
    user: null,
    loading: true,
    router: { replace: (href) => replacements.push(href) },
  };
  const code = (await read("../components/MemberWorkspace.tsx"))
    .replace(
      'import Breadcrumbs from "@/components/Breadcrumbs";',
      "const Breadcrumbs=()=>null;",
    )
    .replace(
      'import { navigateAwayFromPublicTag } from "@/lib/analytics";',
      "const navigateAwayFromPublicTag=()=>false;",
    )
    .replace(
      'import Link from "next/link";',
      "const Link=({children,href,...rest})=><a href={href} {...rest}>{children}</a>;",
    )
    .replace(
      'import { usePathname, useRouter } from "next/navigation";',
      "const usePathname=()=>globalThis.workspaceFixture.pathname; const useSearchParams=()=>new URLSearchParams(globalThis.workspaceFixture.params); const useRouter=()=>globalThis.workspaceFixture.router;",
    )
    .replace(
      'import { useAuth } from "@/components/AuthProvider";',
      "const useAuth=()=>globalThis.workspaceFixture;",
    )
    .replace('"@/lib/workspace"', JSON.stringify(workspaceUrl))
    .replace(
      'import { isPro } from "@/lib/membership";',
      "const isPro=user=>Boolean(user?.membership?.isPro);",
    )
    .replace(
      'import Icon from "@/components/ui/Icon";',
      "const Icon=()=>null;",
    );
  const { default: Component } = await import(compileFixture(code));
  const { createElement, act } = await import("react"),
    { createRoot } = await import("react-dom/client");
  const root = createRoot(document.getElementById("root"));
  const render = () =>
    act(async () =>
      root.render(
        createElement(
          Component,
          { sessionHint: true },
          createElement("p", null, "Route content"),
        ),
      ),
    );
  try {
    await render();
    assert.ok(document.querySelector(".workspace-loading"));
    assert.deepEqual(replacements, []);
    globalThis.workspaceFixture.loading = false;
    await render();
    assert.equal(document.body.textContent, "Route content");
    assert.deepEqual(replacements, []);
    globalThis.workspaceFixture.user = {
      id: "a",
      name: "Member",
      membership: { isPro: false },
    };
    await render();
    assert.equal(replacements.at(-1), "/dashboard/jobs?q=Node#results");
    assert.ok(document.querySelector(".workspace-loading"));
    Object.assign(globalThis.workspaceFixture, {
      pathname: "/dashboard",
      params: "",
      loading: false,
    });
    await render();
    assert.equal(
      document.querySelector('[aria-current="page"]').textContent,
      "Overview",
    );
    assert.equal(
      document.querySelectorAll('nav[aria-label="Member workspace"] a').length,
      7,
    );
    assert.ok(document.querySelector('a[href="/dashboard/matches"]'));
    Object.assign(globalThis.workspaceFixture, {
      pathname: "/dashboard?wrong",
      params: "",
    });
    globalThis.workspaceFixture.pathname = "/dashboard/companies/labs";
    await render();
    assert.equal(
      document.querySelector('[aria-current="page"]').textContent,
      "Companies",
    );
    globalThis.workspaceFixture.user = null;
    await render();
    assert.ok(replacements.at(-1).startsWith("/login?next="));
    assert.equal(document.querySelector(".member-workspace"), null);
  } finally {
    await act(async () => root.unmount());
    delete globalThis.workspaceFixture;
    for (const [key, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
    dom.window.close();
  }
});

test("overview uses genuine saved/profile data and reads private matches only for Pro", async () => {
  const dom = new JSDOM('<div id="root"></div>', {
    url: "http://localhost/dashboard",
  });
  const previous = new Map();
  for (const [key, value] of Object.entries({
    window: dom.window,
    document: dom.window.document,
    IS_REACT_ACT_ENVIRONMENT: true,
  })) {
    previous.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, {
      value,
      configurable: true,
      writable: true,
    });
  }
  const calls = { recommendations: 0, jobs: 0, saved: 0 };
  const job = {
    _id: "123",
    title: "Real role",
    companyId: { name: "Employer" },
  };
  const fixture = {
    user: {
      id: "free",
      name: "Sample Member",
      profile: {},
      membership: { isPro: false },
    },
    ids: ["a", "b"],
    status: "ready",
    getRecommendations: async () => {
      calls.recommendations++;
      return { jobs: [job], matchCounts: { 75: 7 }, profileReady: true };
    },
    getSavedJobs: async () => {
      calls.saved++;
      return { data: [job] };
    },
    listJobsWithMeta: async () => {
      calls.jobs++;
      return { jobs: [job] };
    },
    jobUrl: () => "/jobs/real-role",
    catalogMetadata: () => ({}),
  };
  globalThis.overviewFixture = fixture;
  const readiness = compileFixture(await read("../lib/profile-readiness.ts")),
    membership = compileFixture(await read("../lib/membership.ts"));
  let source = (await read("../components/MemberOverview.tsx"))
    .replace(
      /import Link from "[^"]+";/,
      "const Link=({children,href,prefetch,...rest})=><a href={href} {...rest}>{children}</a>;",
    )
    .replace(
      'import { useAuth } from "@/components/AuthProvider";',
      "const useAuth=()=>globalThis.overviewFixture;",
    )
    .replace(
      /import \{[^;]*?getRecommendations,[^;]*?\} from "@\/lib\/auth";/,
      "const {getRecommendations,getSavedJobs}=globalThis.overviewFixture;",
    )
    .replace(
      /import \{[^;]*?listJobsWithMeta[^;]*?\} from "@\/lib\/reerhub";/,
      "const {listJobsWithMeta,jobUrl,catalogMetadata}=globalThis.overviewFixture;",
    )
    .replace(
      /import \{[^;]*?useSavedJobs,[^;]*?\} from "@\/lib\/saved-store";/,
      "const useSavedJobs=()=>globalThis.overviewFixture.ids; const useSavedJobsStatus=()=>globalThis.overviewFixture.status; const loadSaved=()=>{};",
    )
    .replace('"@/lib/profile-readiness"', JSON.stringify(readiness))
    .replace('"@/lib/membership"', JSON.stringify(membership))
    .replace(
      /import CatalogNotice,[\s\S]*?from "@\/components\/CatalogNotice";/,
      "const CatalogNotice=()=>null; const catalogInitializing=()=>false;",
    )
    .replace(/import CompanyLogo from "[^"]+";/, "const CompanyLogo=()=>null;")
    .replace(/import Icon from "[^"]+";/, "const Icon=()=>null;");
  // Replace imports individually; preserve the component's actual effects and rendering.
  const { default: Component } = await import(compileFixture(source));
  const { createElement, act } = await import("react"),
    { createRoot } = await import("react-dom/client");
  const root = createRoot(document.getElementById("root"));
  const render = (key) =>
    act(async () => {
      root.render(createElement(Component, { key }));
      await new Promise((r) => setTimeout(r, 5));
    });
  try {
    await render("free");
    assert.equal(calls.recommendations, 0);
    assert.equal(calls.jobs, 1);
    assert.match(document.body.textContent, /Saved roles2/);
    assert.match(document.body.textContent, /0 \/ 5/);
    assert.match(document.body.textContent, /Explore Pro/);
    assert.doesNotMatch(document.body.textContent, /Verified profile matches/);
    fixture.user = {
      ...fixture.user,
      id: "pro",
      membership: { isPro: true, subscription: { status: "active" } },
    };
    await render("pro");
    assert.equal(calls.recommendations, 1);
    assert.equal(calls.jobs, 1);
    assert.match(document.body.textContent, /Verified profile matches7/);
    fixture.status = "error";
    await render("saved-error");
    assert.match(document.body.textContent, /Saved rolesUnavailable/);
    fixture.getRecommendations = async () => {
      throw new Error("read failure");
    };
    // A fresh module binds the failed provider; the successful module above is intentionally immutable.
    const failedSource = source.replace(
      "const {getRecommendations,getSavedJobs}=globalThis.overviewFixture;",
      'const getRecommendations=()=>Promise.reject(new Error("read failed")); const {getSavedJobs}=globalThis.overviewFixture;',
    );
    const { default: Failed } = await import(compileFixture(failedSource));
    await act(async () => {
      root.render(createElement(Failed));
      await new Promise((r) => setTimeout(r, 5));
    });
    assert.match(
      document.body.textContent,
      /Verified profile matchesUnavailable/,
    );
    assert.match(document.body.textContent, /These roles couldn’t load/);
  } finally {
    await act(async () => root.unmount());
    delete globalThis.overviewFixture;
    for (const [key, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
    dom.window.close();
  }
});

test("member company filters update the workspace URL without returning to marketing routes", async () => {
  const dom = new JSDOM('<div id="root"></div>', {
    url: "http://localhost/dashboard/companies?q=Labs&page=2",
  });
  const previous = new Map();
  for (const [key, value] of Object.entries({
    window: dom.window,
    document: dom.window.document,
    IS_REACT_ACT_ENVIRONMENT: true,
  })) {
    previous.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, {
      value,
      configurable: true,
      writable: true,
    });
  }
  const code = (await read("../components/CompanyDirectory.tsx"))
    .replace(
      /import CatalogNotice,.*?;/,
      "const CatalogNotice=()=>null; const catalogInitializing=()=>false;",
    )
    .replace(
      /import Link from .*?;/,
      "const Link=({children,href,prefetch,...rest})=><a href={href} {...rest}>{children}</a>;",
    )
    .replace(
      'import { useSearchParams, usePathname, useRouter } from "next/navigation";',
      'const useSearchParams=()=>new URLSearchParams(window.location.search); const usePathname=()=>window.location.pathname; const useRouter=()=>({push(){throw new Error("unexpected navigation");}});',
    )
    .replace(
      /import \{[^;]*?\} from "@\/lib\/location-scope";/,
      'const locationScopeFromParams=()=>"india";',
    )
    .replace(/import CompanyLogo from .*?;/, "const CompanyLogo=()=>null;")
    .replace(/import Icon from .*?;/, "const Icon=()=>null;")
    .replace(
      /import \{[^;]*?\} from "@\/lib\/reerhub";/,
      'const listCompanyPage=()=>Promise.reject(new Error("not needed"));',
    );
  const { default: Component } = await import(compileFixture(code));
  const { createElement, act } = await import("react"),
    { createRoot } = await import("react-dom/client");
  const root = createRoot(document.getElementById("root"));
  try {
    await act(async () =>
      root.render(
        createElement(Component, {
          initialData: { data: [], pagination: { total: 0, totalPages: 1 } },
          initialKey: JSON.stringify(["Labs", false, 2, "india"]),
        }),
      ),
    );
    await act(async () =>
      document.querySelector('input[type="checkbox"]').click(),
    );
    assert.equal(window.location.pathname, "/dashboard/companies");
    assert.equal(
      new URLSearchParams(window.location.search).get("hiring"),
      "true",
    );
    assert.equal(new URLSearchParams(window.location.search).get("q"), "Labs");
    assert.equal(
      new URLSearchParams(window.location.search).has("page"),
      false,
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

test("saved roles honor direct page links and replace invalid later pages after removal", async () => {
  const dom = new JSDOM('<div id="root"></div>', {
    url: "http://localhost/dashboard/saved?page=2#dashboard-content",
  });
  const previous = new Map();
  for (const [key, value] of Object.entries({
    window: dom.window,
    document: dom.window.document,
    IS_REACT_ACT_ENVIRONMENT: true,
  })) {
    previous.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, {
      value,
      configurable: true,
      writable: true,
    });
  }
  let removed = false;
  const reads = [];
  globalThis.savedPageFixture = async (page) => {
    reads.push(page);
    return {
      data:
        page === 2
          ? removed
            ? []
            : [{ _id: "last", title: "Last role" }]
          : [{ _id: "first", title: "First role" }],
      meta: { totalPages: removed ? 1 : 2 },
    };
  };
  const source = await read("../components/MemberResultsPage.tsx");
  const start = source.indexOf("function SavedRoles("),
    end = source.indexOf("function Dashboard(", start);
  const code = `import {useState,useEffect,useCallback} from "react"; const useSearchParams=()=>new URLSearchParams(window.location.search); const getSavedJobs=globalThis.savedPageFixture; const JobCard=({job})=><article>{job.title}</article>; const Icon=()=>null; const Link=({children})=>children; export ${source.slice(start, end)}`;
  const { SavedRoles } = await import(compileFixture(code));
  const { createElement, act } = await import("react"),
    { createRoot } = await import("react-dom/client");
  const root = createRoot(document.getElementById("root"));
  const render = (ids) =>
    act(async () => {
      root.render(
        createElement(SavedRoles, { ids, onSave() {}, savingIds: [] }),
      );
      await new Promise((r) => setTimeout(r, 5));
    });
  try {
    await render(["first", "last"]);
    assert.equal(reads[0], 2);
    assert.match(document.body.textContent, /Last role/);
    assert.match(document.body.textContent, /2 \/ 2/);
    removed = true;
    await render(["first"]);
    assert.equal(window.location.search, "");
    assert.equal(window.location.hash, "#dashboard-content");
    await render(["first"]);
    assert.equal(reads.at(-1), 1);
    assert.match(document.body.textContent, /First role/);
  } finally {
    await act(async () => root.unmount());
    delete globalThis.savedPageFixture;
    for (const [key, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
    dom.window.close();
  }
});
