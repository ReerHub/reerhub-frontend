import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { compileFixture } from "./location-fixtures.mjs";
import { NextRequest } from "next/server.js";
const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const landings = compileFixture(await read("../lib/seo-landings.ts"));
const statusModule = compileFixture(
  (await read("../lib/public-route-status.ts"))
    .replace('"./seo-landings"', JSON.stringify(landings))
    .replace(
      'import { jobUrl } from "./reerhub";',
      'const jobUrl=j=>`/jobs/${j.title.toLowerCase().replaceAll(" ","-")}-${j.companyId.name.toLowerCase()}-${j._id}`;',
    )
    .replace(
      '"next/server"',
      JSON.stringify(
        new URL("../node_modules/next/server.js", import.meta.url).href,
      ),
    ),
);
const { publicRouteResponse, directoryPageValue } = await import(statusModule);
const req = (path) => new NextRequest("https://reerhub.com" + path);
test("directory normalization has one representation and preserves supported filters", async () => {
  for (const value of [null, "abc", "2abc", "0", "-1", "9007199254740993"])
    assert.equal(directoryPageValue(value), 1);
  assert.equal(directoryPageValue("02"), 2);
  const previous = globalThis.fetch;
  try {
    globalThis.fetch = () => {
      throw new Error("must normalize before reading");
    };
    for (const [path, target] of [
      ["/companies?page=abc&q=React", "/companies?q=React"],
      ["/companies?page=02", "/companies?page=2"],
      ["/companies?page=1", "/companies"],
    ]) {
      const r = await publicRouteResponse(req(path));
      assert.equal(r.status, 308);
      assert.equal(
        new URL(r.headers.get("location")).pathname +
          new URL(r.headers.get("location")).search,
        target,
      );
    }
  } finally {
    globalThis.fetch = previous;
  }
});
test("one bounded lightweight request handles missing, unavailable, filtered empty and recovery", async () => {
  const previous = globalThis.fetch;
  let count = 0;
  try {
    globalThis.fetch = async (input, options) => {
      count++;
      assert.ok(String(input).includes("/discovery/status?"));
      assert.equal(options.cache, "no-store");
      assert.ok(options.signal);
      return new Response("", { status: 404 });
    };
    assert.equal(
      (await publicRouteResponse(req("/companies/missing"))).status,
      404,
    );
    assert.equal(
      (await publicRouteResponse(req("/companies?page=9999"))).status,
      404,
    );
    assert.equal(count, 2);
    for (const behavior of [
      () => new Response("", { status: 404 }),
      () => new Response("", { status: 500 }),
      () => new Response("", { status: 503 }),
      () => Response.json({}),
      () => {
        throw new DOMException("timeout", "TimeoutError");
      },
    ]) {
      globalThis.fetch = async () => behavior();
      const r = await publicRouteResponse(req("/python-jobs"));
      assert.equal(r.status, 503);
      assert.equal(r.headers.get("cache-control"), "no-store");
      assert.equal(r.headers.get("retry-after"), "60");
      assert.doesNotMatch(await r.text(), /noindex/);
    }
    globalThis.fetch = async () =>
      Response.json({ success: true, data: { totalPages: 0 } });
    assert.equal(await publicRouteResponse(req("/companies?q=no-match")), null);
    globalThis.fetch = async () =>
      Response.json({
        success: true,
        data: {
          catalogStatus: "ready",
          catalogHasVerifiedJobs: false,
          editorialInventory: { activeRoles: 0, employers: 0 },
        },
      });
    assert.equal(await publicRouteResponse(req("/python-jobs")), null);
    assert.equal(await publicRouteResponse(req("/faq")), null);
  } finally {
    globalThis.fetch = previous;
  }
});
