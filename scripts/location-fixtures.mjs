import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import ts from "typescript";
const require = createRequire(import.meta.url);
export const compileFixture = (source) => {
  let code = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;
  for (const name of ["react", "react/jsx-runtime"])
    code = code.replaceAll(
      `from "${name}"`,
      `from "${pathToFileURL(require.resolve(name)).href}"`,
    );
  return `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`;
};
export const scopeUrl = compileFixture(
  await readFile(new URL("../lib/location-scope.ts", import.meta.url), "utf8"),
);
export const scopeControlUrl = compileFixture(
  (
    await readFile(
      new URL("../components/LocationScopeControl.tsx", import.meta.url),
      "utf8",
    )
  ).replace('"@/lib/location-scope"', JSON.stringify(scopeUrl)),
);
