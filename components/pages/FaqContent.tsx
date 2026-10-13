import Link from "@/components/AppLink";
import PageHeader from "@/components/PageHeader";
import FaqControls from "@/components/FaqControls";
import { FAQ_CATEGORIES, faqSchema } from "@/lib/faq-content";
import { breadcrumb, safeJsonLd } from "@/lib/seo";
export default function FaqContent({
  memberView = false,
}: {
  memberView?: boolean;
}) {
  return (
    <div className="faq-page">
      <PageHeader
        title="Frequently asked questions."
        description="Clear answers for your next step—from official openings to your profile, matches, membership and privacy."
      />
      <div className="page-container faq-layout pb-16">
        <nav className="faq-categories" aria-label="FAQ categories">
          {FAQ_CATEGORIES.map((category) => (
            <a key={category.id} href={`#${category.id}`}>
              {category.title}
            </a>
          ))}
        </nav>
        <details className="faq-topics surface-panel">
          <summary>
            Browse FAQ topics <span aria-hidden="true">＋</span>
          </summary>
          <nav className="faq-categories" aria-label="FAQ topics">
            {FAQ_CATEGORIES.map((category) => (
              <a key={category.id} href={`#${category.id}`}>
                {category.title}
              </a>
            ))}
          </nav>
        </details>
        <div className="faq-answers">
          <FaqControls />
          {FAQ_CATEGORIES.map((category) => (
            <section
              key={category.id}
              id={category.id}
              aria-labelledby={`${category.id}-title`}
              className="faq-category"
            >
              <h2
                id={`${category.id}-title`}
                className="font-display text-2xl font-bold text-ink"
              >
                {category.title}
              </h2>
              <div className="mt-5 space-y-3">
                {category.items.map((faq) => (
                  <details
                    data-faq
                    key={faq.id}
                    id={faq.id}
                    className="surface-panel faq-answer"
                  >
                    <summary>
                      <h3>{faq.question}</h3>
                      <span aria-hidden="true">+</span>
                    </summary>
                    <p>{faq.answer}</p>
                    <a
                      className="faq-permalink"
                      href={`#${faq.id}`}
                      aria-label={`Link to: ${faq.question}`}
                    >
                      Link to this answer
                    </a>
                  </details>
                ))}
              </div>
            </section>
          ))}
          <div className="surface-panel p-6">
            <h2 className="text-xl font-bold">Still have a question?</h2>
            <p className="mt-3 leading-7 text-slate-600">
              We’re here to help you make your next move with confidence.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link className="btn-primary" href="/contact">
                Contact support
              </Link>
              <Link className="btn-secondary" href="/billing">
                Plans and billing
              </Link>
              <Link className="btn-secondary" href="/matching-methodology">
                Matching methodology
              </Link>
              <Link className="btn-secondary" href="/privacy">
                Privacy policy
              </Link>
              <Link className="btn-secondary" href="/terms">
                Terms of use
              </Link>
            </div>
          </div>
        </div>
      </div>
      {!memberView && (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: safeJsonLd(faqSchema()) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: safeJsonLd(
                breadcrumb([
                  { name: "Home", path: "/" },
                  { name: "Frequently asked questions", path: "/faq" },
                ]),
              ),
            }}
          />
        </>
      )}
    </div>
  );
}
