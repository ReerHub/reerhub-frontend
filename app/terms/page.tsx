import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata(
  "Terms of Service | ReerHub",
  "Read the terms for ReerHub job discovery and Pro subscriptions, including trials, non-refundable payments, cancellation and remaining Pro access.",
  "/terms",
);

export default function TermsPage() {
  return (
    <div className="legal-page">
      <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">
        Terms of Service
      </h1>
      <p className="text-sm text-slate-500 mb-8">Last updated: October 2026</p>
      <div className="space-y-6 text-[15px] leading-relaxed text-slate-600">
        <section>
          <h2 className="font-bold text-slate-900 text-lg mb-2">
            What ReerHub is
          </h2>
          <p>
            ReerHub is a job-discovery service. We index publicly listed tech
            roles from official company career pages and link you to the
            company&apos;s own application page. We do not host applications,
            guarantee listings are current, or act as a recruiter or employer.
          </p>
        </section>
        <section>
          <h2 className="font-bold text-slate-900 text-lg mb-2">
            Your account
          </h2>
          <p>
            You must provide accurate information, keep your sign-in links and
            account secure, and be at least 16 years old. One account per
            person. We may suspend accounts that abuse the service (spam,
            scraping, automated account creation, or attempts to breach
            security).
          </p>
        </section>
        <section>
          <h2 className="font-bold text-slate-900 text-lg mb-2">
            Acceptable use
          </h2>
          <p>
            Don&apos;t misuse the service: no scraping at abusive rates, no
            reverse-engineering access controls, no uploading unlawful content,
            and no misrepresenting your identity to companies you apply to.
          </p>
        </section>
        <section>
          <h2 className="font-bold text-slate-900 text-lg mb-2">Job content</h2>
          <p>
            Listings belong to the hiring companies. Always verify details on
            the official application page before applying — roles may change or
            close without notice.
          </p>
        </section>
        <section>
          <h2 className="font-bold text-slate-900 text-lg mb-2">Liability</h2>
          <p>
            ReerHub is provided &quot;as is&quot;. To the maximum extent
            permitted by law, we are not liable for hiring outcomes, missed
            opportunities, or reliance on listing data.
          </p>
        </section>
        <section id="subscriptions" className="scroll-mt-24">
          <h2 className="font-bold text-slate-900 text-lg mb-2">
            Pro subscriptions, cancellation & refunds
          </h2>
          <p>
            Pro costs ₹49 per week, ₹149 per month, or ₹299 every three months.
            Each plan starts with a seven-day trial. After the trial, your
            selected plan renews automatically through Razorpay until you cancel
            renewal or the subscription completes its scheduled billing cycles.
          </p>
          <p className="mt-3">
            Subscription payments are non-refundable. We do not provide refunds
            or credits for unused days or partial billing periods. Cancelling
            stops future renewals; your Pro access continues until the current
            paid period ends. Cancelling during your trial prevents the first
            recurring subscription charge, and trial access continues until its
            stated end date.
          </p>
          <p className="mt-3">
            Razorpay may collect a separate payment-method authorization amount
            during setup. Any reversal of that authorization is handled by
            Razorpay and your payment provider; it is not a refund of a ReerHub
            subscription fee. Review the amount shown before authorizing
            checkout.
          </p>
          <p className="mt-3">
            Cancel through Billing → Cancel renewal. The confirmation shows when
            Pro access ends. For billing errors or help, contact{" "}
            <a
              href="mailto:hello@reerhub.com"
              className="text-primary underline"
            >
              hello@reerhub.com
            </a>
            . This policy does not limit rights that cannot be excluded under
            applicable law.
          </p>
        </section>
        <section>
          <h2 className="font-bold text-slate-900 text-lg mb-2">
            Changes & contact
          </h2>
          <p>
            We may update these terms; material changes will be highlighted
            here. Continued use after changes means you accept them. Contact:
            <a
              href="mailto:hello@reerhub.com"
              className="text-primary underline"
            >
              hello@reerhub.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
