import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { JSDOM } from "jsdom";
import { compileFixture } from "./location-fixtures.mjs";
const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const configUrl = compileFixture(await read("../lib/analytics-config.ts"));
const config = await import(configUrl);
const eventsUrl = compileFixture(await read("../lib/analytics-events.ts"));
const route = await import(
  compileFixture(
    (await read("../app/analytics-frame/route.ts"))
      .replace('"@/lib/analytics-config"', JSON.stringify(configUrl))
      .replace('"@/lib/analytics-events"', JSON.stringify(eventsUrl)),
  )
);
test("GTM owner container defaults only in production and invalid/empty configuration fails closed", () => {
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
test("GTM loader and noscript are isolated, with allowlisted events and no direct GA4 duplication", async () => {
  const priorGtm = process.env.GTM_CONTAINER_ID,
    priorGa = process.env.GA4_MEASUREMENT_ID;
  try {
    process.env.GTM_CONTAINER_ID = "GTM-SYNTHETIC1";
    process.env.GA4_MEASUREMENT_ID = "G-SYNTHETIC1";
    const response = await route.GET(
      new Request("https://reerhub.com/analytics-frame", {
        headers: {
          "sec-fetch-dest": "iframe",
          "sec-fetch-site": "same-origin",
        },
      }),
    );
    assert.equal(response.status, 200);
    assert.match(
      response.headers.get("content-security-policy"),
      /frame-ancestors 'self'/,
    );
    const html = await response.text();
    assert.match(html, /GTM-SYNTHETIC1/);
    assert.doesNotMatch(html, /gtag\/js/);
    assert.match(html, /ad_personalization:'denied'/);
    const dom = new JSDOM(html, {
      url: "https://reerhub.com/analytics-frame",
      runScripts: "outside-only",
    });
    assert.ok(dom.window.document.head.querySelector("script"));
    assert.equal(
      dom.window.document.body.firstElementChild.tagName,
      "NOSCRIPT",
    );
    for (const script of dom.window.document.querySelectorAll("script"))
      dom.window.eval(script.textContent);
    const { window } = dom;
    const before = window.dataLayer.length;
    window.dispatchEvent(
      new window.MessageEvent("message", {
        source: window.parent,
        data: {
          name: "save_role",
          params: {
            page_family: "discovery",
            email: "private@example.com",
            page_location: "https://reerhub.com/verify-magic?token=private",
          },
        },
      }),
    );
    assert.equal(window.dataLayer.length, before + 1);
    assert.equal(window.dataLayer.at(-1).event, "save_role");
    assert.equal(
      window.dataLayer.at(-1).page_location,
      "https://reerhub.com/analytics-frame",
    );
    assert.equal(window.dataLayer.at(-1).email, undefined);
    dom.window.close();
  } finally {
    for (const [key, value] of [
      ["GTM_CONTAINER_ID", priorGtm],
      ["GA4_MEASUREMENT_ID", priorGa],
    ]) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});
