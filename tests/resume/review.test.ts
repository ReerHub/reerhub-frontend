import test from "node:test";
import assert from "node:assert/strict";
import { blankDocument, newEntry } from "../../lib/resume/document";
import {
  compareJobKeywords,
  exportedContent,
  reviewResume,
} from "../../lib/resume/review";

test("project evidence counts without inventing employment or numerical results", () => {
  const doc = blankDocument();
  const projects = doc.sections.find((section) => section.type === "projects")!;
  projects.items = [
    {
      ...newEntry(),
      title: "Accessible portfolio",
      bullets: ["Built a keyboard-accessible portfolio using React."],
    },
  ];
  assert.ok(!reviewResume(doc).some((finding) => finding.id === "evidence"));
  assert.ok(
    !reviewResume(doc).some((finding) =>
      /metric|number|percent/i.test(finding.title),
    ),
  );
  projects.visible = false;
  assert.ok(reviewResume(doc).some((finding) => finding.id === "evidence"));
});

test("review flags unfinished samples, missing context, repeated and long bullets", () => {
  const doc = blankDocument();
  doc.example = true;
  doc.sections[1].items = [
    {
      ...newEntry(),
      bullets: [
        "Built a service.",
        " Built a service. ",
        Array(46).fill("word").join(" "),
      ],
    },
  ];
  const findings = reviewResume(doc);
  for (const prefix of [
    "name",
    "contact",
    "example",
    "title-",
    "dates-",
    "repeat-",
    "long-",
  ])
    assert.ok(
      findings.some((finding) => finding.id.startsWith(prefix)),
      prefix,
    );
  assert.equal(doc.sections[1].items[0].title, "");
});

test("keyword comparison respects aliases and punctuation token boundaries", () => {
  const doc = blankDocument();
  doc.sections[4].text = "C++, C#, NodeJS, React.js, PostgreSQL and JavaScript";
  const result = compareJobKeywords(
    doc,
    "C++ C# Node.js React PostgreSQL Java JavaScript Git Rust",
  );
  assert.deepEqual(result.included, [
    "JavaScript",
    "React",
    "Node.js",
    "C++",
    "C#",
    "PostgreSQL",
  ]);
  assert.deepEqual(result.notMentioned, ["Java", "Rust", "Git"]);
  assert.equal(
    compareJobKeywords(doc, "Trust digital reactivate csharpness").included
      .length,
    0,
  );
});

test("comparison excludes hidden sections, contact fields and headings", () => {
  const doc = blankDocument();
  doc.contact.name = "Rust Java";
  doc.contact.headline = "React engineer";
  doc.sections[0].heading = "Python";
  doc.sections[0].text = "AWS";
  doc.sections[0].visible = false;
  doc.sections[4].text = "TypeScript";
  assert.equal(exportedContent(doc).includes("AWS"), false);
  const result = compareJobKeywords(
    doc,
    "Rust Java React Python AWS TypeScript",
  );
  assert.deepEqual(result.included, ["TypeScript"]);
  assert.deepEqual(result.notMentioned, [
    "React",
    "Python",
    "Java",
    "Rust",
    "AWS",
  ]);
});
