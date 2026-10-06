import type { AuthUser, BillingState } from "@/lib/auth";

export const isPro = (user: AuthUser | null | undefined) =>
  Boolean(user?.membership?.isPro);

export const planLabel = (plan?: string) =>
  ({
    "pro-weekly": "Pro Weekly",
    "pro-monthly": "Pro Monthly",
    "pro-quarterly": "Pro Quarterly",
  })[plan || ""] || "ReerHub Pro";

export const membershipDate = (subscription?: BillingState["subscription"]) => {
  if (!subscription) return null;
  const date =
    subscription.status === "trialing"
      ? subscription.trialEndsAt
      : subscription.currentPeriodEndsAt;
  return date
    ? new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;
};
