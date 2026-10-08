"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getBilling, type BillingState } from "@/lib/auth";
import { useAuth } from "@/components/AuthProvider";
import { hasProAccess, membershipDate, planLabel } from "@/lib/membership";
import { profileSignals } from "@/lib/profile-readiness";

export default function BillingSuccessPage() {
  const { user, refresh } = useAuth();
  const [billing, setBilling] = useState<BillingState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    const load = async (count = 0) => {
      try {
        const current = await getBilling();
        if (!active) return;
        setBilling(current);
        setError(false);
        if (hasProAccess(current.subscription)) {
          setLoading(false);
          await refresh();
        } else if (count < 4)
          timer = setTimeout(() => void load(count + 1), 2500);
        else setLoading(false);
      } catch {
        if (active) {
          setError(true);
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [refresh, attempt]);

  const subscription = billing?.subscription;
  const ready = hasProAccess(subscription);
  const date = membershipDate(subscription);
  const profileReady = user
    ? profileSignals(user.profile).every((signal) => signal.complete)
    : false;

  return (
    <div className="page-container flex min-h-[70vh] items-center py-12">
      <section className="surface-panel mx-auto w-full max-w-3xl overflow-hidden">
        <div className="border-b border-slate-100 bg-primary-soft px-6 py-5 sm:px-10">
          <p className="text-sm font-semibold text-primary-deep">
            Secure membership confirmation
          </p>
        </div>
        <div className="p-6 sm:p-10" role="status" aria-live="polite">
          <span
            className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ${ready ? "bg-green-50 text-green-700" : "bg-primary-soft text-primary-deep"}`}
            aria-hidden
          >
            {ready ? "✓" : "…"}
          </span>
          <p className="mt-7 text-sm font-bold text-primary-deep">
            ReerHub Pro
          </p>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            {ready
              ? "You’re ready for stronger matches."
              : error
                ? "We couldn’t confirm your membership yet."
                : "We’re confirming your membership."}
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-slate-600">
            {ready
              ? `Your ${planLabel(subscription?.plan)} membership is active. Your private dashboard can now surface up to five strong profile matches each day.`
              : loading
                ? "Your secure Razorpay authorization is being confirmed. This usually takes only a moment."
                : "There’s no need to pay again. Check your membership status or retry confirmation."}
          </p>
          {ready && date && (
            <p className="mt-5 rounded-xl bg-primary-soft px-4 py-3 text-sm font-semibold text-primary-deep">
              {subscription?.cancelAtPeriodEnd
                ? `Pro access ends ${date}`
                : subscription?.status === "trialing"
                  ? `First charge after ${date}`
                  : `Next renewal ${date}`}
            </p>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            {ready ? (
              <>
                <Link
                  href={profileReady ? "/dashboard" : "/profile"}
                  className="btn-primary"
                >
                  {profileReady
                    ? "Open my Pro dashboard"
                    : "Complete my match profile"}
                </Link>
                {!profileReady && (
                  <Link href="/dashboard" className="btn-secondary">
                    Open Pro dashboard
                  </Link>
                )}
              </>
            ) : (
              <button
                className="btn-primary"
                disabled={loading}
                onClick={() => {
                  setLoading(true);
                  setError(false);
                  setAttempt((value) => value + 1);
                }}
              >
                {loading ? "Confirming…" : "Retry confirmation"}
              </button>
            )}
            <Link href="/billing" className="btn-secondary">
              {ready ? "Manage Pro" : "Check membership"}
            </Link>
          </div>
          {ready && !profileReady && (
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Next: add your tech track, target role, three skills, experience
              and location or work mode. These signals help us find relevant
              roles; a subscription alone cannot create a strong match.
            </p>
          )}
          <p className="mt-6 text-xs leading-relaxed text-slate-500">
            Match scores describe relevance to your profile, not the likelihood
            of an interview or offer.
          </p>
        </div>
      </section>
    </div>
  );
}
