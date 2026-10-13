import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { JSDOM } from "jsdom";
import { compileFixture } from "./location-fixtures.mjs";
const source = (path) => readFile(new URL(path, import.meta.url), "utf8");
const consentUrl = compileFixture(await source("../lib/consent.ts"));
const eventsUrl = compileFixture(await source("../lib/analytics-events.ts"));
const consent = await import(consentUrl),
  events = await import(eventsUrl);
const analyticsSource = (await source("../lib/analytics.ts"))
  .replace('"./consent"', JSON.stringify(consentUrl))
  .replace('"./analytics-events"', JSON.stringify(eventsUrl));
const dom = new JSDOM('<div id="root"></div>', {
  url: "https://reerhub.com/verify-magic?token=sensitive&email=private@example.com",
});
const previous = new Map();
for (const [key, value] of Object.entries({
  window: dom.window,
  document: dom.window.document,
  sessionStorage: dom.window.sessionStorage,
  Event: dom.window.Event,
  IS_REACT_ACT_ENVIRONMENT: true,
})) {
  previous.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
  Object.defineProperty(globalThis, key, {
    value,
    configurable: true,
    writable: true,
  });
}
const analytics = await import(compileFixture(analyticsSource));

test("legacy necessary-cookie acceptance cannot escalate into analytics consent", () => {
  window.localStorage.setItem("reerhub-cookie-consent", "accepted");
  assert.equal(consent.analyticsConsent(), false);
  for (const value of [
    null,
    "accepted",
    '{"version":1,"analytics":true}',
    '{"version":2,"analytics":true}',
  ])
    assert.equal(consent.parseConsent(value).analytics, false);
  analytics.startAnalytics("G-SYNTHETIC1");
  assert.equal(document.querySelectorAll("iframe").length, 0);
});
test("consent gates all measurement, isolates the tag and removes it on withdrawal", () => {
  consent.saveConsent(true);
  analytics.startAnalytics("invalid");
  assert.equal(document.querySelectorAll("iframe").length, 0);
  analytics.startAnalytics("G-SYNTHETIC1");
  const frame = document.querySelector("iframe");
  assert.ok(frame);
  assert.equal(frame.getAttribute("sandbox"), "allow-scripts");
  assert.equal(frame.referrerPolicy, "no-referrer");
  const messages = [];
  frame.contentWindow.postMessage = (payload) => messages.push(payload);
  analytics.track(
    "trial_activation",
    {
      plan: "pro-monthly",
      email: "private@example.com",
      token: "private-token",
      profile: { skills: ["React"] },
      page_location: window.location.href,
    },
    "synthetic-trial",
  );
  analytics.analyticsReady({ source: window, data: "reerhub-analytics-ready" });
  assert.equal(messages.length, 0);
  analytics.analyticsReady({
    source: frame.contentWindow,
    data: "reerhub-analytics-ready",
  });
  assert.equal(messages.length, 1);
  assert.deepEqual(messages[0], {
    name: "trial_activation",
    params: { plan: "pro-monthly" },
  });
  analytics.track("trial_activation", {}, "synthetic-trial");
  assert.equal(messages.length, 1);
  consent.saveConsent(false);
  analytics.stopAnalytics();
  analytics.track("login", {});
  assert.equal(document.querySelectorAll("iframe").length, 0);
  assert.equal(messages.length, 1);
});
test("conversion deduplication survives reloading the client module", async () => {
  consent.saveConsent(true);
  const restarted = await import(
    compileFixture(analyticsSource + "\nexport const restartMarker = 1;")
  );
  restarted.startAnalytics("G-SYNTHETIC1");
  const frame = document.querySelector("iframe");
  const messages = [];
  frame.contentWindow.postMessage = (payload) => messages.push(payload);
  restarted.analyticsReady({
    source: frame.contentWindow,
    data: "reerhub-analytics-ready",
  });
  restarted.track("trial_activation", {}, "synthetic-trial");
  assert.equal(messages.length, 0);
  restarted.stopAnalytics();
  consent.saveConsent(false);
});
test("event allowlist discards private payloads and never forwards URLs", () => {
  assert.equal(events.safeAnalyticsEvent("private-event", {}), null);
  const value = events.safeAnalyticsEvent("first_verified_payment", {
    page_family: "pricing",
    plan: "pro-weekly",
    group: "qualified",
    email: "private@example.com",
    amount: 14900,
    card: "private",
    token: "private",
    page_location: "https://reerhub.com/?token=private",
  });
  assert.deepEqual(value.params, {
    page_family: "pricing",
    plan: "pro-weekly",
    group: "qualified",
  });
  assert.equal(events.pageFamily("/verify-magic"), "account");
  assert.equal(events.pageFamily("/jobs/role-abcdef"), "job-detail");
});
test("direct analytics-frame navigation cannot activate the tag", async () => {
  const route = await import(
    compileFixture(
      (await source("../app/analytics-frame/route.ts")).replace(
        '"@/lib/analytics-events"',
        JSON.stringify(eventsUrl),
      ),
    )
  );
  const prior = process.env.GA4_MEASUREMENT_ID;
  try {
    process.env.GA4_MEASUREMENT_ID = "G-SYNTHETIC1";
    assert.equal(
      (await route.GET(new Request("https://reerhub.com/analytics-frame")))
        .status,
      404,
    );
    const response = await route.GET(
      new Request("https://reerhub.com/analytics-frame", {
        headers: {
          "sec-fetch-dest": "iframe",
          "sec-fetch-site": "same-origin",
        },
      }),
    );
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow");
    assert.match(
      response.headers.get("content-security-policy"),
      /frame-ancestors 'self'/,
    );
    assert.match(await response.text(), /send_page_view:false/);
  } finally {
    if (prior === undefined) delete process.env.GA4_MEASUREMENT_ID;
    else process.env.GA4_MEASUREMENT_ID = prior;
  }
});
test.after(() => {
  analytics.stopAnalytics();
  for (const [key, descriptor] of previous) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor);
    else delete globalThis[key];
  }
  dom.window.close();
});

test("privacy UI supports rejection, explicit opt-in and withdrawal without legacy escalation", async () => {
  window.localStorage.removeItem(consent.CONSENT_KEY);
  let code = await source("../components/CookieConsent.tsx");
  code = code
    .replace('"@/lib/consent"', JSON.stringify(consentUrl))
    .replace(
      'import Link from "next/link";',
      "const Link=({children,href})=><a href={href}>{children}</a>;",
    );
  const { default: Component } = await import(compileFixture(code));
  const { createElement, act } = await import("react"),
    { createRoot } = await import("react-dom/client");
  const root = createRoot(document.getElementById("root"));
  try {
    await act(async () => root.render(createElement(Component, {analyticsAvailable:true})));
    assert.equal(consent.analyticsConsent(), false);
    const button = (text) =>
      [...document.querySelectorAll("button")].find(
        (b) => b.textContent === text,
      );
    await act(async () => button("Reject analytics").click());
    assert.equal(consent.analyticsConsent(), false);
    await act(async () => button("Privacy preferences").click());
    assert.equal(document.activeElement.tagName, "H2");
    let checkbox = document.querySelector('input[type="checkbox"]');
    assert.equal(checkbox.checked, false);
    await act(async () => checkbox.click());
    await act(async () => button("Close").click());
    assert.equal(consent.analyticsConsent(), false);
    await act(async () => button("Privacy preferences").click());
    checkbox = document.querySelector('input[type="checkbox"]');
    assert.equal(checkbox.checked, false);
    await act(async () => checkbox.click());
    await act(async () => button("Save preferences").click());
    assert.equal(consent.analyticsConsent(), true);
    await act(async () => button("Privacy preferences").click());
    await act(async () => button("Reject analytics").click());
    assert.equal(consent.analyticsConsent(), false);
    assert.equal(document.querySelectorAll("iframe").length, 0);
    assert.equal(document.activeElement.textContent, "Privacy preferences");
  } finally {
    await act(async () => root.unmount());
  }
});

test("unconfigured analytics keeps first-visit discovery unobstructed and cannot be enabled", async () => {
  window.localStorage.removeItem(consent.CONSENT_KEY);
  let code = await source("../components/CookieConsent.tsx");
  code = code.replace('"@/lib/consent"', JSON.stringify(consentUrl)).replace('import Link from "next/link";', 'const Link=({children,href})=><a href={href}>{children}</a>;');
  const {default: Component} = await import(compileFixture(code));
  const {createElement,act} = await import('react'), {createRoot} = await import('react-dom/client');
  const root=createRoot(document.getElementById('root'));
  const button=text=>[...document.querySelectorAll('button')].find(b=>b.textContent===text);
  try {
    await act(async()=>root.render(createElement(Component)));
    assert.equal(document.querySelector('[aria-label="Privacy preferences"]'),null);
    assert.equal(document.querySelector('[aria-label="Privacy choices"]'),null);
    assert.ok(button('Privacy preferences'));
    assert.equal(consent.analyticsConsent(),false);
    await act(async()=>button('Privacy preferences').click());
    const checkbox=document.querySelector('input[type="checkbox"]');
    assert.equal(checkbox.disabled,true);assert.equal(checkbox.checked,false);
    assert.equal(document.activeElement.tagName,'H2');
    await act(async()=>checkbox.click());
    await act(async()=>button('Save preferences').click());
    assert.equal(consent.analyticsConsent(),false);
    assert.equal(document.activeElement.textContent,'Privacy preferences');
    assert.equal(document.querySelectorAll('iframe').length,0);
  } finally {await act(async()=>root.unmount());}
});
