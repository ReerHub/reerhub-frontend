import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import ts from "typescript";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { JSDOM } from "jsdom";

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

test("legacy profiles do not invent saved broad preferences", () => {
  const legacy = {
    ...user,
    profile: {
      techTrack: "software",
      skills: ["React", "Node.js", "Python"],
      experienceYears: 5,
    },
  };
  const draft = draftFromUser(legacy);
  const baseline = profilePayload(draft);
  assert.equal(draft.rolePreference, undefined);
  assert.equal(draft.locationPreference, undefined);
  assert.equal(
    profileSignals({ ...draft, experienceYears: 5 }).filter((s) => s.complete)
      .length,
    3,
  );
  assert.deepEqual(profileErrors(draft), {}); // Incomplete saves remain allowed.
  const incomplete = JSON.parse(JSON.stringify(baseline));
  assert.ok(!Object.hasOwn(incomplete, "rolePreference"));
  assert.ok(!Object.hasOwn(incomplete, "locationPreference"));
  draft.rolePreference = "any";
  draft.locationPreference = "all-india";
  assert.notDeepEqual(profilePayload(draft), baseline); // Explicit choices enable Save.
  assert.ok(
    profileSignals({ ...draft, experienceYears: 5 }).every((s) => s.complete),
  );
  const reloaded = draftFromUser({ ...legacy, profile: profilePayload(draft) });
  assert.deepEqual(profilePayload(reloaded), profilePayload(draft));
  assert.deepEqual(profilePayload(draftFromUser(legacy)), baseline); // Discard restores missing choices.
});

test("legacy editor requires explicit preferences, supports discard and failed-save retry", async () => {
  const dom = new JSDOM('<div id="root"></div>', {
    url: "http://profile.localhost/profile",
  });
  const previous = new Map();
  for (const [key, value] of Object.entries({
    window: dom.window,
    document: dom.window.document,
    navigator: dom.window.navigator,
    HTMLElement: dom.window.HTMLElement,
    IS_REACT_ACT_ENVIRONMENT: true,
  })) {
    previous.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, {
      value,
      configurable: true,
      writable: true,
    });
  }
  dom.window.HTMLDialogElement.prototype.close = function () {};
  dom.window.HTMLDialogElement.prototype.showModal = function () {};
  const legacy = {
    ...user,
    profile: {
      techTrack: "software",
      skills: ["React", "Node.js", "Python"],
      experienceYears: 5,
    },
    membership: { isPro: true },
  };
  let calls = 0,
    fail = true,
    savedUser;
  globalThis.__profileTest = {
    draftFromUser,
    profileErrors,
    profilePayload,
    profileSignals,
    readProfileOptions: async () => ({
      tracks: [
        {
          value: "software",
          label: "Software",
          roles: [],
          suggestedSkills: [],
        },
      ],
      skills: options,
      cities: [],
    }),
    updateMe: async (payload) => {
      calls++;
      if (fail) throw new Error("Fixture save failed");
      savedUser = { ...legacy, profile: payload };
      return savedUser;
    },
  };
  let source = await readFile(
    new URL("../components/ProfileEditor.tsx", import.meta.url),
    "utf8",
  );
  source = source
    .replace(
      /import \{ useRouter \} from "next\/navigation";/,
      "const useRouter = () => ({push() {}});",
    )
    .replace(
      /import Link from "next\/link";/,
      "const Link = ({children}) => children;",
    )
    .replace(
      /import toast from "react-hot-toast";/,
      "const toast = {success() {}};",
    )
    .replace(
      /import Icon from "@\/components\/ui\/Icon";/,
      "const Icon = () => null;",
    )
    .replace(
      /import \{ useAuth \} from "@\/components\/AuthProvider";/,
      "const useAuth = () => ({refresh: async () => {}});",
    )
    .replace(
      /import \{ updateMe, type AuthUser \} from "@\/lib\/auth";/,
      "const {updateMe} = globalThis.__profileTest;",
    )
    .replace(
      /import \{ readProfileOptions \} from "@\/lib\/profile-options";/,
      "const {readProfileOptions} = globalThis.__profileTest;",
    )
    .replace(
      /import ProfileOptionPicker from "@\/components\/ProfileOptionPicker";/,
      "const ProfileOptionPicker = () => null;",
    )
    .replace(
      /import \{ profileSignals \} from "@\/lib\/profile-readiness";/,
      "const {profileSignals} = globalThis.__profileTest;",
    )
    .replace(
      /import \{\s*draftFromUser,[\s\S]*?\} from "@\/lib\/profile-editor";/,
      "const {draftFromUser, profileErrors, profilePayload} = globalThis.__profileTest;",
    )
    .replace(
      /import ProfileSettings from "@\/components\/ProfileSettings";/,
      "const ProfileSettings = () => null;",
    )
    .replace(
      /import styles from "@\/app\/profile\/Profile.module.css";/,
      "const styles = {};",
    );
  let compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;
  const require = createRequire(import.meta.url);
  for (const name of ["react", "react/jsx-runtime"])
    compiled = compiled.replaceAll(
      `from "${name}"`,
      `from "${pathToFileURL(require.resolve(name)).href}"`,
    );
  const { default: Component } = await import(
    `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`
  );
  const { createElement, act } = await import("react");
  const { createRoot } = await import("react-dom/client");
  const root = createRoot(document.getElementById("root"));
  const settle = () => new Promise((resolve) => setTimeout(resolve, 10));
  const button = (text) =>
    Array.from(document.querySelectorAll("button")).find(
      (e) => e.textContent === text,
    );
  const broad = () => {
    document.getElementById("pf-roles").click();
    document.getElementById("pf-cities").click();
  };
  try {
    await act(async () => {
      root.render(createElement(Component, { user: legacy }));
      await settle();
    });
    assert.equal(
      document
        .querySelector('[role="progressbar"]')
        .getAttribute("aria-valuenow"),
      "3",
    );
    assert.equal(
      document.querySelectorAll('input[name="role-preference"]:checked').length,
      0,
    );
    assert.equal(
      document.querySelectorAll('input[name="location-preference"]:checked')
        .length,
      0,
    );
    assert.ok(button("Save changes").disabled);
    await act(async () => {
      broad();
    });
    assert.ok(!button("Save changes").disabled);
    await act(async () => button("Discard changes").click());
    assert.equal(
      document
        .querySelector('[role="progressbar"]')
        .getAttribute("aria-valuenow"),
      "3",
    );
    assert.ok(button("Save changes").disabled);
    await act(async () => {
      broad();
    });
    await act(async () => {
      button("Save changes").click();
      await settle();
    });
    assert.match(document.body.textContent, /Fixture save failed/);
    assert.ok(document.getElementById("pf-roles").checked);
    assert.ok(!button("Save changes").disabled);
    fail = false;
    await act(async () => {
      button("Save changes").click();
      await settle();
    });
    assert.equal(calls, 2);
    assert.ok(button("Save changes").disabled);
    assert.equal(savedUser.profile.rolePreference, "any");
    assert.equal(savedUser.profile.locationPreference, "all-india");
    await act(async () => {
      root.render(createElement(Component, { user: savedUser, key: "reload" }));
      await settle();
    });
    assert.equal(
      document
        .querySelector('[role="progressbar"]')
        .getAttribute("aria-valuenow"),
      "5",
    );
    assert.ok(button("Save changes").disabled);
  } finally {
    await act(async () => root.unmount());
    delete globalThis.__profileTest;
    for (const [key, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
    dom.window.close();
  }
});
