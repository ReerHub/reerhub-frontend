import test from "node:test";
import assert from "node:assert/strict";
import {
  blankDocument,
  exampleDocument,
  safeLink,
  resumeFacts,
} from "../../lib/resume/document";
import { parseDraft, documentSchema } from "../../lib/resume/validation";
test("all examples validate and remain separate from blank documents", () => {
  for (const kind of ["student", "career-change", "experienced"] as const) {
    const example = exampleDocument(kind);
    assert.equal(documentSchema.safeParse(example).success, true);
    assert.match(resumeFacts(example), /TypeScript/);
  }
  assert.equal(blankDocument().contact.name, "");
});
test("device drafts validate schema and bounds before restoration", () => {
  const valid = { title: "Resume", document: blankDocument(), example: false };
  assert.deepEqual(parseDraft(valid), valid);
  assert.equal(
    parseDraft({ ...valid, document: { ...valid.document, schemaVersion: 2 } }),
    null,
  );
  assert.equal(parseDraft({ title: "broken" }), null);
});
test("links allow only explicit HTTP and HTTPS and AI facts exclude structured contacts", () => {
  assert.equal(safeLink("javascript:alert(1)"), undefined);
  assert.equal(safeLink("//example.com"), undefined);
  assert.equal(safeLink("https://example.com"), "https://example.com/");
  const doc = exampleDocument("student");
  assert.ok(!resumeFacts(doc).includes(doc.contact.email));
});

test("early v1 device drafts retain the example label during migration", () => {
  const document = exampleDocument("student");
  const { example, ...early } = document;
  assert.equal(example, true);
  const result = parseDraft({
    title: "Example",
    example: true,
    document: early,
  });
  assert.equal(result?.document.example, true);
  assert.equal(result?.example, true);
});

test("unfinished device titles, headings and URLs survive reload without weakening cloud validation", () => {
  const document = blankDocument();
  document.contact.website = "https:/";
  document.sections[0].heading = "";
  const draft = { title: "", document, example: false };
  assert.deepEqual(parseDraft(draft), draft);
  assert.equal(documentSchema.safeParse(document).success, false);
});
