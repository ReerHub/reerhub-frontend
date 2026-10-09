import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import ts from "typescript";

async function load(path) {
  const source = await readFile(new URL(path, import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  return import(
    `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`
  );
}
const {
  searchOptions,
  selectOption,
  draftFromUser,
  profileErrors,
  profilePayload,
} = await load("../lib/profile-editor.ts");
const { profileSignals } = await load("../lib/profile-readiness.ts");
const options = [
  { value: "React", label: "React", aliases: ["React.js", "reactjs"] },
  { value: "Node.js", label: "Node.js", aliases: ["nodejs"] },
  { value: "React Native", label: "React Native", aliases: [] },
];
const user = {
  name: "Asha",
  profile: {
    techTrack: "software",
    rolePreference: "selected",
    techRoles: ["Backend Engineer"],
    skills: ["React"],
    experienceYears: 0,
    locationPreference: "selected",
    targetLocations: ["Bengaluru"],
    remoteType: "hybrid",
  },
};
test("search supports aliases without committing free text", () => {
  assert.equal(searchOptions(options, "react.js")[0].value, "React");
  assert.equal(searchOptions(options, "NODEJS")[0].value, "Node.js");
  assert.equal(searchOptions(options, "unlisted").length, 0);
  assert.deepEqual(selectOption([], "reactjs", options, 10).values, ["React"]);
  assert.deepEqual(selectOption(["React"], "React.js", options, 10).values, [
    "React",
  ]);
  assert.ok(selectOption([], "unlisted", options, 10).error);
});
test("selections enforce limits without replacing existing items", () => {
  assert.ok(selectOption(["React"], "Node.js", options, 1).error);
  assert.equal(selectOption(["React"], "Node.js", options, 2).values.length, 2);
  assert.equal(
    selectOption(["React"], "React Native", options, 2).values.length,
    2,
  );
});
test("payload supports incomplete saves, clearing and fractional experience", () => {
  const draft = draftFromUser(user);
  assert.equal(profilePayload(draft).experienceYears, 0);
  draft.experienceYears = "2.5";
  assert.equal(profilePayload(draft).experienceYears, 2.5);
  draft.experienceYears = "";
  draft.techTrack = "";
  draft.techRoles = [];
  draft.skills = [];
  draft.targetLocations = [];
  assert.deepEqual(profileErrors(draft), {});
  assert.equal(profilePayload(draft).experienceYears, null);
  assert.equal(profilePayload(draft).techTrack, null);
  assert.deepEqual(profilePayload(draft).techRoles, []);
  assert.ok(!Object.hasOwn(profilePayload(draft), "currentRole"));
  assert.ok(!Object.hasOwn(profilePayload(draft), "city"));
});
test("broad choices clear specific selections and array ordering is not a change", () => {
  const draft = draftFromUser(user);
  draft.rolePreference = "any";
  draft.locationPreference = "all-india";
  assert.deepEqual(profilePayload(draft).techRoles, []);
  assert.deepEqual(profilePayload(draft).targetLocations, []);
  draft.skills = ["React", "Node.js"];
  const baseline = profilePayload(draft);
  draft.skills.reverse();
  draft.name = " Asha ";
  assert.deepEqual(profilePayload(draft), baseline);
});
test("picker styles isolate native choices from full-width text fields", async () => {
  const css = await readFile(
    new URL("../app/profile/Profile.module.css", import.meta.url),
    "utf8",
  );
  assert.match(css, /input:not\(\[type="checkbox"\]\):not\(\[type="radio"\]\)/);
  assert.match(css, /\.field > label/);
  assert.match(css, /\.optionPanel\s*\{[^}]*position: absolute/s);
  assert.match(css, /\.optionList input\s*\{[^}]*width: 16px/s);
  assert.match(css, /\.optionList\s*\{[^}]*max-height: 216px/s);
});
test("validation and readiness reflect explicit broad preferences", () => {
  const draft = draftFromUser(user);
  draft.name = " ";
  draft.experienceYears = "-1";
  assert.ok(profileErrors(draft).name);
  assert.ok(profileErrors(draft).experienceYears);
  const broad = {
    techTrack: "software",
    rolePreference: "any",
    skills: ["React", "Node.js", "Python"],
    experienceYears: 0,
    locationPreference: "all-india",
    remoteType: "unknown",
  };
  assert.ok(profileSignals(broad).every((signal) => signal.complete));
  assert.ok(!profileSignals({ ...broad, skills: [] })[2].complete);
});
