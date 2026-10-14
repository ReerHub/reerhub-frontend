import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createElement, act } from "react";
import { createRoot } from "react-dom/client";
import { JSDOM } from "jsdom";
import { compileFixture } from "./location-fixtures.mjs";
const read = (name) => readFile(new URL("../" + name, import.meta.url), "utf8");

test("contact form preserves failed messages and only clears after confirmed receipt", async () => {
  const dom = new JSDOM('<div id="root"></div>', {
    url: "http://localhost/contact",
  });
  const previous = new Map();
  for (const [key, value] of Object.entries({
    window: dom.window,
    document: dom.window.document,
    FormData: dom.window.FormData,
    IS_REACT_ACT_ENVIRONMENT: true,
  })) {
    previous.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, {
      value,
      configurable: true,
      writable: true,
    });
  }
  let source = await read("components/ContactForm.tsx");
  source = source
    .replace(
      /import Link from[^;]+;/,
      "const Link=({children,...props})=><a {...props}>{children}</a>;",
    )
    .replace(
      /import \{ useAuth \} from[^;]+;/,
      "const useAuth=()=>({loading:false});",
    )
    .replace(
      /import \{ submitContact \} from[^;]+;/,
      'const submitContact=async body=> { if(body.message.includes("fail")) throw new Error("Service unavailable"); return {received:true}; };',
    )
    .replace(
      /import styles from[^;]+;/,
      "const styles=new Proxy({}, {get:(_,k)=>k});",
    );
  const { default: ContactForm } = await import(compileFixture(source));
  const root = createRoot(document.getElementById("root"));
  try {
    await act(async () => root.render(createElement(ContactForm)));
    const form = document.querySelector("form");
    form.elements.namedItem("name").value = "Local QA";
    form.elements.namedItem("email").value = "qa@example.com";
    form.elements.namedItem("topic").value = "listing";
    form.elements.namedItem("message").value =
      "Please fail this synthetic message.";
    await act(async () =>
      form.dispatchEvent(
        new dom.window.Event("submit", { bubbles: true, cancelable: true }),
      ),
    );
    assert.match(
      document.querySelector('[role="alert"]').textContent,
      /Service unavailable/,
    );
    assert.equal(
      form.elements.namedItem("message").value,
      "Please fail this synthetic message.",
    );
    assert.equal(document.querySelector('[role="status"]'), null);
    form.elements.namedItem("message").value =
      "This is a successful synthetic message.";
    await act(async () =>
      form.dispatchEvent(
        new dom.window.Event("submit", { bubbles: true, cancelable: true }),
      ),
    );
    assert.match(
      document.querySelector('[role="status"]').textContent,
      /Message received/,
    );
    assert.equal(form.elements.namedItem("message").value, "");
    assert.equal(form.elements.namedItem("website").tabIndex, -1);
    assert.equal(document.querySelector("button").disabled, false);
  } finally {
    await act(async () => root.unmount());
    for (const [key, descriptor] of previous)
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    dom.window.close();
  }
});

test("public pricing uses real plan controls; legal sections have matching stable anchors", async () => {
  const pricing = await read("components/pages/PublicPricing.tsx");
  assert.match(pricing, /<BillingControls/);
  assert.match(pricing, /non-refundable/);
  assert.doesNotMatch(pricing, /Most popular|99\.9|Enterprise|yearly/i);
  for (const path of ["app/terms/page.tsx", "app/privacy/page.tsx"]) {
    const source = await read(path);
    assert.match(source, /<LegalDocument/);
    const ids = [...source.matchAll(/<section id="([^"]+)"/g)].map((m) => m[1]);
    assert.equal(new Set(ids).size, ids.length);
    for (const id of ids) assert.match(source, new RegExp(`id: "${id}"`));
  }
  assert.match(await read("app/privacy/page.tsx"), /180 days/);
  assert.match(await read("components/Navbar.jsx"), /"Pricing"/);
});

test("three blog guides render complete article text and truthful organization schema without JavaScript", async () => {
  const catalogUrl = compileFixture(await read("lib/blog-catalog.ts"));
  const blogUrl = compileFixture(
    (await read("lib/blog.ts")).replace(
      '"./blog-catalog"',
      JSON.stringify(catalogUrl),
    ),
  );
  const { BLOG_POSTS, getBlogPost, blogReadMinutes } = await import(blogUrl);
  const seoUrl = compileFixture(await read("lib/seo.ts"));
  const code = (await read("components/pages/BlogContent.tsx"))
    .replace(
      /import Link from[^;]+;/,
      "const Link=({children,...props})=><a {...props}>{children}</a>;",
    )
    .replace('"@/lib/blog"', JSON.stringify(blogUrl))
    .replace('"@/lib/seo"', JSON.stringify(seoUrl))
    .replace(
      /import styles from[^;]+;/,
      "const styles=new Proxy({}, {get:(_,k)=>k});",
    );
  const { BlogArticleContent, BlogIndexContent } = await import(
    compileFixture(code)
  );
  const { renderToStaticMarkup } = await import("react-dom/server");
  assert.equal(BLOG_POSTS.length, 3);
  assert.equal(new Set(BLOG_POSTS.map((post) => post.slug)).size, 3);
  assert.equal(getBlogPost("missing-post"), undefined);
  const index = new JSDOM(renderToStaticMarkup(createElement(BlogIndexContent)))
    .window.document;
  assert.equal(index.querySelectorAll("h1").length, 1);
  for (const post of BLOG_POSTS) {
    assert.ok(index.querySelector(`a[href="/blog/${post.slug}"]`));
    assert.ok(blogReadMinutes(post) >= 3);
    const doc = new JSDOM(
      renderToStaticMarkup(createElement(BlogArticleContent, { post })),
    ).window.document;
    assert.equal(doc.querySelectorAll("h1").length, 1);
    for (const section of post.sections)
      for (const paragraph of section.paragraphs)
        assert.ok(doc.body.textContent.includes(paragraph));
    const schema = JSON.parse(
      doc.querySelector('script[type="application/ld+json"]').textContent,
    );
    assert.equal(schema["@type"], "BlogPosting");
    assert.equal(schema.author["@type"], "Organization");
    assert.equal(schema.author.name, "REERHUB TECHNOLOGIES");
    assert.equal(schema.headline, post.title);
    assert.ok(schema.articleBody.includes(post.intro));
    const member = new JSDOM(
      renderToStaticMarkup(
        createElement(BlogArticleContent, { post, memberView: true }),
      ),
    ).window.document;
    assert.equal(
      member.querySelector('script[type="application/ld+json"]'),
      null,
    );
  }
});
