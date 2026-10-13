import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { JSDOM } from "jsdom";
import { compileFixture } from "./location-fixtures.mjs";
const { PLANS } = await import(
  compileFixture(
    await readFile(new URL("../lib/billing-plans.ts", import.meta.url), "utf8"),
  )
);

test("mock Test-mode checkout preserves selected plan, verifies activation and recovers from failure", async () => {
  const dom = new JSDOM('<div id="root"></div>', {
    url: "http://localhost/billing",
  });
  const previous = new Map();
  for (const [key, value] of Object.entries({
    window: dom.window,
    document: dom.window.document,
    navigator: dom.window.navigator,
    IS_REACT_ACT_ENVIRONMENT: true,
  })) {
    previous.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, {
      value,
      configurable: true,
      writable: true,
    });
  }
  const events = [];
  const calls = [],
    routes = [],
    errors = [];
  let options,
    failure = false;
  const user = {
    name: "Synthetic candidate",
    email: "candidate@example.com",
    membership: { isPro: false, subscription: null },
  };
  globalThis.billingJourney = {
    track: (name, input) => events.push({name,input}),
    PLANS,
    user,
    router: { push: (route) => routes.push(route) },
    refresh: async () => {},
    loadCheckout: async () => {
      calls.push("load");
    },
    getBilling: async () => ({ subscription: null }),
    beginCheckout: async (plan) => {
      calls.push(plan);
      if (failure) throw Error("Mock provider unavailable");
      return {
        subscription: { plan, status: "pending" },
        checkout: {
          keyId: "rzp_test_synthetic",
          subscriptionId: "sub_synthetic",
        },
      };
    },
    verifyCheckout: async (payload) => {
      calls.push(payload);
      return {
        subscription: { plan: "pro-weekly", status: "trialing", isPro: true },
      };
    },
    cancelSubscription: async () => ({ subscription: null }),
    toast: { success() {}, error: (message) => errors.push(message) },
  };
  window.Razorpay = class {
    constructor(value) {
      options = value;
    }
    on() {}
    open() {
      calls.push("open");
    }
  };
  let source = await readFile(
    new URL("../components/BillingControls.tsx", import.meta.url),
    "utf8",
  );
  source = source
    .replace(
      'import { track } from "@/lib/analytics";',
      "const {track} = globalThis.billingJourney;",
    )
    .replace(
      'import { PLANS, type PlanId } from "@/lib/billing-plans";',
      "const {PLANS} = globalThis.billingJourney;",
    )
    .replace(
      'import { loadCheckout } from "@/lib/checkout-script";',
      "const {loadCheckout} = globalThis.billingJourney;",
    )
    .replace(
      'import Link from "next/link";',
      "const Link = ({children,href}) => <a href={href}>{children}</a>;",
    )
    .replace(
      'import { useRouter } from "next/navigation";',
      "const useRouter = () => globalThis.billingJourney.router;",
    )
    .replace(
      'import toast from "react-hot-toast";',
      "const {toast} = globalThis.billingJourney;",
    )
    .replace(
      /import \{\s*beginCheckout,[\s\S]*?\} from "@\/lib\/auth";/,
      "const {beginCheckout,cancelSubscription,getBilling,verifyCheckout} = globalThis.billingJourney;",
    )
    .replace(
      'import { useAuth } from "@/components/AuthProvider";',
      "const useAuth = () => ({user: globalThis.billingJourney.user, loading: false, refresh:globalThis.billingJourney.refresh});",
    )
    .replace(
      'import Reveal from "@/components/Reveal";',
      "const Reveal = ({children}) => <div>{children}</div>;",
    )
    .replace(
      'import MembershipStatus from "@/components/MembershipStatus";',
      "const MembershipStatus = () => null;",
    )
    .replace(
      'import Icon from "@/components/ui/Icon";',
      "const Icon = () => null;",
    )
    .replace(
      'import styles from "@/app/billing/Billing.module.css";',
      "const styles = {};",
    )
    .replace(
      'import { hasProAccess, membershipDate, planLabel } from "@/lib/membership";',
      'const hasProAccess = (value) => value?.isPro; const membershipDate = () => "20 Oct 2026"; const planLabel = (value) => value;',
    );
  const { default: Component } = await import(compileFixture(source));
  const { createElement, act } = await import("react"),
    { createRoot } = await import("react-dom/client");
  const root = createRoot(document.getElementById("root"));
  try {
    await act(async () => root.render(createElement(Component)));
    const weekly = [...document.querySelectorAll('[role="radio"]')].find((n) =>
      n.textContent.startsWith("Weekly"),
    );
    await act(async () => weekly.click());
    assert.equal(weekly.getAttribute("aria-checked"), "true");
    const start = () =>
      [...document.querySelectorAll("button")].find((n) =>
        n.textContent.includes("Start 7-day"),
      );
    failure = true;
    await act(async () => start().click());
    assert.ok(errors.includes("Mock provider unavailable"));
    assert.equal(start().disabled, false);
    failure = false;
    await act(async () => start().click());
    assert.equal(options.key, "rzp_test_synthetic");
    assert.equal(options.description, "Weekly career intelligence membership");
    assert.ok(calls.includes("pro-weekly"));
    await act(async () =>
      options.handler({
        razorpay_payment_id: "pay_synthetic",
        razorpay_subscription_id: "sub_synthetic",
        razorpay_signature: "synthetic-provider-proof",
      }),
    );
    assert.ok(routes.includes("/billing/success"));
    assert.deepEqual(events.map((event) => event.name), ["begin_checkout", "trial_activation"]);
    assert.ok(!JSON.stringify(events).includes("candidate@example.com"));
    assert.match(document.body.textContent, /Cancel renewal/);
    assert.ok(calls.some((call) => call.razorpayPaymentId === "pay_synthetic"));
  } finally {
    await act(async () => root.unmount());
    delete globalThis.billingJourney;
    for (const [key, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
    dom.window.close();
  }
});
