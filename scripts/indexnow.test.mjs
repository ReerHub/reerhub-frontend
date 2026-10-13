import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { INDEXNOW_KEY, notifyIndexNow } from "./indexnow.mjs";
const origin = "https://reerhub.com";
const urlset = (urls) =>
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((url) => `<url><loc>${url}</loc></url>`).join("")}</urlset>`;
const index = `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>${origin}/sitemaps/0</loc></sitemap></sitemapindex>`;

test("IndexNow ownership file matches the supplied key exactly", async () => {
  assert.equal(
    await readFile(
      new URL(`../public/${INDEXNOW_KEY}.txt`, import.meta.url),
      "utf8",
    ),
    INDEXNOW_KEY,
  );
});

test("IndexNow defaults to a deduplicated dry run and follows legacy sitemap indexes", async () => {
  const reads = [];
  const request = async (url, init) => {
    assert.notEqual(init.method, "POST");
    reads.push(url);
    return new Response(
      url.endsWith("sitemap.xml")
        ? index
        : urlset([origin + "/jobs", origin + "/jobs"]),
    );
  };
  const result = await notifyIndexNow({ all: true }, request);
  assert.equal(result.mode, "dry-run");
  assert.deepEqual(result.batches[0].urlList, [origin + "/jobs"]);
  assert.equal(result.batches[0].keyLocation, `${origin}/${INDEXNOW_KEY}.txt`);
  assert.equal(reads.length, 2);
});

test("IndexNow batches 10001 URLs and accepts 200/202 without claiming indexing", async () => {
  const urls = Array.from(
    { length: 10001 },
    (_, i) => origin + "/jobs/role-" + i,
  );
  const posts = [];
  const request = async (url, init) => {
    if (init.method === "POST") {
      assert.equal(url, "https://api.indexnow.org/indexnow");
      posts.push(JSON.parse(init.body));
      return new Response(null, { status: posts.length === 1 ? 200 : 202 });
    }
    return new Response(
      url.endsWith("sitemap.xml") ? urlset(urls) : INDEXNOW_KEY,
    );
  };
  const result = await notifyIndexNow({ all: true, submit: true }, request);
  assert.deepEqual(
    posts.map((batch) => batch.urlList.length),
    [10000, 1],
  );
  assert.deepEqual(result.statuses, [200, 202]);
});

test("IndexNow rejects private, foreign, filtered, malformed and unavailable inventories", async () => {
  for (const body of [
    urlset([origin + "/dashboard"]),
    urlset([origin + "/verify-magic"]),
    urlset(["https://example.com/jobs"]),
    urlset([origin + "/jobs?q=private"]),
    "<broken>",
    urlset([]),
  ]) {
    await assert.rejects(
      notifyIndexNow({ all: true }, async () => new Response(body)),
    );
  }
  await assert.rejects(
    notifyIndexNow(
      { all: true },
      async () => new Response(null, { status: 503 }),
    ),
  );
  await assert.rejects(
    notifyIndexNow(
      { urls: [origin + "/profile"] },
      async () => new Response(urlset([origin + "/jobs"])),
    ),
    /canonical/,
  );
});

test("IndexNow verifies live ownership before POST and stops on provider errors", async () => {
  let posts = 0;
  const request = (key, status) => async (url, init) => {
    if (init.method === "POST") {
      posts++;
      return new Response(null, { status });
    }
    return new Response(
      url.endsWith("sitemap.xml") ? urlset([origin + "/jobs"]) : key,
    );
  };
  await assert.rejects(
    notifyIndexNow({ all: true, submit: true }, request("wrong", 200)),
    /ownership/,
  );
  assert.equal(posts, 0);
  for (const status of [400, 403, 422, 429, 503])
    await assert.rejects(
      notifyIndexNow(
        { all: true, submit: true },
        request(INDEXNOW_KEY, status),
      ),
      new RegExp(String(status)),
    );
  assert.equal(posts, 5);
});
