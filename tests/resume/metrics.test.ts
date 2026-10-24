import test from "node:test";
import assert from "node:assert/strict";
import { recordMetric } from "../../lib/resume/metrics";
test("optional metrics are off by default and opted-in payloads carry only an event enum without credentials", async (t) => {
  let consent: string | null = null;
  Object.defineProperty(globalThis, "localStorage", {
    value: { getItem: () => consent },
    configurable: true,
  });
  t.after(() => Reflect.deleteProperty(globalThis, "localStorage"));
  const calls: { url: string; init: RequestInit }[] = [];
  t.mock.method(
    globalThis,
    "fetch",
    async (url: RequestInfo | URL, init: RequestInit = {}) => {
      calls.push({ url: String(url), init });
      return Response.json({ data: { accepted: true } });
    },
  );
  recordMetric("builder_started");
  assert.equal(calls.length, 0);
  consent = "yes";
  recordMetric("pdf_downloaded");
  assert.equal(calls.length, 1);
  assert.equal(calls[0].init.credentials, "omit");
  assert.deepEqual(JSON.parse(calls[0].init.body as string), {
    event: "pdf_downloaded",
  });
  consent = "no";
  recordMetric("resume_saved");
  assert.equal(calls.length, 1);
});
