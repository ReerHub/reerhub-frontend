import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { JSDOM } from "jsdom";
import { compileFixture } from "./location-fixtures.mjs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const seoUrl = compileFixture(
  (await read("../lib/seo.ts")).replace(
    'process.env.SITE_URL || "http://localhost:3000"',
    '"https://reerhub.com"',
  ),
);
const plansUrl = compileFixture(await read("../lib/billing-plans.ts"));
const billingUrl = compileFixture(await read("../lib/billing-content.ts"));
const faqUrl = compileFixture(
  (await read("../lib/faq-content.ts"))
    .replace('"./seo"', JSON.stringify(seoUrl))
    .replace('"./billing-plans"', JSON.stringify(plansUrl))
    .replace('"./billing-content"', JSON.stringify(billingUrl)),
);
const faqs = await import(faqUrl);
const linkUrl = compileFixture(
  "export default function Link({children,...props}){return <a {...props}>{children}</a>}",
);
const headerUrl = compileFixture(
  "export default function Header({title,description}){return <header><h1>{title}</h1><p>{description}</p></header>}",
);
const controlStub = compileFixture(
  "export default function Controls(){return null}",
);
const page = await import(
  compileFixture(
    (await read("../components/pages/FaqContent.tsx"))
      .replace('"@/components/AppLink"', JSON.stringify(linkUrl))
      .replace('"@/components/PageHeader"', JSON.stringify(headerUrl))
      .replace('"@/components/FaqControls"', JSON.stringify(controlStub))
      .replace('"@/lib/faq-content"', JSON.stringify(faqUrl))
      .replace('"@/lib/seo"', JSON.stringify(seoUrl)),
  )
);

test("FAQ answers are complete server HTML, unique and exactly match public JSON-LD", () => {
  const dom = new JSDOM(renderToStaticMarkup(createElement(page.default)));
  const document = dom.window.document;
  assert.equal(document.querySelectorAll("h1").length, 1);
  assert.equal(document.querySelectorAll("details[data-faq]").length, 41);
  assert.equal(new Set(faqs.ALL_FAQS.map((item) => item.id)).size, 41);
  assert.equal(new Set(faqs.ALL_FAQS.map((item) => item.question)).size, 41);
  const schema = JSON.parse(
    document.querySelector('script[type="application/ld+json"]').textContent,
  );
  assert.equal(schema["@type"], "FAQPage");
  assert.equal(schema.url, "https://reerhub.com/faq");
  assert.equal(schema.mainEntity.length, 41);
  for (const [i, faq] of faqs.ALL_FAQS.entries()) {
    const detail = document.getElementById(faq.id);
    assert.equal(detail.querySelector("h3").textContent, faq.question);
    assert.equal(detail.querySelector("p").textContent, faq.answer);
    assert.equal(schema.mainEntity[i].acceptedAnswer.text, faq.answer);
    assert.equal(detail.querySelector("a").getAttribute("href"), "#" + faq.id);
  }
  const member = new JSDOM(
    renderToStaticMarkup(createElement(page.default, { memberView: true })),
  );
  assert.equal(member.window.document.querySelectorAll("details[data-faq]").length, 41);
  assert.equal(
    member.window.document.querySelectorAll(
      'script[type="application/ld+json"]',
    ).length,
    0,
  );
  dom.window.close();
  member.window.close();
});

test("FAQ controls progressively expand answers, restore question anchors and tolerate invalid hashes", async () => {
  const dom = new JSDOM(
    '<div id="root"></div><details data-faq id="one"><summary>Question</summary><p>Answer</p></details><details data-faq id="two"><summary>Other</summary><p>Answer</p></details>',
    { url: "https://reerhub.com/faq#one" },
  );
  const previous = new Map();
  for (const [key, value] of Object.entries({
    window: dom.window,
    document: dom.window.document,
    HTMLDetailsElement: dom.window.HTMLDetailsElement,
    IS_REACT_ACT_ENVIRONMENT: true,
  })) {
    previous.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, {
      value,
      writable: true,
      configurable: true,
    });
  }
  const { act } = await import("react");
  const { createRoot } = await import("react-dom/client");
  const { default: Controls } = await import(
    compileFixture(await read("../components/FaqControls.tsx"))
  );
  const root = createRoot(document.getElementById("root"));
  try {
    await act(async () => root.render(createElement(Controls)));
    assert.equal(document.getElementById("one").open, true);
    await act(async () => document.querySelector("button").click());
    assert.ok(
      [...document.querySelectorAll("details")].every((detail) => detail.open),
    );
    await act(async () => document.querySelectorAll("button")[1].click());
    assert.ok(
      [...document.querySelectorAll("details")].every((detail) => !detail.open),
    );
    window.location.hash = "%broken";
    window.dispatchEvent(new dom.window.HashChangeEvent("hashchange"));
  } finally {
    await act(async () => root.unmount());
    for (const [key, value] of previous) {
      if (value) Object.defineProperty(globalThis, key, value);
      else delete globalThis[key];
    }
    dom.window.close();
  }
});

test("FAQ routes retain public discovery and private workspace boundaries without duplicate schema", async () => {
  const workspace = await import(
    compileFixture(
      (await read("../lib/workspace.ts")).replace(
        '"./seo-landings"',
        JSON.stringify(compileFixture(await read("../lib/seo-landings.ts"))),
      ),
    )
  );
  assert.equal(
    workspace.memberHref("/faq#cancel-renewal"),
    "/dashboard/faq#cancel-renewal",
  );
  assert.match(await read("../lib/sitemap.ts"), /"faq"/);
  assert.doesNotMatch(
    await read("../components/HomePage.tsx"),
    /ANSWERS|home-answers/,
  );
  for (const file of [
    "../components/pages/BillingContent.tsx",
    "../components/pages/JobDetailContent.tsx",
  ])
    assert.doesNotMatch(await read(file), /FAQPage/);
  assert.doesNotMatch(await read("../app/layout.tsx"), /fallback=\{children\}/);
  const seo = await import(seoUrl);
  const meta = seo.workspaceMetadata(
    "Profile & preferences",
    "Manage your private profile.",
  );
  assert.deepEqual(meta.robots, { index: false, follow: false });
  assert.equal(meta.alternates.canonical, null);
  const landing = await import(
    compileFixture(await read("../lib/seo-landings.ts"))
  );
  for (const value of Object.values(landing.JOB_LANDINGS)) {
    assert.ok(value.description.length <= 155);
    assert.match(value.description, /[.!]$/);
    assert.ok(!value.description.includes("…"));
  }
});
