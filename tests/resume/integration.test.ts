import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import postcss, { type Node } from "postcss";
import {
  publicMetadata,
  applicationSchema,
  faqSchema,
  RESUME_FAQS,
  SITE,
  PARENT,
  breadcrumb,
  safeJsonLd,
} from "../../lib/resume/seo";
import {
  isPublicAnalyticsPath,
  isPublicAnalyticsUrl,
} from "../../lib/public-analytics";

const source = (path: string) =>
  readFile(new URL(`../../${path}`, import.meta.url), "utf8");

test("public resume metadata uses same-origin canonical and share-image routes", () => {
  for (const path of ["/", "/templates", "/privacy"]) {
    const metadata = publicMetadata("Resume page", "Page description", path);
    const expected = `/resume${path === "/" ? "" : path}`;
    assert.equal(metadata.alternates?.canonical, expected);
    assert.equal(metadata.openGraph?.url, expected);
    for (const social of [metadata.openGraph, metadata.twitter]) {
      assert.deepEqual(social?.images, [
        {
          url: "/resume/share-image",
          width: 1200,
          height: 630,
          alt: "REERHUB Resume Builder — Your experience, beautifully presented",
        },
      ]);
    }
  }
});

test("resume structured data shares canonical URLs and the displayed FAQ source", async () => {
  assert.equal(SITE, `${PARENT}/resume`);
  assert.equal(applicationSchema.url, SITE);
  assert.equal(applicationSchema.publisher.url, PARENT);
  assert.equal(applicationSchema["@id"], `${SITE}/#application`);
  const trail = breadcrumb("Templates", "/templates").itemListElement;
  assert.equal(trail[0].item, SITE);
  assert.equal(trail[1].item, `${SITE}/templates`);
  assert.deepEqual(
    faqSchema.mainEntity.map((entry) => ({
      question: entry.name,
      answer: entry.acceptedAnswer.text,
    })),
    RESUME_FAQS,
  );
  const home = await source("app/resume/page.tsx");
  assert.match(home, /RESUME_FAQS\.map/);
  assert.match(home, /safeJsonLd\(\[/);
  assert.match(home, /applicationSchema/);
  assert.match(home, /faqSchema/);
  assert.equal(safeJsonLd({ text: "</script>" }).includes("<"), false);
});

test("editor and library explicitly stay private without a public canonical", async () => {
  for (const path of ["editor", "library"]) {
    const page = await source(`app/resume/${path}/page.tsx`);
    assert.match(page, /robots:\s*\{\s*index:\s*false,\s*follow:\s*false\s*\}/);
    assert.doesNotMatch(page, /publicMetadata|canonical:\s*["'`]/);
  }
  const layout = await source("app/resume/layout.tsx");
  assert.doesNotMatch(layout, /canonical|publicMetadata/);
});

test("legacy resume entry routes redirect only to same-origin integrated destinations", async () => {
  for (const [route, destination] of [
    ["resume-builder", "/resume/editor"],
    ["resume-builder-library", "/resume/library"],
  ]) {
    const { default: entry } = await import(`../../app/${route}/page.tsx`);
    assert.throws(
      () => entry(),
      (error: unknown) => {
        assert.equal(typeof error, "object");
        const digest = (error as { digest: string }).digest;
        assert.match(digest, /^NEXT_REDIRECT;/);
        assert.ok(digest.includes(`;${destination};`));
        assert.equal(digest.includes("https://"), false);
        return true;
      },
    );
  }
});

test("all resume pages are excluded from the general analytics allowlist", () => {
  for (const path of [
    "/resume",
    "/resume/templates",
    "/resume/privacy",
    "/resume/editor",
    "/resume/library",
    "/resume-builder",
    "/resume-builder-library",
  ]) {
    assert.equal(isPublicAnalyticsPath(path), false, path);
    assert.equal(
      isPublicAnalyticsUrl(new URL(`${PARENT}${path}?id=private-draft`)),
      false,
      path,
    );
  }
  assert.equal(isPublicAnalyticsPath("/"), true);
});

test("resume CSS cannot reset or style the surrounding Jobs application", async () => {
  const css = postcss.parse(await source("app/resume/resume.css"));
  let scopedRules = 0;
  css.walkRules((rule) => {
    for (
      let parent: Node | undefined = rule.parent;
      parent;
      parent = parent.parent
    ) {
      if (
        parent.type === "atrule" &&
        "name" in parent &&
        typeof parent.name === "string" &&
        /keyframes$/i.test(parent.name)
      )
        return;
    }
    for (const selector of rule.selectors) {
      assert.match(
        selector.trim(),
        /^\.resume-app(?:\b|[\s.:#[>+~])/,
        selector,
      );
      scopedRules++;
    }
  });
  assert.ok(scopedRules > 100, "exercise the complete scoped stylesheet");
});
