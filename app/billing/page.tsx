"use client";
import { safeJsonLd } from "@/lib/seo";

import { loadCheckout } from "@/lib/checkout-script";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  beginCheckout,
  cancelSubscription,
  getBilling,
  verifyCheckout,
  type BillingState,
} from "@/lib/auth";
import { useAuth } from "@/components/AuthProvider";
import Reveal from "@/components/Reveal";
import MembershipStatus from "@/components/MembershipStatus";
import Icon from "@/components/ui/Icon";
import styles from "./Billing.module.css";
import { hasProAccess, membershipDate, planLabel } from "@/lib/membership";

type PlanId = "pro-weekly" | "pro-monthly" | "pro-quarterly";

type RazorpayResponse = {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (
        event: string,
        handler: (response: { error?: { description?: string } }) => void,
      ) => void;
    };
  }
}

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
    price: "₹149",
    per: "/ month",
    badge: "Recommended",
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
  [
    "Days 2–7",
    "Review ranked matches. Daily emails include up to five roles that meet the relevance threshold.",
  ],
  [
    "Day 8",
    "Recurring plan billing begins. Cancel renewal during your trial if you don’t want to continue.",
  ],
];

const ASSURANCES = [
  ["Cancel anytime", "One tap, no calls, no retention maze."],
  ["Official sources only", "Every role links to the company's own site."],
  ["Honest fit scores", "We show fit — never a promise of hiring."],
  ["Secure checkout", "Payments processed by Razorpay."],
];

const FAQS = [
  [
    "Are subscription payments refundable?",
    "Subscription payments are non-refundable, including unused days. Cancel renewal to stop the next deduction; you keep Pro through the end of your current paid period. Cancelling during the trial prevents the first recurring subscription charge. Razorpay’s payment-method authorization amount is separate from subscription fees.",
  ],
  [
    "When am I first charged?",
    "Recurring plan billing starts after the 7-day trial. Razorpay may show a small refundable authorization amount when you set up your payment method. Review the checkout amount before authorizing.",
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
    "Cancel renewal on your current plan, then choose another once your current access ends. Weekly is ₹49, monthly is ₹149, and quarterly is ₹299. Cancelling renewal keeps your current Pro access until the end of the period.",
  ],
  [
    "What does Pro unlock over a free account?",
    "Free members can browse official openings, save roles, and apply manually. Pro adds a private ranked dashboard, relevance feedback, and one daily email with up to five strong matches scoring 75% or higher. You can pause alerts any time.",
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
  const { user, loading, refresh } = useAuth();
  const router = useRouter();
  const [billing, setBilling] = useState<BillingState | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [planId, setPlanId] = useState<PlanId>("pro-monthly");
  useEffect(() => {
    if (user)
      getBilling()
        .then(setBilling)
        .catch(() => toast.error("Could not load billing"));
  }, [user]);
  const start = async () => {
    if (!user) {
      router.push("/login?next=/billing");
      return;
    }
    setBusy(true);
    try {
      await loadCheckout();
      const data = await beginCheckout(planId);
      if (!data.checkout) {
        setBilling({ subscription: data.subscription });
        await refresh();
        toast.success("Your Pro access is already active");
        setBusy(false);
        return;
      }
      if (!window.Razorpay) {
        throw new Error("Secure checkout is still loading. Please try again.");
      }
      const selectedPlan =
        PLANS.find((plan) => plan.id === data.subscription?.plan) || selected;
      const checkout = new window.Razorpay({
        key: data.checkout.keyId,
        subscription_id: data.checkout.subscriptionId,
        name: "ReerHub",
        description: `${selectedPlan.name} career intelligence membership`,
        prefill: { name: user?.name, email: user?.email },
        theme: { color: "#2563eb" },
        modal: { ondismiss: () => setBusy(false) },
        handler: async (response: RazorpayResponse) => {
          try {
            const verified = await verifyCheckout({
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySubscriptionId: response.razorpay_subscription_id,
              razorpaySignature: response.razorpay_signature,
            });
            setBilling(verified);
            await refresh();
            router.push("/billing/success");
          } catch (error) {
            toast.error(
              error instanceof Error
                ? error.message
                : "We could not verify your membership",
            );
          } finally {
            setBusy(false);
          }
        },
      });
      checkout.on("payment.failed", (response) => {
        toast.error(
          response.error?.description ||
            "Payment was not completed. You can try again.",
        );
        setBusy(false);
      });
      checkout.open();
    } catch (error) {
      const conflict = error as Error & { code?: string; data?: BillingState };
      if (
        conflict.code === "PENDING_PLAN_CONFLICT" &&
        conflict.data?.subscription
      ) {
        setBilling(conflict.data);
        setPlanId(conflict.data.subscription.plan as PlanId);
      }
      toast.error(
        error instanceof Error ? error.message : "Could not start checkout",
      );
      setBusy(false);
    } finally {
      // The Razorpay modal owns its loading state after it opens.
    }
  };
  const cancel = async () => {
    setBusy(true);
    try {
      const data = await cancelSubscription();
      setBilling(data);
      setConfirmCancel(false);
      await refresh();
      toast.success(
        `Renewal cancelled. Pro access ends ${membershipDate(data.subscription) || "at the end of this period"}.`,
      );
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
  const subscription = billing?.subscription || user?.membership?.subscription;
  const isLive = hasProAccess(subscription);
  const selected = PLANS.find((p) => p.id === planId) || PLANS[1];
  return (
    <div className={`${styles.billing} mx-auto max-w-5xl px-5 py-10 sm:py-16`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(FAQ_JSON_LD) }}
      />
      <p className="rise-in mb-4 flex items-center gap-2 text-sm font-bold text-primary-deep">
        <Icon name="spark" />
        ReerHub Pro
      </p>
      <h1
        className="rise-in max-w-2xl font-display text-4xl sm:text-5xl leading-tight font-bold tracking-tight text-slate-900 mt-2"
        style={stagger(1)}
      >
        A stronger signal for your next move.
      </h1>
      <p
        className="rise-in text-slate-600 text-lg leading-relaxed mt-4"
        style={stagger(2)}
      >
        Your skills. Your preferences. A ranked shortlist that helps you focus.
        Start with a 7-day trial on any plan.
      </p>
      {isLive && user && (
        <div className="mt-8">
          <MembershipStatus
            user={{
              ...user,
              membership: { isPro: true, subscription: subscription || null },
            }}
          />
        </div>
      )}
      {subscription && !isLive && (
        <div className="surface-panel mt-8 p-5" role="status">
          <h2 className="font-semibold text-ink">
            {subscription.status === "pending"
              ? "Your checkout isn’t complete yet."
              : subscription.status === "past_due"
                ? "Your membership needs attention."
                : "Your previous Pro access has ended."}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {subscription.status === "pending"
              ? "Resume your existing pending plan to continue secure checkout. Pro becomes available after payment authorization is confirmed."
              : "Free job discovery and your saved roles are still available. Review your membership before starting another checkout."}
          </p>
          {subscription.status === "pending" &&
            !subscription.checkoutNeedsReview && (
              <button
                className="btn-secondary mt-4"
                onClick={() => setPlanId(subscription.plan as PlanId)}
              >
                Select pending {planLabel(subscription.plan)} checkout
              </button>
            )}
          {subscription.checkoutNeedsReview && (
            <p className="mt-3 text-sm">
              Checkout needs confirmation. Please{" "}
              <a className="underline" href="mailto:hello@reerhub.com">
                contact support
              </a>{" "}
              before retrying.
            </p>
          )}
        </div>
      )}
      <p className="mt-7 text-sm text-slate-600">
        {isLive
          ? "Your current plan is shown below."
          : "Choose your billing cycle. Every plan includes the same Pro features."}
      </p>
      <div
        className="grid md:grid-cols-3 gap-4 mt-9"
        role="radiogroup"
        aria-label="Choose a plan"
      >
        {PLANS.map((plan, index) => {
          const active = plan.id === (isLive ? subscription?.plan : planId);
          return (
            <button
              key={plan.id}
              role="radio"
              aria-checked={active}
              tabIndex={active ? 0 : -1}
              onKeyDown={(e) => {
                if (
                  ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(
                    e.key,
                  )
                ) {
                  e.preventDefault();
                  const next =
                    (index +
                      (["ArrowRight", "ArrowDown"].includes(e.key) ? 1 : 2)) %
                    PLANS.length;
                  setPlanId(PLANS[next].id);
                  (
                    e.currentTarget.parentElement?.children[next] as HTMLElement
                  )?.focus();
                }
              }}
              disabled={!!isLive}
              onClick={() => setPlanId(plan.id)}
              style={stagger(index)}
              className={`${styles.planCard} ${plan.id === "pro-monthly" ? styles.featured : ""} ${active ? styles.selected : ""} rise-in relative text-left rounded-2xl border p-6`}
            >
              {plan.badge && (
                <span
                  className={`${styles.planBadge} absolute -top-3 left-5 text-xs font-bold px-3 py-1 rounded-full`}
                >
                  {plan.badge}
                </span>
              )}
              <p className="font-bold text-slate-900">{plan.name}</p>
              {active && (
                <span
                  className={`${styles.selectionMark} absolute right-5 top-5 flex h-6 w-6 items-center justify-center rounded-full`}
                >
                  <Icon name="check" className="h-4 w-4" />
                  <span className="sr-only">
                    {isLive ? "Current plan" : "Selected plan"}
                  </span>
                </span>
              )}
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
                  {isLive
                    ? "Your current plan"
                    : subscription.status === "pending"
                      ? "Your pending plan"
                      : "Your previous plan"}
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
              <li>One daily email with up to five strong 75%+ matches</li>
              <li>Clear reasons behind every match score</li>
              <li>A private ranked dashboard built from your profile</li>
              <li>Hide unsuitable roles and pause alerts any time</li>
            </ul>
          </section>
          <section
            className={`${styles.checkoutPanel} rounded-3xl p-7 text-white`}
          >
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
            {isLive && membershipDate(subscription) && (
              <p className="text-sm text-white/70 mt-4">
                {subscription?.cancelAtPeriodEnd
                  ? "Pro access ends"
                  : subscription?.status === "trialing"
                    ? "Trial ends"
                    : "Next renewal"}{" "}
                {membershipDate(subscription)}
              </p>
            )}
            <button
              onClick={isLive ? () => setConfirmCancel(true) : start}
              disabled={
                busy ||
                !!subscription?.checkoutNeedsReview ||
                !!(
                  isLive &&
                  (subscription?.cancelAtPeriodEnd || subscription?.cancelledAt)
                )
              }
              className="w-full mt-6 py-3 rounded-xl bg-white text-slate-900 font-bold hover:bg-slate-100 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 transition-all"
            >
              {busy
                ? "Please wait…"
                : isLive
                  ? subscription?.cancelledAt
                    ? "Renewal cancelled"
                    : "Cancel renewal"
                  : `Start 7-day free trial · ${selected.name} ${selected.price}`}
            </button>
            {confirmCancel && (
              <div
                className="mt-4 rounded-xl border border-white/30 p-4"
                role="region"
                aria-label="Confirm cancellation"
              >
                <p className="text-sm leading-6">
                  Cancel the next renewal? You will keep Pro until{" "}
                  {membershipDate(subscription)}. Subscription payments are
                  non-refundable; unused days are not refunded.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    className="btn-secondary"
                    onClick={cancel}
                    disabled={busy}
                  >
                    Confirm cancellation
                  </button>
                  <button
                    className="min-h-11 px-3 underline"
                    onClick={() => setConfirmCancel(false)}
                    disabled={busy}
                  >
                    Keep renewal
                  </button>
                </div>
              </div>
            )}
            <p className="mt-4 text-sm leading-6 text-white/90">
              Subscription payments are non-refundable. Cancel renewal to stop
              the next deduction and keep Pro for the remaining paid days.{" "}
              <Link href="/terms#subscriptions" className="underline">
                Subscription terms
              </Link>
            </p>
            {!isLive && (
              <p className="text-xs text-white/50 text-center mt-3">
                Recurring billing after trial. Review authorization charges at
                checkout.
              </p>
            )}
          </section>
        </div>
      </Reveal>
      {!isLive && (
        <Reveal>
          <section className="mt-14">
            <p className="text-sm font-bold text-electric">
              Know what happens next
            </p>
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
          <section
            className={`${styles.checkoutPanel} mt-12 rounded-3xl p-8 sm:p-10 text-center overflow-hidden relative`}
          >
            <p className="text-sm font-bold text-teal-300 relative">
              Your search, with more direction
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight mt-2 relative">
              Spend your time on the roles that fit.
            </h2>
            <p className="text-white/70 mt-3 max-w-md mx-auto relative">
              Start your trial, complete your profile, and review your strongest
              available matches. Daily emails include up to five roles that meet
              the relevance threshold.
            </p>
            <button
              onClick={start}
              disabled={busy || !!subscription?.checkoutNeedsReview}
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
