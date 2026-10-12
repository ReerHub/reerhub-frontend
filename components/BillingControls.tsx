"use client";
import { PLANS, type PlanId } from "@/lib/billing-plans";

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
import styles from "@/app/billing/Billing.module.css";
import { hasProAccess, membershipDate, planLabel } from "@/lib/membership";

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

const planName = (id?: string) => PLANS.find((p) => p.id === id)?.name || "Pro";

const stagger = (index: number) => ({ animationDelay: `${index * 90}ms` });

export default function BillingControls() {
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
        name: "REERHUB",
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
  const subscription = billing?.subscription || user?.membership?.subscription;
  const isLive = hasProAccess(subscription);
  const selected = PLANS.find((p) => p.id === planId) || PLANS[1];
  return (
    <div id="choose-plan" className={styles.billing}>
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
              <a className="underline" href="mailto:support@reerhub.com">
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
                loading ||
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
              available matches. Daily emails include only verified Profile
              matches at 75%+ relevance.
            </p>
            <button
              onClick={start}
              disabled={loading || busy || !!subscription?.checkoutNeedsReview}
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
