import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { JSDOM } from "jsdom";
import { compileFixture } from "./location-fixtures.mjs";
const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const workspaceUrl = compileFixture(await read("../lib/workspace.ts"));
const dashboardUrl = compileFixture(await read("../lib/dashboard.ts"));

test("member workspace preserves membership-aware views and frames only account routes", async () => {
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
  globalThis.workspaceFixture = {
    pathname: "/dashboard",
    view: null,
    user: { name: "Sample member", membership: { isPro: false } },
  };
  const code = (await read("../components/MemberWorkspace.tsx"))
    .replace(
      'import Link from "next/link";',
      "const Link=({children,href,scroll,...rest})=><a href={href} {...rest}>{children}</a>;",
    )
    .replace(
      'import { usePathname, useSearchParams } from "next/navigation";',
      "const usePathname=()=>globalThis.workspaceFixture.pathname; const useSearchParams=()=>new URLSearchParams(globalThis.workspaceFixture.view ? {view:globalThis.workspaceFixture.view}:{});",
    )
    .replace(
      'import { useAuth } from "@/components/AuthProvider";',
      "const useAuth=()=>({user:globalThis.workspaceFixture.user,loading:false});",
    )
    .replace('"@/lib/dashboard"', JSON.stringify(dashboardUrl))
    .replace('"@/lib/workspace"', JSON.stringify(workspaceUrl))
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
          null,
          createElement("p", null, "Route content"),
        ),
      ),
    );
  try {
    await render();
    assert.equal(
      document.querySelector('[aria-current="page"]').textContent,
      "Discover jobs",
    );
    assert.equal(
      document.querySelector('a[href="/dashboard?view=matches"]'),
      null,
    );
    globalThis.workspaceFixture.view = "saved";
    await render();
    assert.equal(
      document.querySelector('[aria-current="page"]').textContent,
      "Saved roles",
    );
    globalThis.workspaceFixture.user.membership.isPro = true;
    globalThis.workspaceFixture.view = null;
    await render();
    assert.equal(
      document.querySelector('[aria-current="page"]').textContent,
      "Your matches",
    );
    globalThis.workspaceFixture.pathname = "/profile";
    await render();
    assert.equal(
      document.querySelector('[aria-current="page"]').textContent,
      "Profile & preferences",
    );
    globalThis.workspaceFixture.pathname = "/billing/success";
    await render();
    assert.equal(
      document.querySelector('[aria-current="page"]').textContent,
      "Manage Pro",
    );
    globalThis.workspaceFixture.user = null;
    await render();
    assert.equal(document.querySelector(".member-workspace"), null);
    globalThis.workspaceFixture.pathname = "/jobs";
    globalThis.workspaceFixture.user = {
      name: "Sample",
      membership: { isPro: true },
    };
    await render();
    assert.equal(document.querySelector(".member-workspace"), null);
    assert.equal(document.body.textContent, "Route content");
  } finally {
    await act(async () => root.unmount());
    delete globalThis.workspaceFixture;
    for (const [key, value] of previous) {
      if (value) Object.defineProperty(globalThis, key, value);
      else delete globalThis[key];
    }
    dom.window.close();
  }
});
