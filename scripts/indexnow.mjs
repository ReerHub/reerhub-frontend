import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { JSDOM } from "jsdom";

export const INDEXNOW_KEY = "71b3c9d5f4fb4ad9b78afed0e14ef857";
const ORIGIN = "https://reerhub.com";
const ENDPOINT = "https://api.indexnow.org/indexnow";

async function get(url, request) {
  const response = await request(url, {
    redirect: "error",
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`Read failed (${response.status}): ${url}`);
  return response.text();
}

export async function publicInventory(request = fetch) {
  const seen = new Set();
  const urls = new Set();
  async function readMap(url) {
    if (seen.has(url)) throw new Error("Repeated sitemap reference");
    seen.add(url);
    const dom = new JSDOM(await get(url, request), {
      contentType: "application/xml",
    });
    try {
      const document = dom.window.document;
      const root = document.documentElement.localName;
      if (!["urlset", "sitemapindex"].includes(root))
        throw new Error("Invalid sitemap XML");
      for (const node of document.querySelectorAll("loc")) {
        const value = new URL(node.textContent);
        if (
          value.origin !== ORIGIN ||
          value.search ||
          value.hash ||
          value.username ||
          value.password
        )
          throw new Error("Noncanonical sitemap URL");
        if (root === "sitemapindex") {
          if (!/^\/sitemaps\/\d+$/.test(value.pathname))
            throw new Error("Unexpected child sitemap");
          await readMap(value.href);
        } else {
          if (
            /^\/(dashboard|admin|api|admin-api|login|profile|verify-email|verify-magic|auth)(\/|$)/.test(
              value.pathname,
            ) ||
            value.pathname === "/billing/success"
          )
            throw new Error("Private URL in sitemap");
          urls.add(value.href);
        }
      }
    } finally {
      dom.window.close();
    }
  }
  await readMap(`${ORIGIN}/sitemap.xml`);
  if (!urls.size) throw new Error("Empty sitemap inventory");
  return urls;
}

// Explicit operator command, never executed during page reads or builds.
export async function notifyIndexNow(
  { urls, all = false, submit = false },
  request = fetch,
) {
  const inventory = await publicInventory(request);
  const selected = all ? [...inventory] : [...new Set(urls || [])];
  if (!selected.length)
    throw new Error(
      "Provide changed public URLs or --all for an initial submission",
    );
  if (selected.some((url) => !inventory.has(url)))
    throw new Error(
      "Only canonical URLs in the current public sitemap may be submitted",
    );
  const keyLocation = `${ORIGIN}/${INDEXNOW_KEY}.txt`;
  const batches = [];
  for (let i = 0; i < selected.length; i += 10000)
    batches.push({
      host: "reerhub.com",
      key: INDEXNOW_KEY,
      keyLocation,
      urlList: selected.slice(i, i + 10000),
    });
  if (!submit) return { mode: "dry-run", batches };
  if ((await get(keyLocation, request)).trim() !== INDEXNOW_KEY)
    throw new Error(
      "Live ownership key does not match; deploy and verify it first",
    );
  const statuses = [];
  for (const batch of batches) {
    const response = await request(ENDPOINT, {
      method: "POST",
      redirect: "error",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(batch),
      signal: AbortSignal.timeout(15000),
    });
    await response.body?.cancel();
    if (![200, 202].includes(response.status))
      throw new Error(
        `IndexNow returned ${response.status}; stopped without retrying`,
      );
    statuses.push(response.status);
  }
  return { mode: "submitted", urls: selected.length, statuses };
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  try {
    const args = process.argv.slice(2);
    let all = false,
      submit = false,
      file;
    for (let i = 0; i < args.length; i++) {
      if (args[i] === "--all") all = true;
      else if (args[i] === "--submit") submit = true;
      else if (args[i] === "--file" && args[i + 1]) file = args[++i];
      else
        throw new Error(
          "Usage: npm run indexnow -- (--all | --file changed-urls.json) [--submit]",
        );
    }
    if (all === Boolean(file)) throw new Error("Choose either --all or --file");
    const urls = file ? JSON.parse(await readFile(file, "utf8")) : undefined;
    if (
      file &&
      (!Array.isArray(urls) || urls.some((url) => typeof url !== "string"))
    )
      throw new Error(
        "The file must contain a JSON array of absolute public URLs",
      );
    console.log(
      JSON.stringify(await notifyIndexNow({ urls, all, submit }), null, 2),
    );
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
