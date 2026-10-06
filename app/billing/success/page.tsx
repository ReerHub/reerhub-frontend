"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getBilling, type BillingState } from "@/lib/auth";
import { useAuth } from "@/components/AuthProvider";
import { membershipDate, planLabel } from "@/lib/membership";

export default function BillingSuccessPage() {
  const { user, refresh } = useAuth();
  const [billing, setBilling] = useState<BillingState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const current = await getBilling();
        if (!active) return;
        setBilling(current);
        await refresh();
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [refresh]);

  const subscription = billing?.subscription || user?.membership?.subscription;
  const ready =
    subscription && ["trialing", "active"].includes(subscription.status);
  const date = membershipDate(subscription);

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-4 py-16">
      <section className="relative w-full overflow-hidden rounded-[2rem] border border-primary/20 bg-white p-8 shadow-card-hover sm:p-12">
        <div
          className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary-soft blur-2xl"
          aria-hidden
        />
        <div className="relative">
          <span
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-2xl text-green-700"
            aria-hidden
          >
            ✓
          </span>
          <p className="mt-7 text-sm font-bold text-primary-deep">
            ReerHub Pro
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-slate-900">
            {ready
              ? "You’re ready for stronger matches."
              : "We’re confirming your membership."}
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-slate-600">
            {ready
              ? `Your ${planLabel(subscription?.plan)} membership is active. Your private dashboard can now surface up to five strong profile matches each day.`
              : loading
                ? "Your secure Razorpay authorization is being confirmed. This usually takes only a moment."
                : "Your membership is still being confirmed. You can safely return to billing and check again."}
          </p>
          {ready && date && (
            <p className="mt-5 rounded-xl bg-primary-soft px-4 py-3 text-sm font-semibold text-primary-deep">
              {subscription?.status === "trialing"
                ? `First charge after ${date}`
                : `Next renewal ${date}`}
            </p>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="rounded-xl bg-electric px-5 py-3 font-bold text-white transition-transform hover:-translate-y-0.5 hover:bg-electric-dark"
            >
              Open my Pro dashboard
            </Link>
            <Link
              href="/billing"
              className="rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Manage membership
            </Link>
          </div>
          <p className="mt-6 text-xs leading-relaxed text-slate-500">
            Match scores describe relevance to your profile, not the likelihood
            of an interview or offer.
          </p>
        </div>
      </section>
    </main>
  );
}
