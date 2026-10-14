import Link from "@/components/AppLink";
import ContactForm from "@/components/ContactForm";
import { pageMetadata } from "@/lib/seo";
import styles from "@/components/pages/PublicPages.module.css";
export const metadata = pageMetadata(
  "Contact REERHUB Support",
  "Get help with ReerHub job listings, your account, Pro membership or privacy. Send a message to our support team or explore useful answers.",
  "/contact",
);
export default function ContactPage() {
  return (
    <article className={styles.page}>
      <header className={styles.hero}>
        <p>LET’S TALK</p>
        <h1>
          A real person.<span>A little help.</span>
        </h1>
        <p>
          A question, a correction, or an idea worth sharing? Tell us what’s on
          your mind. We’ll help you find the next step.
        </p>
      </header>
      <div className={styles.contactBody}>
        <ContactForm />
        <aside className={styles.supportAside}>
          <section>
            <h2>Talk to ReerHub</h2>
            <p>
              For listing corrections, account help, membership questions and
              product feedback.
            </p>
            <a href="mailto:support@reerhub.com">support@reerhub.com</a>
          </section>
          <section>
            <h2>A little clarity, right away.</h2>
            <p>Our FAQs cover discovery, matching, accounts and billing.</p>
            <Link href="/faq">Read the FAQs ↗</Link>
          </section>
          <section>
            <h2>Your membership</h2>
            <p>Review your plan, checkout status or cancellation options.</p>
            <Link href="/billing">Pricing and membership ↗</Link>
          </section>
          <section>
            <h2>How matching works</h2>
            <p>
              Understand source verification, match reasons and what relevance
              scores mean.
            </p>
            <Link href="/matching-methodology">Read our methodology ↗</Link>
          </section>
          <p>
            Operated by REERHUB TECHNOLOGIES. Employers handle applications
            directly; we cannot confirm their selection decisions.
          </p>
        </aside>
      </div>
    </article>
  );
}
