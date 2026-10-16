import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { JSDOM } from "jsdom";
import { compileFixture } from "./location-fixtures.mjs";
const { PLANS, resolvePlanId, billingPlanHref } = await import(
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
    track: (name, input) => events.push({ name, input }),
    PLANS,
    billingPlanHref,
    user,
    router: { push: (route) => routes.push(route) },
    refresh: async () => {},
    loadCheckout: async () => {
      calls.push("load");
    },
    getBilling: async () => ({ subscription: null }),
    getMatchAvailability: async () => {
      if (globalThis.billingJourney.availabilityFailure)
        throw Error("unavailable");
      return (
        globalThis.billingJourney.availability || {
          profileReady: true,
          missingProfileFields: [],
          strongMatchCount: 5,
          checkedAt: new Date().toISOString(),
        }
      );
    },
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
    cancelSubscription: async () => {
      calls.push("cancel");
      return {
        subscription: {
          plan: "pro-weekly",
          status: "cancelled",
          isPro: true,
          cancelAtPeriodEnd: true,
          cancelledAt: new Date().toISOString(),
          accessEndsAt: new Date(Date.now() + 86400000).toISOString(),
        },
      };
    },
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
      'import { navigateAwayFromPublicTag, track } from "@/lib/analytics";',
      "const {track} = globalThis.billingJourney; const navigateAwayFromPublicTag=()=>false;",
    )
    .replace(
      'import { PLANS, billingPlanHref, type PlanId } from "@/lib/billing-plans";',
      "const {PLANS,billingPlanHref} = globalThis.billingJourney;",
    )
    .replace(
      'import { loadCheckout } from "@/lib/checkout-script";',
      "const {loadCheckout} = globalThis.billingJourney;",
    )
    .replace(
      /import Link from "(?:next\/link|@\/components\/AppLink)";/,
      "const Link = ({children,href}) => <a href={href}>{children}</a>;",
    )
    .replace(
      'import { usePathname, useRouter } from "next/navigation";',
      "const useRouter = () => globalThis.billingJourney.router; const usePathname=()=>globalThis.billingJourney.pathname || '/billing';",
    )
    .replace(
      'import toast from "react-hot-toast";',
      "const {toast} = globalThis.billingJourney;",
    )
    .replace(
      /import \{\s*getMatchAvailability,[\s\S]*?\} from "@\/lib\/auth";/,
      "const {getMatchAvailability,beginCheckout,cancelSubscription,getBilling,verifyCheckout} = globalThis.billingJourney;",
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
    for (const plan of PLANS) {
      await act(async () =>
        root.render(
          createElement(Component, { key: plan.id, initialPlan: plan.id }),
        ),
      );
      assert.ok(
        document
          .querySelector('[aria-checked="true"]')
          .textContent.includes(plan.name),
      );
    }
    globalThis.billingJourney.user = null;
    await act(async () =>
      root.render(
        createElement(Component, {
          key: "guest",
          initialPlan: "pro-quarterly",
        }),
      ),
    );
    await act(async () =>
      [...document.querySelectorAll("button")]
        .find((n) => n.textContent.includes("Check match availability"))
        .click(),
    );
    const login = new URL(routes.at(-1), "https://reerhub.com");
    assert.equal(login.pathname, "/login");
    assert.equal(
      login.searchParams.get("next"),
      billingPlanHref("pro-quarterly"),
    );
    assert.equal(
      calls.length,
      0,
      "Guest continuation must not create a subscription",
    );
    globalThis.billingJourney.pathname = "/dashboard/billing";
    globalThis.billingJourney.user = user;
    await act(async () =>
      root.render(createElement(Component, { key: "member" })),
    );
    const weekly = [...document.querySelectorAll('[role="radio"]')].find((n) =>
      n.textContent.startsWith("Weekly"),
    );
    await act(async () => weekly.click());
    assert.equal(weekly.getAttribute("aria-checked"), "true");
    const start = () =>
      [...document.querySelectorAll("button")].find((n) =>
        n.textContent.includes("Start 7-day"),
      );
    const check = () =>
      [...document.querySelectorAll("button")].find((n) =>
        n.textContent.includes("Check match availability"),
      );
    globalThis.billingJourney.availability = {
      profileReady: false,
      missingProfileFields: ["skills"],
      strongMatchCount: null,
      checkedAt: new Date().toISOString(),
    };
    await act(async () => check().click());
    assert.match(document.body.textContent, /Complete skills/);
    assert.equal(calls.length, 0);
    globalThis.billingJourney.availabilityFailure = true;
    await act(async () => check().click());
    assert.match(document.body.textContent, /couldn’t check/);
    assert.equal(calls.length, 0);
    globalThis.billingJourney.availabilityFailure = false;
    globalThis.billingJourney.availability = {
      profileReady: true,
      missingProfileFields: [],
      strongMatchCount: 0,
      checkedAt: new Date().toISOString(),
    };
    await act(async () => check().click());
    assert.match(document.body.textContent, /Continue anyway/);
    assert.equal(calls.length, 0);
    delete globalThis.billingJourney.availability;
    await act(async () => check().click());
    assert.match(document.body.textContent, /5 verified strong matches/);
    assert.equal(calls.length, 0);
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
    assert.ok(routes.includes("/dashboard/billing/success"));
    assert.deepEqual(
      events.map((event) => event.name),
      ["begin_checkout", "trial_activation"],
    );
    assert.ok(!JSON.stringify(events).includes("candidate@example.com"));
    assert.match(document.body.textContent, /Cancel renewal/);
    assert.ok(calls.some((call) => call.razorpayPaymentId === "pay_synthetic"));
    const action = (label) =>
      [...document.querySelectorAll("button")].find(
        (b) => b.textContent === label,
      );
    await act(async () => action("Cancel renewal").click());
    assert.equal(calls.includes("cancel"), false);
    await act(async () => action("Keep renewal").click());
    assert.equal(calls.includes("cancel"), false);
    await act(async () => action("Cancel renewal").click());
    await act(async () => action("Confirm cancellation").click());
    assert.equal(calls.filter((c) => c === "cancel").length, 1);
    assert.ok(action("Renewal cancelled").disabled);
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

test("INR notation retains the approved recurring price catalog", () => {
  assert.deepEqual(
    PLANS.map(({ id, price }) => [id, price]),
    [
      ["pro-weekly", "INR 49"],
      ["pro-monthly", "INR 149"],
      ["pro-quarterly", "INR 299"],
    ],
  );
});

test("homepage billing choices accept catalog IDs and reject unsafe or ambiguous values", () => {
  for (const plan of PLANS) {
    const url = new URL(billingPlanHref(plan.id), "https://reerhub.com");
    assert.equal(url.pathname, "/billing");
    assert.equal(resolvePlanId(url.searchParams.get("plan")), plan.id);
    assert.equal(url.hash, "#choose-plan");
  }
  for (const value of [
    undefined,
    "",
    "legacy",
    "https://example.com",
    ["pro-weekly", "pro-quarterly"],
  ]) {
    assert.equal(resolvePlanId(value), "pro-monthly");
  }
});
