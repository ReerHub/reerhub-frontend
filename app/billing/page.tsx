import Link from "next/link";
import BillingControls from "@/components/BillingControls";
import { PLANS, resolvePlanId } from "@/lib/billing-plans";
import { FAQS } from "@/lib/billing-content";
import { safeJsonLd } from "@/lib/seo";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string | string[] }>;
}) {
  const initialPlan = resolvePlanId((await searchParams).plan);
  return (
    <div className="billing-page mx-auto max-w-5xl px-5 py-10 sm:py-16">
      <p className="mb-3 text-sm font-semibold text-primary">REERHUB Pro</p>
      <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-ink sm:text-5xl">
        Tech job matching plans and pricing
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
        Browse and apply for free. Pro adds a private shortlist ranked by your
        skills, preferences and verified experience requirements.
      </p>
      <section
        aria-labelledby="plan-comparison"
        className="mt-8 surface-panel p-5 sm:p-7"
      >
        <h2 id="plan-comparison" className="text-2xl font-semibold text-ink">
          Free discovery or personalized Pro
        </h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <h3 className="font-semibold">Free · INR 0</h3>
            <p className="mt-2 leading-7 text-slate-600">
              Official job details and Apply links are public. Create a free
              account for complete browsing, a saved shortlist and your profile.
            </p>
            <Link href="/jobs" className="btn-secondary mt-4">
              Browse jobs
            </Link>
          </div>
          <div>
            <h3 className="font-semibold">Pro · 7-day trial</h3>
            <p className="mt-2 leading-7 text-slate-600">
              Profile matches, Stretch roles and Needs review, with reasons and
              experience gaps. Daily emails contain up to five verified strong
              Profile matches. Scores are relevance, not hiring probability.
            </p>
            <Link href="/profile" className="btn-secondary mt-4">
              Complete your profile first
            </Link>
          </div>
        </div>
        <ul
          className="mt-6 grid gap-3 sm:grid-cols-3"
          aria-label="Subscription prices"
        >
          {PLANS.map((plan) => (
            <li key={plan.id} className="rounded-xl bg-slate-50 p-4">
              <h3 className="font-semibold">{plan.name}</h3>
              <p className="mt-2 text-xl font-bold">
                {plan.price}{" "}
                <span className="text-sm font-normal">{plan.per}</span>
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-slate-600">
          Prices are in Indian rupees (INR).
        </p>
        <p className="mt-5 text-sm leading-7 text-slate-600">
          Recurring plan charges start after the seven-day trial. Razorpay may
          collect a separate payment-method authorization amount. Review the
          amount at checkout. Cancel renewal on this page before the trial ends
          to prevent the first recurring charge. Subscription payments are
          non-refundable.
        </p>
      </section>
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQS.map(([question, answer]) => ({
              "@type": "Question",
              name: question,
              acceptedAnswer: { "@type": "Answer", text: answer },
            })),
          }),
        }}
      />
    </div>
  );
}
