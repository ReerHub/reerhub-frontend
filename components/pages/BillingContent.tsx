import PublicPricing from "./PublicPricing";
import Link from "@/components/AppLink";
import BillingControls from "@/components/BillingControls";
import { resolvePlanId } from "@/lib/billing-plans";
import { FAQS } from "@/lib/billing-content";

export default async function BillingContent({
  searchParams,
  memberView = false,
}: {
  searchParams: Promise<{ plan?: string | string[] }>;
  memberView?: boolean;
}) {
  const initialPlan = resolvePlanId((await searchParams).plan);
  if (!memberView) return <PublicPricing initialPlan={initialPlan} />;
  return (
    <div className="billing-page mx-auto max-w-5xl px-5 py-10 sm:py-16">
      <p className="mb-3 text-sm font-semibold text-primary">REERHUB Pro</p>
      <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-ink sm:text-5xl">
        {memberView ? "Your membership" : "Tech job matching plans and pricing"}
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
        {memberView
          ? "Manage your plan, renewal and access to personalized matches."
          : "Browse and apply for free. Pro adds a private shortlist ranked by your skills, preferences and verified experience requirements."}
      </p>
      {memberView && (
        <p className="mt-5 text-sm leading-7 text-slate-600">
          Recurring plan charges start after the seven-day trial. Razorpay may
          collect a separate payment-method authorization amount. Review the
          amount at checkout. Cancel renewal before the trial ends to prevent
          the first recurring charge. Subscription payments are non-refundable.
        </p>
      )}
      <BillingControls key={initialPlan} initialPlan={initialPlan} />
      <section className="mt-12" aria-labelledby="billing-faq">
        <h2 id="billing-faq" className="text-2xl font-bold">
          Billing FAQ
        </h2>
        <div className="mt-5 space-y-3">
          {FAQS.map(([question, answer]) => (
            <details key={question} className="surface-panel p-5">
              <summary className="min-h-11 cursor-pointer font-semibold">
                {question}
              </summary>
              <p className="mt-3 leading-7 text-slate-600">{answer}</p>
            </details>
          ))}
        </div>
      </section>
      <p className="mt-7 text-sm text-slate-600">
        Questions?{" "}
        <a href="mailto:support@reerhub.com" className="underline">
          support@reerhub.com
        </a>
        . Read the{" "}
        <Link href="/terms#subscriptions" className="underline">
          subscription terms
        </Link>
        .
      </p>
    </div>
  );
}
