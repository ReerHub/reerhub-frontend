import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { ESLint } from "eslint";
import { mkdtemp, mkdir, writeFile, rm, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";

const require = createRequire(import.meta.url);
const pluginPath = require.resolve("@next/eslint-plugin-next");
const pluginRequire = createRequire(pluginPath);
const { getRootDirs } = require(
  join(dirname(pluginPath), "utils/get-root-dirs.js"),
);

test("Next lint root discovery retains directory glob support without braces", async () => {
  const root = await mkdtemp(join(tmpdir(), "reerhub-lint-"));
  try {
    await mkdir(join(root, "apps", "one"), { recursive: true });
    await mkdir(join(root, "apps", "two"), { recursive: true });
    await writeFile(join(root, "apps", "not-a-directory.txt"), "fixture");
    await mkdir(join(root, "apps", "one", "pages"));
    await writeFile(
      join(root, "apps", "one", "pages", "index.js"),
      "export default function Page() { return null; }",
    );
    assert.deepEqual(getRootDirs({ cwd: root, settings: {} }), [root]);
    const pattern = join(root, "apps", "*").replaceAll("\\", "/");
    const expected = [join(root, "apps", "one"), join(root, "apps", "two")];
    const normalize = (paths) => paths.map((path) => resolve(path)).sort();
    assert.deepEqual(
      normalize(
        getRootDirs({ cwd: root, settings: { next: { rootDir: pattern } } }),
      ),
      expected.sort(),
    );
    assert.deepEqual(
      normalize(
        getRootDirs({ cwd: root, settings: { next: { rootDir: [pattern] } } }),
      ),
      expected.sort(),
    );
    assert.deepEqual(
      getRootDirs({
        cwd: root,
        settings: { next: { rootDir: join(root, "missing", "*") } },
      }),
      [],
    );
    assert.equal(pluginRequire("fast-glob/package.json").name, "tinyglobby");
    const eslint = new ESLint({
      overrideConfig: { settings: { next: { rootDir: pattern } } },
    });
    const [result] = await eslint.lintText(
      'export default function Page() { return <a href="/">Home</a>; }',
      { filePath: "app/lint-fixture.tsx" },
    );
    assert.ok(
      result.messages.some(
        (message) => message.ruleId === "@next/next/no-html-link-for-pages",
      ),
      "internal-link rule remains enabled and discovers routes via rootDir glob",
    );
    const lock = JSON.parse(
      await readFile(new URL("../package-lock.json", import.meta.url), "utf8"),
    );
    assert.ok(
      !Object.keys(lock.packages).some((path) =>
        /node_modules\/(braces|micromatch)$/.test(path),
      ),
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
