import Link from "next/link";
import type { AuthUser } from "@/lib/auth";
import { membershipDate, planLabel } from "@/lib/membership";

export default function MembershipStatus({ user }: { user: AuthUser }) {
  const subscription = user.membership?.subscription;
  if (!subscription || !user.membership?.isPro) return null;
  const isTrial = subscription.status === "trialing";
  const date = membershipDate(subscription);
  return (
    <section
      className="relative overflow-hidden rounded-3xl border border-primary/20 bg-primary-soft p-6 sm:p-7"
      aria-labelledby="membership-title"
    >
      <div
        className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/15 blur-2xl"
        aria-hidden
      />
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-primary-deep">
            {isTrial ? "Trial active" : "Pro active"}
          </p>
          <h2
            id="membership-title"
            className="mt-1 font-display text-2xl font-bold text-slate-900"
          >
            {planLabel(subscription.plan)}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {subscription.cancelledAt
              ? `Your Pro access stays on until ${date || "the end of this period"}.`
              : isTrial
                ? `Your first charge is after ${date || "your trial"}.`
                : `Your next renewal is ${date || "scheduled by Razorpay"}.`}
          </p>
        </div>
        <Link
          href="/billing"
          className="rounded-xl border border-primary/25 bg-white px-4 py-2.5 text-sm font-bold text-primary-deep transition-colors hover:bg-primary-soft"
        >
          Manage Pro
        </Link>
      </div>
    </section>
  );
}
