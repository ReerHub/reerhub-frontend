import test from "node:test";
import assert from "node:assert/strict";
import ts from "typescript";
import { readFile } from "node:fs/promises";
const compile = async (path) =>
  ts.transpileModule(await readFile(new URL(path, import.meta.url), "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
const sharing = `data:text/javascript;base64,${Buffer.from(await compile("../lib/read-sharing.ts")).toString("base64")}`;
const code = (await compile("../lib/auth.ts"))
  .replace(
    /import .*from ["']@\/lib\/reerhub["'];/,
    "const API_BASE = '/api/v1';",
  )
  .replace(/from ["']\.\/read-sharing["']/g, `from '${sharing}'`);
const auth = await import(
  `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`
);
test("concurrent and late 401 responses rotate once and each read retries once", async () => {
  const original = globalThis.fetch;
  let refreshes = 0,
    refreshed = false,
    requests = 0;
  globalThis.fetch = async (path) => {
    if (path.endsWith("/auth/csrf"))
      return Response.json({ data: { csrfToken: "fixture" } });
    if (path.endsWith("/auth/refresh")) {
      refreshes++;
      refreshed = true;
      return Response.json({ success: true });
    }
    const stale = !refreshed;
    requests++;
    if (stale) {
      await new Promise((r) =>
        setTimeout(r, path.includes("minScore=50") ? 15 : 0),
      );
      return new Response("", { status: 401 });
    }
    return Response.json({ data: { jobs: [] } });
  };
  try {
    await Promise.all([
      auth.getRecommendations(75),
      auth.getRecommendations(50),
    ]);
    assert.equal(refreshes, 1);
    assert.equal(requests, 4);
  } finally {
    globalThis.fetch = original;
  }
});
test("session reads deduplicate and anonymous sessions do not attempt refresh", async () => {
  const original = globalThis.fetch;
  let requests = 0;
  globalThis.fetch = async (path) => {
    assert.ok(path.endsWith("/users/session"));
    requests++;
    return Response.json({ data: null });
  };
  try {
    assert.deepEqual(await Promise.all([auth.getMe(), auth.getMe()]), [
      null,
      null,
    ]);
    assert.equal(requests, 1);
  } finally {
    globalThis.fetch = original;
  }
});
