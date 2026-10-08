"use client";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import { updateMe, type AuthUser } from "@/lib/auth";
import { useAuth } from "@/components/AuthProvider";
import { membershipDate, planLabel } from "@/lib/membership";
import Icon from "@/components/ui/Icon";
export default function MembershipStatus({ user }: { user: AuthUser }) {
  const { refresh } = useAuth();
  const [busy, setBusy] = useState(false);
  const sub = user.membership?.subscription;
  if (!sub || !user.membership?.isPro) return null;
  const date = membershipDate(sub);
  const paused = user.notificationPreferences?.digest === "paused";
  return (
    <section
      className="membership-card rounded-2xl bg-ink p-6 text-white"
      aria-labelledby="membership-title"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-blue-200">
            <Icon name="spark" className="h-4 w-4" />
            {sub.status === "trialing" ? "Pro trial active" : "Pro active"}
          </p>
          <h2
            id="membership-title"
            className="text-xl font-bold tracking-tight"
          >
            {planLabel(sub.plan)}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            {sub.cancelAtPeriodEnd || sub.cancelledAt
              ? `Renewal cancelled. Access continues until ${date || "the end of your period"}.`
              : `${sub.status === "trialing" ? "Trial ends" : "Next renewal"} ${date || "at your scheduled billing date"}.`}
          </p>
        </div>
        <Link
          href="/billing"
          className="inline-flex min-h-11 items-center rounded-lg border border-white/20 px-4 text-sm font-semibold text-white hover:bg-white/10"
        >
          Manage Pro
        </Link>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/15 pt-4">
        <p className="flex items-center gap-2 text-sm text-slate-300">
          <Icon name="mail" className="h-4 w-4" />
          {paused
            ? "Daily match emails paused"
            : "Daily emails · up to 5 strong matches"}
        </p>
        <button
          className="min-h-11 rounded-lg px-3 text-xs font-semibold text-blue-200 hover:bg-white/10 disabled:opacity-50"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await updateMe({
                notificationPreferences: {
                  digest: paused ? "daily" : "paused",
                },
              });
              await refresh();
              toast.success(
                paused
                  ? "Daily match emails resumed"
                  : "Emails paused. Dashboard matches stay available.",
              );
            } catch {
              toast.error("Could not update email preferences");
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? "Updating…" : paused ? "Resume emails" : "Pause emails"}
        </button>
      </div>
    </section>
  );
}
