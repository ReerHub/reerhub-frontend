import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { compileFixture } from "./location-fixtures.mjs";

const compile = (source) =>
  `data:text/javascript;base64,${Buffer.from(
    ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.React,
      },
    }).outputText,
  ).toString("base64")}`;
const noticeSource = await readFile(
  new URL("../components/CatalogNotice.tsx", import.meta.url),
  "utf8",
);
const notices = await import(compileFixture(noticeSource));

test("catalog notices distinguish usable updates, delayed updates and first verification", () => {
  const render = (data) =>
    renderToStaticMarkup(React.createElement(notices.default, { data }));
  assert.equal(render({ catalogStatus: "ready" }), "");
  assert.equal(render({}), "");
  assert.match(
    render({ catalogStatus: "updating", catalogHasVerifiedJobs: true }),
    /You can continue browsing/,
  );
  assert.match(
    render({ catalogStatus: "attention", catalogHasVerifiedJobs: true }),
    /Some job information updates are delayed/,
  );
  assert.match(
    render({ catalogStatus: "updating", catalogHasVerifiedJobs: false }),
    /preparing our first verified openings/,
  );
  assert.doesNotMatch(
    render({ catalogStatus: "attention", catalogHasVerifiedJobs: false }),
    /continue browsing/,
  );
  assert.equal(
    notices.catalogInitializing({
      catalogStatus: "ready",
      catalogHasVerifiedJobs: false,
    }),
    false,
  );
  assert.equal(
    notices.catalogInitializing({
      catalogStatus: "updating",
      catalogHasVerifiedJobs: false,
    }),
    true,
  );
});

test("public transports retain additive catalog metadata and distinguish an outage from an unexpected error", async (t) => {
  const source = (
    await readFile(new URL("../lib/reerhub.ts", import.meta.url), "utf8")
  ).replace(
    'import { sharedRead } from "./read-sharing";',
    "const sharedRead = (_key, read) => read();",
  );
  const api = await import(compile(source));
  const metadata = { catalogStatus: "updating", catalogHasVerifiedJobs: true };
  t.mock.method(
    globalThis,
    "fetch",
    async () =>
      new Response(
        JSON.stringify({
          success: true,
          ...metadata,
          data: { totalJobs: 12, jobs: [] },
        }),
      ),
  );
  assert.deepEqual(await api.getHome(), {
    totalJobs: 12,
    jobs: [],
    ...metadata,
  });
  t.mock.method(
    globalThis,
    "fetch",
    async () =>
      new Response(
        JSON.stringify({
          success: true,
          ...metadata,
          data: [],
          pagination: { total: 10, totalAvailable: 12, totalPages: 1 },
        }),
      ),
  );
  const listing = await api.listJobsWithMeta();
  assert.equal(listing.catalogStatus, "updating");
  assert.equal(listing.total, 10);
  assert.equal(listing.totalAvailable, 12);
  t.mock.method(
    globalThis,
    "fetch",
    async () => new Response("unavailable", { status: 503 }),
  );
  await assert.rejects(api.getHome(), api.DataUnavailableError);
  t.mock.method(globalThis, "fetch", async () => {
    throw new TypeError("network unavailable");
  });
  await assert.rejects(api.listCompanyPage({}), api.DataUnavailableError);
  t.mock.method(globalThis, "fetch", async () => new Response("invalid json"));
  await assert.rejects(api.getHome(), SyntaxError);
});
