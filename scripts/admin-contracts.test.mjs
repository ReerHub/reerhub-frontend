import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";
import { NextRequest } from "next/server.js";

const compile = (source) =>
  ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
const moduleUrl = (source) =>
  `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
const response = (data, status = 200, pagination) =>
  new Response(JSON.stringify({ data, pagination }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
const source = await readFile(
  new URL("../lib/admin.ts", import.meta.url),
  "utf8",
);

test("admin API contracts, pagination, refresh and CSRF", async () => {
  const original = {
    window: globalThis.window,
    document: globalThis.document,
    fetch: globalThis.fetch,
  };
  globalThis.window = { location: { hostname: "localhost" } };
  globalThis.document = { cookie: "csrfToken=fixture-token" };
  const api = await import(moduleUrl(compile(source)));
  try {
    assert.equal(api.adminAuthPath(), "/admin/auth");
    assert.equal(api.adminDashboardPath(), "/admin/dashboard");
    for (const route of [
      "companies",
      "jobs",
      "users",
      "subscriptions",
      "audit-logs",
    ]) {
      globalThis.fetch = async (url) => {
        assert.ok(url.startsWith("/admin-api/admin/"));
        return response([{ _id: "one" }], 200, {
          page: 2,
          limit: 25,
          total: 31,
          totalPages: 2,
        });
      };
      const page = await api.getAdminPage(`/admin/${route}?page=2`);
      assert.equal(page.data[0]._id, "one");
      assert.equal(page.pagination.total, 31);
      assert.equal(page.pagination.page, 2);
    }
    globalThis.fetch = async () => response([]);
    await assert.rejects(
      api.getAdminPage("/admin/companies"),
      /invalid pagination/,
    );
    globalThis.fetch = async () => response({ data: [] });
    await assert.rejects(
      api.getAdminList("/admin/sources"),
      /did not return a list/,
    );
    globalThis.fetch = async () => new Response("not JSON", { status: 200 });
    await assert.rejects(api.getAdmin("/admin/overview"), /invalid response/);
    let refreshes = 0;
    let refreshed = false;
    globalThis.fetch = async (url, init) => {
      if (url.endsWith("/auth/refresh")) {
        refreshes++;
        assert.equal(init.headers["x-csrf-token"], "fixture-token");
        await new Promise((resolve) => setTimeout(resolve, 5));
        refreshed = true;
        return response({ id: "admin" });
      }
      return refreshed
        ? response({ id: "admin", role: "admin" })
        : response(null, 401);
    };
    const sessions = await Promise.all([
      api.adminSession(),
      api.adminSession(),
    ]);
    assert.equal(refreshes, 1);
    assert.equal(sessions[0].role, "admin");
    globalThis.fetch = async (_url, init) => {
      assert.equal(init.method, "PATCH");
      assert.equal(init.headers["x-csrf-token"], "fixture-token");
      assert.deepEqual(JSON.parse(init.body), { isActive: false });
      return response({ saved: true });
    };
    assert.equal(
      (
        await api.writeAdmin("/admin/companies/one", "PATCH", {
          isActive: false,
        })
      ).saved,
      true,
    );
    globalThis.window.location.hostname = "admin.reerhub.com";
    assert.equal(api.adminAuthPath(), "/auth");
    globalThis.fetch = async (url) => {
      assert.equal(url, "/api/v1/admin/auth/session");
      return response({ role: "admin" });
    };
    await api.adminSession();
    globalThis.fetch = async () => response(null, 403);
    await assert.rejects(
      api.getAdmin("/admin/overview"),
      (error) => error.status === 403,
    );
    globalThis.document.cookie = "";
    globalThis.fetch = async (url) => {
      assert.equal(url, "/api/v1/auth/csrf");
      return response(null, 503);
    };
    await assert.rejects(
      api.writeAdmin("/admin/companies/one", "PATCH", {}),
      /Secure request verification/,
    );
  } finally {
    Object.assign(globalThis, original);
  }
});

test("admin host routes stay isolated and required public config remains accessible", async () => {
  const hosts = compile(
    await readFile(new URL("../lib/admin-host.ts", import.meta.url), "utf8"),
  );
  const proxySource = compile(
    await readFile(new URL("../proxy.ts", import.meta.url), "utf8"),
  )
    .replaceAll('"@/lib/admin-host"', JSON.stringify(moduleUrl(hosts)))
    .replaceAll(
      '"next/server"',
      JSON.stringify(
        new URL("../node_modules/next/server.js", import.meta.url).href,
      ),
    );
  const { proxy } = await import(moduleUrl(proxySource));
  const route = (host, path, marker) =>
    proxy(
      new NextRequest(`https://${host}${path}`, {
        headers: {
          host,
          ...(marker ? { "x-reerhub-admin-surface": "1" } : {}),
        },
      }),
    );
  assert.equal(route("reerhub.com", "/jobs").headers.get("x-robots-tag"), null);
  for (const [host, path] of [
    ["staging.reerhub.com", "/jobs"],
    ["admin.reerhub.com", "/auth"],
    ["admin.reerhub.com", "/dashboard"],
    ["reerhub.com", "/login"],
    ["reerhub.com", "/dashboard"],
    ["reerhub.com", "/profile"],
    ["reerhub.com", "/billing/success"],
  ]) {
    assert.equal(
      route(host, path).headers.get("x-robots-tag"),
      "noindex, nofollow",
    );
  }
  for (const host of ["reerhub.com", "www.reerhub.com"])
    for (const path of [
      "/auth",
      "/admin/auth",
      "/admin/dashboard",
      "/admin-dashboard",
      "/admin-api/admin/overview",
    ])
      assert.match(
        route(host, path).headers.get("x-middleware-rewrite"),
        /__reerhub_not_found/,
      );
  for (const host of [
    "localhost:3000",
    "127.0.0.1:3000",
    "staging.reerhub.com",
  ]) {
    assert.equal(route(host, "/").headers.get("x-middleware-next"), "1");
    assert.match(
      route(host, "/admin/auth").headers.get("x-middleware-rewrite"),
      /admin-auth/,
    );
    assert.match(
      route(host, "/admin/dashboard").headers.get("x-middleware-rewrite"),
      /admin-dashboard/,
    );
    assert.equal(
      route(host, "/admin-dashboard", true).headers.get("x-middleware-next"),
      "1",
    );
  }
  assert.match(
    route("admin.reerhub.com", "/auth").headers.get("x-middleware-rewrite"),
    /admin-auth/,
  );
  for (const path of ["/api/config", "/reerhub-icon-logo.png"])
    assert.equal(
      route("admin.reerhub.com", path).headers.get("x-middleware-next"),
      "1",
    );
  assert.match(
    route("reerhub.com", "/admin-dashboard", true).headers.get(
      "x-middleware-rewrite",
    ),
    /__reerhub_not_found/,
  );
});
