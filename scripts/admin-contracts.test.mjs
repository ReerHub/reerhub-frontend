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

test("all admin workspaces share Indigo tokens without legacy blue accents", async () => {
  const css = await readFile(
    new URL("../app/admin.css", import.meta.url),
    "utf8",
  );
  assert.match(css, /--a-blue: #4f46e5/);
  assert.match(css, /--a-ink: #18181b/);
  assert.match(css, /--a-canvas: #fafafc/);
  assert.match(css, /background: #25215a/);
  assert.doesNotMatch(css, /#2f6fed|#2458bf|#2559c4|#e8f0ff/);
});

test("Slice replaces its legacy favicon without overriding custom logos", async () => {
  const source = await readFile(
    new URL("../lib/company-logo.ts", import.meta.url),
    "utf8",
  );
  const { companyLogoUrl } = await import(moduleUrl(compile(source)));
  const official = "https://slice.bank.in/favicon-96x96.png";
  assert.equal(
    companyLogoUrl(
      "Slice",
      "https://www.google.com/s2/favicons?domain=sliceit.com&sz=128",
    ),
    official,
  );
  assert.equal(
    companyLogoUrl(
      "slice",
      "https://t2.gstatic.com/faviconV2?url=http%3A%2F%2Fsliceit.com",
    ),
    official,
  );
  assert.equal(companyLogoUrl("Slice"), official);
  assert.equal(companyLogoUrl("Slice", "/custom-logo.svg"), "/custom-logo.svg");
  assert.equal(
    companyLogoUrl(
      "Other",
      "https://www.google.com/s2/favicons?domain=sliceit.com",
    ),
    "https://www.google.com/s2/favicons?domain=sliceit.com",
  );
});

test("public layout caps wide screens and grids respond to their container", async () => {
  const css = await readFile(
    new URL("../app/public.css", import.meta.url),
    "utf8",
  );
  const home = await readFile(
    new URL("../components/HomePage.module.css", import.meta.url),
    "utf8",
  );
  const billing = await readFile(
    new URL("../app/billing/Billing.module.css", import.meta.url),
    "utf8",
  );
  assert.match(
    css,
    /\.public-site \.page-container\s*\{[^}]*max-width: 1680px/,
  );
  assert.match(css, /padding-inline: clamp\(20px, 3vw, 48px\)/);
  assert.match(css, /container-type: inline-size/);
  assert.match(css, /@container \(min-width: 1248px\)/);
  assert.match(css, /minmax\(min\(100%, 300px\), 1fr\)/);
  assert.doesNotMatch(css, /repeat\(5, minmax/);
  assert.match(home, /max-width: 64rem/);
  assert.match(home, /max-width: 100%/);
  assert.match(home, /text-align: center/);
  assert.doesNotMatch(home, /grid-template-columns: minmax\(0, 1fr\) minmax/);
  assert.match(home, /minmax\(min\(100%, 160px\), 1fr\)/);
  assert.match(billing, /max-width: 1200px/);
});

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

test("public Indigo styling is isolated from legacy admin and meets core contrast", async () => {
  const css = await readFile(
    new URL("../app/public.css", import.meta.url),
    "utf8",
  );
  const layout = await readFile(
    new URL("../app/layout.tsx", import.meta.url),
    "utf8",
  );
  const base = await readFile(
    new URL("../app/globals.css", import.meta.url),
    "utf8",
  );
  assert.match(layout, /isAdminHost \? "admin-site" : "public-site"/);
  assert.match(css, /--color-primary: #4f46e5/);
  assert.match(base, /--color-primary: #2f6fed/);
  assert.match(css, /\.public-site \.bg-primary/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  const luminance = (hex) => {
    const values = hex
      .match(/\w\w/g)
      .map((value) => parseInt(value, 16) / 255)
      .map((value) =>
        value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
      );
    return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
  };
  for (const [foreground, background] of [
    ["ffffff", "4f46e5"],
    ["475569", "fafafc"],
    ["64748b", "ffffff"],
    ["dedcf3", "312e81"],
  ]) {
    const a = luminance(foreground),
      b = luminance(background);
    assert.ok((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) >= 4.5);
  }
});

test("public branding reserves gradients for Pro and uses quiet chrome", async () => {
  const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
  const css = await read("../app/public.css");
  assert.match(css, /linear-gradient\(130deg, #25215a, #312e81\)/);
  for (const selector of ["site-nav", "mobile-nav-panel", "site-footer"]) {
    assert.match(
      css,
      new RegExp(`\\.${selector} \\{\\s*background: var\\(--public-chrome\\)`),
    );
  }
  const footer = await read("../components/Footer.jsx");
  assert.doesNotMatch(footer, /footer-intro|ReerHub<|ReerHub\.<\//);
  assert.match(footer, /footer-wordmark[\s\S]*?ReerHub/);
  const home = await read("../components/HomePage.module.css");
  assert.match(
    home,
    /\.proPromotion \{[\s\S]*?background: var\(--public-gradient\)/,
  );
  assert.match(home, /\.closing \{[\s\S]*?#fff/);
  assert.match(
    await read("../app/billing/Billing.module.css"),
    /background: var\(--public-gradient\)/,
  );
  assert.doesNotMatch(
    await read("../app/share-image/route.tsx"),
    />ReerHub\.</,
  );
});

test("homepage ranks real hiring companies and limits the grid to sixteen", async () => {
  const source = await readFile(
    new URL("../lib/home-companies.ts", import.meta.url),
    "utf8",
  );
  const { topHiringCompanies } = await import(moduleUrl(compile(source)));
  const companies = Array.from({ length: 20 }, (_, index) => ({
    _id: String(index),
    name: `Company ${index}`,
    activeJobs: index,
  }));
  const original = [...companies];
  const ranked = topHiringCompanies(companies);
  assert.equal(ranked.length, 16);
  assert.equal(ranked[0].activeJobs, 19);
  assert.equal(ranked[15].activeJobs, 4);
  assert.deepEqual(companies, original);
  assert.deepEqual(topHiringCompanies([{ _id: "1", name: "No openings" }]), []);
  assert.equal(
    topHiringCompanies([
      { _id: "b", name: "Beta", activeJobs: 1 },
      { _id: "a", name: "Alpha", activeJobs: 1 },
    ])[0].name,
    "Alpha",
  );
  const motion = await readFile(
    new URL("../components/MatchJourney.module.css", import.meta.url),
    "utf8",
  );
  assert.match(motion, /prefers-reduced-motion: reduce/);
  assert.match(motion, /animation-play-state: paused/);
});

test("public profile guidance treats zero experience as complete, not missing", async () => {
  const source = await readFile(
    new URL("../lib/profile-readiness.ts", import.meta.url),
    "utf8",
  );
  const { profileSignals } = await import(moduleUrl(compile(source)));
  const complete = {
    techTrack: "software",
    currentRole: "Backend Engineer",
    skills: ["Node.js", "SQL", "TypeScript"],
    experienceYears: 0,
    remoteType: "remote",
  };
  assert.ok(profileSignals(complete).every((signal) => signal.complete));
  assert.equal(
    profileSignals({}).filter((signal) => signal.complete).length,
    0,
  );
  for (const experienceYears of [undefined, null, NaN, -1]) {
    assert.equal(
      profileSignals({ ...complete, experienceYears }).find(
        (signal) => signal.label === "Experience",
      ).complete,
      false,
    );
  }
  assert.equal(
    profileSignals({ ...complete, skills: ["SQL"] }).find(
      (signal) => signal.label === "3+ skills",
    ).complete,
    false,
  );
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
