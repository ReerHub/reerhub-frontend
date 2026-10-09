import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";
const source = await readFile(
  new URL("../lib/admin-operations.ts", import.meta.url),
  "utf8",
);
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const { operationsToday, operationsTime, operationLabel } = await import(
  `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`
);
test("operations dates and displayed timestamps use IST regardless of host timezone", () => {
  assert.equal(operationsToday(new Date("2026-10-08T18:29:59Z")), "2026-10-08");
  assert.equal(operationsToday(new Date("2026-10-08T18:30:00Z")), "2026-10-09");
  assert.match(operationsTime("2026-10-08T18:30:00Z"), /9 Oct 2026/);
  assert.equal(operationsTime(), "Not recorded");
});
test("SMTP status and skip reasons use truthful operator labels", () => {
  assert.equal(operationLabel("delivered"), "SMTP accepted");
  assert.equal(operationLabel("incompleteProfile"), "Incomplete profile");
  assert.equal(operationLabel("created"), "Added");
});
test("operations lives behind admin helpers, ignores stale responses and provides bounded pages", async () => {
  const component = await readFile(
    new URL("../components/AdminOperations.tsx", import.meta.url),
    "utf8",
  );
  assert.match(component, /getAdminPage<OperationsRow>/);
  assert.match(component, /active = false/);
  assert.match(component, /limit: "25"/);
  assert.match(component, /Historical skip reasons cannot be reconstructed/);
  assert.doesNotMatch(component, /writeAdmin|dangerouslySetInnerHTML/);
});
