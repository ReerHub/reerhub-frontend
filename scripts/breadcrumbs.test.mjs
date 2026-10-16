import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { JSDOM } from "jsdom";
import { compileFixture } from "./location-fixtures.mjs";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const landings = compileFixture(await read("../lib/seo-landings.ts"));
const breadcrumbsUrl = compileFixture(
  (await read("../lib/breadcrumbs.ts"))
    .replace(
      '"./blog-catalog"',
      JSON.stringify(compileFixture(await read("../lib/blog-catalog.ts"))),
    )
    .replace('"./seo-landings"', JSON.stringify(landings)),
);
const workspaceUrl = compileFixture(
  (await read("../lib/workspace.ts")).replace(
    '"./seo-landings"',
    JSON.stringify(landings),
  ),
);
const { pageBreadcrumbs } = await import(breadcrumbsUrl);
const componentUrl = compileFixture(
  (await read("../components/Breadcrumbs.tsx"))
    .replace(
      'import { usePathname } from "next/navigation";',
      "const usePathname=()=>globalThis.breadcrumbPath;",
    )
    .replace(
      'import Link from "@/components/AppLink";',
      "const Link=({href,children,...props})=><a href={href} {...props}>{children}</a>;",
    )
    .replace('"@/lib/breadcrumbs"', JSON.stringify(breadcrumbsUrl))
    .replace('"@/lib/workspace"', JSON.stringify(workspaceUrl)),
);
const { default: Breadcrumbs } = await import(componentUrl);
const render = (pathname, props = {}) => {
  globalThis.breadcrumbPath = pathname;
  return new JSDOM(
    renderToStaticMarkup(
      createElement(Breadcrumbs, { origin: "https://reerhub.com", ...props }),
    ),
  ).window.document;
};

test("public trails are server rendered and agree with their canonical schema", () => {
  for (const path of [
    "/jobs",
    "/companies",
    "/faq",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
    "/billing",
    "/backend-jobs",
    "/pune-jobs",
  ]) {
    const document = render(path);
    const schema = JSON.parse(
      document.querySelector('script[type="application/ld+json"]').textContent,
    );
    const names = [...document.querySelectorAll("li")].map((item) =>
      item.textContent.replace(/^\/\s*/, ""),
    );
    assert.deepEqual(
      schema.itemListElement.map((item) => item.name),
      names,
    );
    assert.equal(
      document.querySelector('[aria-current="page"]').textContent,
      names.at(-1),
    );
    assert.equal(
      schema.itemListElement.at(-1).item,
      `https://reerhub.com${path}`,
    );
  }
});

test("workspace trails stay private and inside the workspace", () => {
  for (const path of [
    "/dashboard/jobs",
    "/dashboard/profile",
    "/dashboard/billing",
    "/dashboard/help",
    "/dashboard/faq",
  ]) {
    const document = render(path);
    assert.equal(
      document.querySelector("a").getAttribute("href"),
      "/dashboard",
    );
    assert.equal(document.querySelector("a").textContent, "Overview");
    assert.equal(document.querySelector("script"), null);
  }
});

test("detail trails use real titles, escape JSON-LD and map member destinations", () => {
  const items = [
    { name: "Home", path: "/" },
    { name: "Jobs", path: "/jobs" },
    { name: "Engineer </script>", path: "/jobs/actual-role" },
  ];
  const publicPage = render("/jobs/actual-role", { items });
  assert.equal(publicPage.querySelectorAll("script").length, 1);
  assert.equal(
    JSON.parse(
      publicPage.querySelector("script").textContent,
    ).itemListElement.at(-1).name,
    items.at(-1).name,
  );
  const privatePage = render("/dashboard/jobs/actual-role", { items });
  assert.deepEqual(
    [...privatePage.querySelectorAll("a")].map((a) => a.getAttribute("href")),
    ["/dashboard", "/dashboard/jobs"],
  );
  assert.equal(privatePage.querySelector("script"), null);
});

test("home, authentication, admin, unknown paths and implicit details get no invented trail", () => {
  for (const path of [
    "/",
    "/dashboard",
    "/login",
    "/admin",
    "/unknown",
    "/jobs/unknown-role",
    "/companies/unknown-company",
  ])
    assert.equal(pageBreadcrumbs(path), null);
});

test("company job trail stays aligned with public schema and member destinations", () => {
  const items = [
    { name: "Home", path: "/" },
    { name: "Jobs", path: "/jobs" },
    { name: "Notion", path: "/companies/notion" },
    { name: "Software Engineer", path: "/jobs/notion-role" },
  ];
  const doc = render("/jobs/notion-role", { items });
  assert.equal(
    doc.querySelector('a[href="/companies/notion"]').textContent,
    "Notion",
  );
  const schema = JSON.parse(doc.querySelector("script").textContent);
  assert.deepEqual(
    schema.itemListElement.map((i) => i.name),
    items.map((i) => i.name),
  );
  const member = render("/dashboard/jobs/notion-role", { items });
  assert.ok(member.querySelector('a[href="/dashboard/companies/notion"]'));
  assert.equal(member.querySelector("script"), null);
});

test("skill hubs map to member discovery without losing URL context", async () => {
  const { memberHref } = await import(workspaceUrl);
  const mapped = new URL(
    memberHref("/react-jobs?city=Pune#roles"),
    "https://reerhub.com",
  );
  assert.equal(mapped.pathname, "/dashboard/jobs");
  assert.equal(mapped.searchParams.get("skills"), "React");
  assert.equal(mapped.searchParams.get("city"), "Pune");
  assert.equal(mapped.hash, "#roles");
});
