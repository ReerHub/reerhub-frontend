"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  beginCheckout,
  cancelSubscription,
  getBilling,
  type BillingState,
} from "@/lib/auth";
import { useAuth } from "@/components/AuthProvider";
import Reveal from "@/components/Reveal";

type PlanId = "pro-weekly" | "pro-monthly" | "pro-quarterly";

const PLANS: {
  id: PlanId;
  name: string;
  price: string;
  per: string;
  badge?: string;
  blurb: string;
  saving: string;
}[] = [
  {
    id: "pro-weekly",
    name: "Weekly",
    price: "₹49",
    per: "/ week",
    blurb: "Low commitment. Try Pro week by week.",
    saving: "Most flexible",
  },
  {
    id: "pro-monthly",
    name: "Monthly",
    price: "₹150",
    per: "/ month",
    badge: "Most popular",
    blurb: "The sensible default for an active search.",
    saving: "Just ~₹35 / week",
  },
  {
    id: "pro-quarterly",
    name: "Quarterly",
    price: "₹299",
    per: "/ 3 months",
    badge: "Best value",
    blurb: "Stay covered for a full search cycle.",
    saving: "Save 33% vs monthly · ~₹100 / mo",
  },
];

const TRIAL_STEPS = [
  ["Day 1", "Pick a plan, build your profile in two minutes."],
  ["Days 2–7", "Wake up to your top-5 matches with fit reasons."],
  ["Day 8", "First charge — or cancel in one tap, keep nothing to pay."],
];

const ASSURANCES = [
  ["Cancel anytime", "One tap, no calls, no retention maze."],
  ["Official sources only", "Every role links to the company's own site."],
  ["Honest fit scores", "We show fit — never a promise of hiring."],
  ["Secure checkout", "Payments processed by Razorpay."],
];

const FAQS = [
  [
    "When am I first charged?",
    "On day 8. Every plan starts with a 7-day free trial — the first charge happens only after the trial ends. Cancel during the trial and you pay nothing.",
  ],
  [
    "How do I pay — is UPI supported?",
    "Yes. Checkout runs on Razorpay and accepts UPI, credit/debit cards, and netbanking. ReerHub never sees or stores your payment details.",
  ],
  [
    "How do I cancel?",
    "One tap: open this page while your plan is active and hit “Cancel renewal”. No calls, no retention maze. Your access continues until the end of the paid period and never renews.",
  ],
  [
    "Can I switch plans later?",
    "Yes. Cancel renewal on your current plan, then start the new plan from this page — weekly ₹49, monthly ₹150, or quarterly ₹299. The new plan starts its own billing cycle.",
  ],
  [
    "What does Pro unlock over a free account?",
    "Pro members get a daily top-five of fresh matches with clear fit reasons, full official job details with apply links, and digest controls (daily weekdays, weekly, or paused). Without Pro you see teasers only.",
  ],
  [
    "Will I be hired if my fit score is high?",
    "No — fit scores rank relevance to your profile; they are never a promise of hiring. Every application happens on the company's own official site.",
  ],
];

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map(([question, answer]) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: { "@type": "Answer", text: answer },
  })),
};

const planName = (id?: string) => PLANS.find((p) => p.id === id)?.name || "Pro";

function FaqSection() {
  return (
    <Reveal>
      <section className="mt-14">
        <p className="text-sm font-bold text-electric">Questions</p>
        <h2 className="font-display text-3xl font-bold text-slate-900 mt-1">
          Billing FAQ
        </h2>
        <div className="mt-7 space-y-3">
          {FAQS.map(([question, answer]) => (
            <details
              key={question}
              className="group bg-white border border-slate-200 rounded-2xl px-5 py-4 shadow-card"
            >
              <summary className="font-bold text-slate-900 text-[15px] cursor-pointer list-none flex items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
                {question}
                <span
                  className="text-electric font-bold shrink-0 group-open:rotate-45 transition-transform"
                  aria-hidden
                >
                  +
                </span>
              </summary>
              <p className="text-slate-600 text-[15px] leading-relaxed mt-2">
                {answer}
              </p>
            </details>
          ))}
        </div>
      </section>
    </Reveal>
  );
}

const stagger = (index: number) => ({ animationDelay: `${index * 90}ms` });

export default function BillingPage() {
  const { user, loading } = useAuth();
  const [billing, setBilling] = useState<BillingState | null>(null);
  const [busy, setBusy] = useState(false);
  const [planId, setPlanId] = useState<PlanId>("pro-monthly");
  useEffect(() => {
    if (user)
      getBilling()
        .then(setBilling)
        .catch(() => toast.error("Could not load billing"));
  }, [user]);
  const start = async () => {
    setBusy(true);
    try {
      const data = await beginCheckout(planId);
      if (data.checkoutUrl) window.location.assign(data.checkoutUrl);
      else toast.success("Your Pro access is already active");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not start checkout",
      );
    } finally {
      setBusy(false);
    }
  };
  const cancel = async () => {
    setBusy(true);
    try {
      const data = await cancelSubscription();
      setBilling(data);
      toast.success("Your plan will not renew");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not cancel plan",
      );
    } finally {
      setBusy(false);
    }
  };
  if (loading)
    return (
      <p className="max-w-3xl mx-auto px-4 py-16 text-slate-500">Loading…</p>
    );
  if (!user)
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }}
        />
        <p className="rise-in text-sm font-bold text-electric">ReerHub Pro</p>
        <h1
          className="rise-in font-display text-4xl font-bold text-slate-900 mt-2"
          style={stagger(1)}
        >
          Make every daily match count.
        </h1>
        <p className="rise-in text-slate-600 mt-3 text-lg" style={stagger(2)}>
          Sign in to start your 7-day free trial.
        </p>
        <Link
          href="/login?next=/billing"
          className="rise-in inline-block mt-6 px-6 py-3 rounded-xl bg-electric text-white font-semibold hover:bg-electric-dark hover:-translate-y-0.5 transition-all"
          style={stagger(3)}
        >
          Sign in
        </Link>
        <FaqSection />
      </div>
    );
  const subscription = billing?.subscription;
  const isLive =
    subscription && ["active", "trialing"].includes(subscription.status);
  const selected = PLANS.find((p) => p.id === planId) || PLANS[1];
  return (
    <div className="max-w-4xl mx-auto px-4 py-14 overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }}
      />
      <p className="rise-in text-sm font-bold text-electric">ReerHub Pro</p>
      <h1
        className="rise-in font-display text-4xl font-bold text-slate-900 mt-2"
        style={stagger(1)}
      >
        Make every daily match count.
      </h1>
      <p
        className="rise-in text-slate-600 text-lg leading-relaxed mt-4"
        style={stagger(2)}
      >
        7-day free trial on every plan. Cancel any time. We show fit—not a
        promise of hiring.
      </p>
      <div
        className="grid md:grid-cols-3 gap-4 mt-9"
        role="radiogroup"
        aria-label="Choose a plan"
      >
        {PLANS.map((plan, index) => {
          const active = plan.id === planId && !isLive;
          return (
            <button
              key={plan.id}
              role="radio"
              aria-checked={active}
              disabled={!!isLive}
              onClick={() => setPlanId(plan.id)}
              style={stagger(index)}
              className={`rise-in relative text-left bg-white rounded-3xl border p-6 transition-all ${active ? "border-electric ring-2 ring-electric-soft shadow-card-hover -translate-y-1" : "border-slate-200 shadow-card hover:border-slate-400 hover:-translate-y-0.5"} ${isLive ? "opacity-90" : ""}`}
            >
              {plan.badge && (
                <span
                  className={`absolute -top-3 left-5 text-xs font-bold px-3 py-1 rounded-full ${plan.id === "pro-quarterly" ? "bg-green-600 text-white" : "bg-electric text-white"}`}
                >
                  {plan.badge}
                </span>
              )}
              <p className="font-bold text-slate-900">{plan.name}</p>
              <p className="mt-2">
                <span className="font-display text-4xl font-bold text-slate-900 tabular-nums">
                  {plan.price}
                </span>
                <span className="text-sm font-medium text-slate-500">
                  {plan.per}
                </span>
              </p>
              <p className="text-sm text-slate-600 leading-relaxed mt-3">
                {plan.blurb}
              </p>
              <p className="text-sm font-bold text-electric mt-2">
                {plan.saving}
              </p>
              {subscription?.plan === plan.id && (
                <p className="text-xs font-bold text-slate-500 mt-3">
                  Your current plan
                </p>
              )}
            </button>
          );
        })}
      </div>
      <Reveal>
        <div className="grid md:grid-cols-[1fr_.9fr] gap-5 mt-6">
          <section className="bg-white rounded-3xl border border-slate-200 p-7 shadow-card">
            <h2 className="font-bold text-slate-900 text-xl">
              What Pro includes
            </h2>
            <ul className="mt-5 space-y-3 text-slate-600">
              <li>Daily top-five fresh job matches</li>
              <li>Clear reasons behind every fit score</li>
              <li>Full official job details and apply links</li>
              <li>Weekday, weekly, and pause controls</li>
            </ul>
          </section>
          <section className="bg-ink rounded-3xl p-7 text-white">
            <p className="text-white/70 text-sm">
              {isLive
                ? `Your membership · ${planName(subscription?.plan)}`
                : "Start with confidence"}
            </p>
            <p
              key={isLive ? "member" : selected.id}
              className={`font-display text-4xl font-bold mt-2 tabular-nums${isLive ? "" : " price-pop"}`}
            >
              {isLive ? planName(subscription?.plan) : selected.price}
              <span className="text-base font-medium text-white/60">
                {isLive ? "" : ` ${selected.per}`}
              </span>
            </p>
            {subscription?.trialEndsAt && (
              <p className="text-sm text-white/70 mt-4">
                Trial ends{" "}
                {new Date(subscription.trialEndsAt).toLocaleDateString("en-IN")}
              </p>
            )}
            <button
              onClick={isLive ? cancel : start}
              disabled={busy}
              className="w-full mt-6 py-3 rounded-xl bg-white text-slate-900 font-bold hover:bg-slate-100 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 transition-all"
            >
              {busy
                ? "Please wait…"
                : isLive
                  ? "Cancel renewal"
                  : `Start 7-day free trial · ${selected.name} ${selected.price}`}
            </button>
            {!isLive && (
              <p className="text-xs text-white/50 text-center mt-3">
                First charge after trial · cancel any time
              </p>
            )}
          </section>
        </div>
      </Reveal>
      {!isLive && (
        <Reveal>
          <section className="mt-14">
            <p className="text-sm font-bold text-electric">Zero risk</p>
            <h2 className="font-display text-3xl font-bold text-slate-900 mt-1">
              How your 7-day trial works
            </h2>
            <div className="grid md:grid-cols-3 gap-4 mt-7">
              {TRIAL_STEPS.map(([title, copy], index) => (
                <div
                  key={title}
                  className="bg-white border border-slate-200 rounded-2xl p-6 shadow-card"
                >
                  <span className="w-9 h-9 rounded-full bg-electric-soft text-electric font-bold inline-flex items-center justify-center text-sm tabular-nums">
                    {index + 1}
                  </span>
                  <h3 className="font-bold text-slate-900 mt-4">{title}</h3>
                  <p className="text-slate-600 text-[15px] leading-relaxed mt-1.5">
                    {copy}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </Reveal>
      )}
      {!isLive && (
        <Reveal>
          <section className="mt-10 grid sm:grid-cols-2 gap-3">
            {ASSURANCES.map(([title, copy]) => (
              <div
                key={title}
                className="flex items-start gap-3 bg-white border border-slate-200 rounded-2xl px-5 py-4"
              >
                <span
                  className="w-6 h-6 rounded-full bg-green-50 text-green-700 font-bold inline-flex items-center justify-center text-sm shrink-0 mt-0.5"
                  aria-hidden
                >
                  ✓
                </span>
                <span>
                  <strong className="block text-slate-900 text-[15px]">
                    {title}
                  </strong>
                  <span className="text-sm text-slate-500">{copy}</span>
                </span>
              </div>
            ))}
          </section>
        </Reveal>
      )}
      <FaqSection />
      {subscription?.payments?.length ? (
        <section className="mt-8 bg-white border border-slate-200 rounded-2xl p-6">
          <h2 className="font-bold text-slate-900">Payment history</h2>{" "}
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            {subscription.payments.map((payment) => (
              <li key={payment.razorpayPaymentId}>
                {payment.paidAt
                  ? new Date(payment.paidAt).toLocaleDateString("en-IN")
                  : "Payment"}{" "}
                · ₹{payment.amount ? payment.amount / 100 : 0} ·{" "}
                {payment.status}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {!isLive && (
        <Reveal>
          <section className="mt-12 bg-ink rounded-3xl p-8 sm:p-10 text-center overflow-hidden relative">
            <div
              className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-electric opacity-20 blur-3xl"
              aria-hidden
            />
            <div
              className="absolute -bottom-24 -left-16 w-64 h-64 rounded-full bg-brand-purple opacity-20 blur-3xl"
              aria-hidden
            />
            <p className="text-sm font-bold text-teal-300 relative">
              Tomorrow&apos;s digest is already forming
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight mt-2 relative">
              Your next role could be in it.
            </h2>
            <p className="text-white/70 mt-3 max-w-md mx-auto relative">
              Join Pro tonight and wake up to five official roles ranked for
              your profile.
            </p>
            <button
              onClick={start}
              disabled={busy}
              className="relative mt-7 inline-block px-8 py-3.5 rounded-xl bg-white text-slate-900 font-bold hover:bg-slate-100 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 transition-all"
            >
              {busy
                ? "Please wait…"
                : `Start 7-day free trial · ${selected.name} ${selected.price}`}
            </button>
            <p className="relative text-xs text-white/50 mt-3">
              First charge after trial · cancel any time
            </p>
          </section>
        </Reveal>
      )}
    </div>
  );
}
