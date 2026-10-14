import Link from "@/components/AppLink";
import BillingControls from "@/components/BillingControls";
import { FAQS } from "@/lib/billing-content";
import type { PlanId } from "@/lib/billing-plans";
import styles from "./PublicPages.module.css";
export default function PublicPricing({
  initialPlan,
}: {
  initialPlan: PlanId;
}) {
  return (
    <article className={`${styles.page} billing-page`}>
      <header className={styles.hero}>
        <p>PRICING</p>
        <h1>
          Explore freely.<span>Find your direction with Pro.</span>
        </h1>
        <p>
          Official openings and direct applications are free. Pro adds
          personalized recommendations, clear match reasons and a daily
          shortlist when strong matches are available.
        </p>
      </header>
      <div className={styles.pricingContent}>
        <section
          className={styles.freeCard}
          aria-labelledby="free-discovery-title"
        >
          <div>
            <h2 id="free-discovery-title">
              Free discovery. Always a good starting point.
            </h2>
            <p>
              INR 0. Read official job details and apply directly. A free
              account adds complete browsing, saved roles and your profile.
            </p>
          </div>
          <Link href="/jobs" className="btn-secondary">
            Browse free jobs ↗
          </Link>
        </section>
        <BillingControls
          key={initialPlan}
          initialPlan={initialPlan}
          publicPricing
        />
        <p className="mt-5 text-sm leading-7 text-slate-600">
          Recurring charges start after the seven-day trial. Razorpay may
          collect a separate payment-method authorization amount; review it at
          checkout. Cancel renewal before the trial ends to prevent the first
          recurring charge. Subscription payments are non-refundable. Prices are
          in Indian rupees (INR).
        </p>
        <section
          className={styles.comparison}
          aria-labelledby="plan-comparison"
        >
          <h2 id="plan-comparison">A clear view of what’s included.</h2>
          <table>
            <thead>
              <tr>
                <th scope="col">Your search</th>
                <th scope="col">Free</th>
                <th scope="col">Pro</th>
              </tr>
            </thead>
            <tbody>
              {[
                [
                  "Official job details and Apply links",
                  "Included",
                  "Included",
                ],
                [
                  "Complete browsing, filters and saved roles",
                  "With a free account",
                  "Included",
                ],
                [
                  "Profile and matching preferences",
                  "With a free account",
                  "Included",
                ],
                [
                  "Private profile-ranked recommendations",
                  "Not included",
                  "Included",
                ],
                [
                  "Match reasons and experience gaps",
                  "Not included",
                  "Included",
                ],
                [
                  "Daily match email",
                  "Not included",
                  "Up to five verified strong Profile matches, when available and enabled",
                ],
              ].map(([feature, free, pro]) => (
                <tr key={feature}>
                  <th scope="row">{feature}</th>
                  <td>{free}</td>
                  <td>{pro}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Every Pro billing cycle includes the same features. Scores indicate
            relevance, not a hiring probability. Recommendations depend on your
            profile and available openings.
          </p>
        </section>
        <section className={styles.faq} aria-labelledby="billing-faq">
          <h2 id="billing-faq">A few billing questions.</h2>
          {FAQS.map(([question, answer]) => (
            <details key={question}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
        </section>
        <div className={styles.closing}>
          <p>
            Find the right starting point for your search.
            <br />
            Review our{" "}
            <Link href="/terms#subscriptions" className="underline">
              subscription terms
            </Link>{" "}
            before checkout.
          </p>
          <Link href="/contact" className="btn-secondary">
            Talk to us ↗
          </Link>
        </div>
      </div>
    </article>
  );
}
