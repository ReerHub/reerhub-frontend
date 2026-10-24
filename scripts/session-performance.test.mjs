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
    "const API_BASE = '/api/v1'; const catalogMetadata = () => ({});",
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

test("resume transport shares authenticated errors, CSRF and expected-owner headers", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async (path, init) => {
    if (path.endsWith("/auth/csrf"))
      return Response.json({ data: { csrfToken: "fixture" } });
    assert.equal(init.headers["x-csrf-token"], "fixture");
    assert.equal(init.headers["x-resume-owner"], "expected-member");
    assert.equal(init.cache, "no-store");
    return Response.json({ message: "Account changed" }, { status: 409 });
  };
  try {
    await assert.rejects(
      auth.authenticatedRequest("/resumes", {
        method: "POST",
        cache: "no-store",
        headers: { "x-resume-owner": "expected-member" },
      }),
      (error) => error.status === 409 && error.message === "Account changed",
    );
  } finally {
    globalThis.fetch = original;
  }
});

test("cross-tab hints contain no identity and ignore self/invalid messages", async () => {
  const original = globalThis.BroadcastChannel;
  const channels = [];
  globalThis.BroadcastChannel = class {
    constructor(name) {
      this.name = name;
      channels.push(this);
    }
    postMessage(value) {
      this.message = value;
    }
    close() {
      this.closed = true;
    }
  };
  try {
    const sync = await import(
      `data:text/javascript;base64,${Buffer.from(await compile("../lib/session-sync.ts")).toString("base64")}`
    );
    let checks = 0;
    const unsubscribe = sync.subscribeSessionChange(() => checks++);
    sync.notifySessionChange();
    const [receiver, sender] = channels;
    assert.deepEqual(Object.keys(sender.message).sort(), ["source", "type"]);
    receiver.onmessage({ data: sender.message });
    receiver.onmessage({ data: { type: "unknown", source: "other-tab" } });
    assert.equal(checks, 0);
    receiver.onmessage({
      data: { type: "check-session", source: "other-tab" },
    });
    assert.equal(checks, 1);
    unsubscribe();
    assert.ok(receiver.closed && sender.closed);
  } finally {
    globalThis.BroadcastChannel = original;
  }
});
