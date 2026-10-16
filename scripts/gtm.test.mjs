import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { JSDOM } from "jsdom";
import { compileFixture } from "./location-fixtures.mjs";
const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const publicPagesUrl = compileFixture(
  (await read("../lib/public-analytics.ts")).replace(
    '"./blog-catalog"',
    JSON.stringify(compileFixture(await read("../lib/blog-catalog.ts"))),
  ),
);
const config = await import(
  compileFixture(await read("../lib/analytics-config.ts"))
);
const publicUrl = publicPagesUrl;
const eligibility = await import(publicUrl);
const eventsUrl = compileFixture(await read("../lib/analytics-events.ts"));
test("public GTM configuration is valid, production-only by default and explicitly disableable", () => {
  assert.equal(
    config.analyticsConfig({ NODE_ENV: "production" }).gtmContainerId,
    "GTM-KQD9XXJL",
  );
  assert.equal(
    config.analyticsConfig({ NODE_ENV: "development" }).available,
    false,
  );
  assert.equal(
    config.analyticsConfig({ NODE_ENV: "production", GTM_CONTAINER_ID: "" })
      .available,
    false,
  );
  assert.equal(
    config.analyticsConfig({ GTM_CONTAINER_ID: "GTM-bad<script>" }).available,
    false,
  );
});
test("private/admin/auth/error URLs are excluded even with consent", () => {
  for (const path of [
    "/dashboard",
    "/dashboard/jobs",
    "/dashboard/faq",
    "/profile",
    "/billing/success",
    "/login",
    "/verify-magic",
    "/verify-email",
    "/admin-dashboard",
    "/api/config",
    "/unknown",
    "/analytics-frame",
  ])
    assert.equal(eligibility.isPublicAnalyticsPath(path), false, path);
  for (const path of [
    "/",
    "/jobs",
    "/faq",
    "/billing",
    "/backend-jobs",
    "/react-jobs",
    "/typescript-jobs",
    "/companies/test-company",
    "/jobs/engineer-test-1234567890abcdef12345678",
  ])
    assert.equal(eligibility.isPublicAnalyticsPath(path), true, path);
  for (const query of [
    "?token=secret",
    "?email=private",
    "?code=oauth",
    "?session=private",
  ])
    assert.equal(
      eligibility.isPublicAnalyticsUrl(new URL("https://reerhub.com/" + query)),
      false,
    );
  assert.equal(
    eligibility.isPublicAnalyticsUrl(
      new URL("https://reerhub.com/jobs?q=React&_dbg=1"),
    ),
    false,
  );
});
test("main-document GTM requires consent; safe defaults precede one loader and pageviews omit query/fragment", async () => {
  const dom = new JSDOM(
    '<title>Public jobs</title><a href="/login?next=/dashboard">Sign in</a>',
    { url: "https://reerhub.com/jobs#results" },
  );
  const previous = new Map();
  for (const [key, value] of Object.entries({
    window: dom.window,
    document: dom.window.document,
    sessionStorage: dom.window.sessionStorage,
    Event: dom.window.Event,
    Element: dom.window.Element,
    HTMLAnchorElement: dom.window.HTMLAnchorElement,
    MouseEvent: dom.window.MouseEvent,
  })) {
    previous.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, {
      value,
      configurable: true,
      writable: true,
    });
  }
  try {
    const consentUrl = compileFixture(await read("../lib/consent.ts"));
    const consent = await import(consentUrl);
    const source = (await read("../lib/analytics.ts"))
      .replace('"./consent"', JSON.stringify(consentUrl))
      .replace('"./analytics-events"', JSON.stringify(eventsUrl))
      .replace('"./public-analytics"', JSON.stringify(publicUrl));
    const analytics = await import(compileFixture(source));
    analytics.startAnalytics("GTM-SYNTHETIC1");
    assert.equal(document.querySelectorAll("script").length, 0);
    for (const name of [
      "search_submit",
      "empty_results",
      "signup_prompt_click",
      "outbound_apply",
    ])
      analytics.track(name, { page_family: "discovery" });
    assert.equal(
      window.dataLayer,
      undefined,
      "Rejected consent sends no funnel events",
    );
    consent.saveConsent(true);
    analytics.startAnalytics("bad");
    assert.equal(document.querySelectorAll("script").length, 0);
    analytics.startAnalytics("GTM-SYNTHETIC1");
    analytics.startAnalytics("GTM-SYNTHETIC1");
    assert.equal(document.head.querySelectorAll("script").length, 1);
    assert.equal(document.querySelectorAll("iframe").length, 0);
    assert.equal(
      document.querySelector("script").src,
      "https://www.googletagmanager.com/gtm.js?id=GTM-SYNTHETIC1",
    );
    const commands = window.dataLayer.map((x) => (x.event ? x : [...x]));
    assert.deepEqual(commands[0].slice(0, 2), ["consent", "default"]);
    assert.equal(commands[0][2].analytics_storage, "denied");
    assert.equal(commands[1][1].page_location, "https://reerhub.com/jobs");
    assert.equal(commands[1][1].send_page_view, false);
    assert.equal(commands[1][1].allow_google_signals, false);
    assert.equal(commands[1][1].url_passthrough, false);
    assert.equal(commands[2][2].analytics_storage, "granted");
    assert.equal(commands[2][2].ad_user_data, "denied");
    assert.equal(commands[3].event, "gtm.js");
    analytics.trackPublicPage();
    assert.equal(window.dataLayer.filter((x) => x[0] === "event").length, 0);
    document.querySelector("script").dispatchEvent(new window.Event("load"));
    analytics.trackPublicPage();
    assert.equal(
      window.dataLayer.filter((x) => x.event === "page_view").length,
      1,
    );
    analytics.track("discovery", {
      page_family: "discovery",
      email: "private",
      token: "private",
      page_location: "private",
    });
    assert.deepEqual(window.dataLayer.at(-1), {
      event: "discovery",
      page_family: "discovery",
      page_location: "https://reerhub.com/jobs",
      page_referrer: "",
      page_title: "Public jobs",
    });
    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex,follow";
    document.head.appendChild(robots);
    const beforeNoindex = window.dataLayer.length;
    analytics.track("outbound_apply", {});
    assert.equal(window.dataLayer.length, beforeNoindex);
    robots.remove();
    dom.reconfigure({
      url: "https://reerhub.com/dashboard/profile?token=private",
    });
    const n = window.dataLayer.length;
    analytics.track("profile_ready", {});
    analytics.trackPublicPage();
    assert.equal(window.dataLayer.length, n);
  } finally {
    dom.window.close();
    for (const [key, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
});
test("GTM cannot be loaded by the legacy iframe endpoint", async () => {
  const configUrl = compileFixture(await read("../lib/analytics-config.ts"));
  const route = await import(
    compileFixture(
      (await read("../app/analytics-frame/route.ts"))
        .replace('"@/lib/analytics-config"', JSON.stringify(configUrl))
        .replace('"@/lib/analytics-events"', JSON.stringify(eventsUrl)),
    )
  );
  const prior = process.env.GTM_CONTAINER_ID;
  try {
    process.env.GTM_CONTAINER_ID = "GTM-SYNTHETIC1";
    assert.equal(
      (
        await route.GET(
          new Request("https://reerhub.com/analytics-frame", {
            headers: {
              "sec-fetch-dest": "iframe",
              "sec-fetch-site": "same-origin",
            },
          }),
        )
      ).status,
      404,
    );
  } finally {
    if (prior === undefined) delete process.env.GTM_CONTAINER_ID;
    else process.env.GTM_CONTAINER_ID = prior;
  }
});
