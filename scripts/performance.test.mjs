import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import ts from "typescript";
const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const compiled = ts.transpileModule(await read("../lib/read-sharing.ts"), {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const { sharedRead } = await import(
  `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`
);
test("identical reads share work but do not retain errors or private results", async () => {
  let calls = 0;
  const load = async () => ++calls;
  assert.deepEqual(
    await Promise.all([sharedRead("a", load), sharedRead("a", load)]),
    [1, 1],
  );
  assert.equal(await sharedRead("a", load), 2);
  await assert.rejects(
    sharedRead("fail", async () => {
      throw Error("offline");
    }),
  );
  assert.equal(await sharedRead("fail", load), 3);
});
test("public content does not refetch after hydration and repeated cards do not prefetch", async () => {
  const home = await read("../components/HomePage.tsx");
  assert.doesNotMatch(
    home,
    /useEffect|listJobsWithMeta|listCompanies|"use client"/,
  );
  const page = await read("../app/page.tsx");
  assert.match(page, /await getHome\(\)/);
  for (const path of [
    "../components/JobCard.tsx",
    "../components/CompanyDirectory.tsx",
  ])
    assert.match(await read(path), /prefetch=\{false\}/);
  assert.match(await read("../components/CompanyDirectory.tsx"), /limit: ?50/);
});
test("member cards share saved state and cancellable reads; checkout is on demand", async () => {
  for (const path of [
    "../components/SaveJobButton.tsx",
    "../components/RelatedJobs.tsx",
    "../components/JobBrowser.tsx",
    "../app/dashboard/page.tsx",
  ])
    assert.match(await read(path), /useSavedJobs/);
  const panel = await read("../components/RecommendationPanel.tsx");
  assert.match(panel, /controller.signal/);
  assert.match(panel, /controller.abort\(\)/);
  const billing = await read("../app/billing/page.tsx");
  assert.match(billing, /await loadCheckout\(\)/);
  assert.doesNotMatch(billing, /<Script/);
  assert.match(await read("../lib/auth.ts"), /refreshing \|\|=/);
});
test("saved state merges in-flight reads, deduplicates mutations and isolates accounts", async () => {
  const originalWindow = globalThis.window;
  let resolveRead,
    reads = 0,
    saves = 0;
  const listeners = new Map();
  globalThis.window = {
    addEventListener: (name, fn) => listeners.set(name, fn),
    removeEventListener: () => {},
  };
  globalThis.__savedFixture = {
    effect: (fn) => fn(),
    snapshot: (_subscribe, getSnapshot) => getSnapshot(),
    read: () => {
      reads++;
      return new Promise((resolve) => {
        resolveRead = resolve;
      });
    },
    save: async () => {
      saves++;
    },
    unsave: async () => {},
  };
  const output = ts
    .transpileModule(await read("../lib/saved-store.ts"), {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
      },
    })
    .outputText.replace(
      /import .*from ["']react["'];/,
      "const {effect:useEffect,snapshot:useSyncExternalStore} = globalThis.__savedFixture;",
    )
    .replace(
      /import .*from ["']\.\/auth["'];/,
      "const {read:savedIds,save:saveJob,unsave:unsaveJob} = globalThis.__savedFixture;",
    );
  const store = await import(
    `data:text/javascript;base64,${Buffer.from(output).toString("base64")}`
  );
  try {
    store.useSavedJobs("first");
    store.useSavedJobs("first");
    assert.equal(reads, 1);
    await Promise.all([
      store.toggleSaved("new", true),
      store.toggleSaved("new", true),
    ]);
    assert.equal(saves, 1);
    resolveRead(["existing"]);
    await new Promise((resolve) => setImmediate(resolve));
    assert.deepEqual(store.useSavedJobs("first").sort(), ["existing", "new"]);
    store.useSavedJobs("second");
    store.resetSaved();
    resolveRead(["private-second"]);
    await new Promise((resolve) => setImmediate(resolve));
    assert.deepEqual(store.useSavedJobs(), []);
  } finally {
    globalThis.window = originalWindow;
    delete globalThis.__savedFixture;
  }
});
