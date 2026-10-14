import Link from "@/components/AppLink";
import LiveMatchingExample from "@/components/LiveMatchingExample";
import MatchJourney from "@/components/MatchJourney";
import { HomeAccountAction } from "@/components/HomeAccountAction";
import { getHome, DataUnavailableError } from "@/lib/reerhub";
import styles from "./HowItWorks.module.css";

const steps = [
  {
    number: "01",
    access: "Free discovery",
    title: "Start with an opening, not a guess.",
    body: "Explore technical roles with confirmed India eligibility. Guests can preview listings, read full job details and follow the official application link for free. A free account unlocks complete browsing.",
    href: "/jobs",
    action: "Explore current openings",
  },
  {
    number: "02",
    access: "Free account",
    title: "Make room for your own direction.",
    body: "Set your track, skills, experience and location preferences. Save roles you want to revisit. Your profile stays inside your account; the demonstration below uses fictional profiles.",
    href: "/profile",
    action: "Build your profile",
  },
  {
    number: "03",
    access: "Pro matching",
    title: "Understand what fits—and what needs a closer look.",
    body: "Pro ranks current roles by profile relevance. Profile matches meet the verified experience requirement; Stretch roles have an explicit experience gap, and Needs review flags requirements that need interpretation. The main Profile matches list uses a 75% relevance minimum.",
    href: "/matching-methodology",
    action: "Read the matching methodology",
  },
  {
    number: "04",
    access: "Free applications",
    title: "Take the next step directly.",
    body: "Read the full employer description, review the source and observation dates, and apply on the employer’s official website. ReerHub does not submit an application for you or guarantee an interview or offer.",
    href: "/companies",
    action: "Explore the companies",
  },
  {
    number: "05",
    access: "Pro daily shortlists",
    title: "A little direction, delivered.",
    body: "Pro can send one daily email with up to five verified strong-fit roles when available. No qualifying new matches means no match email. You can pause these emails, and your dashboard remains the place to explore your full recommendations.",
    href: "/billing",
    action: "Explore Pro plans",
  },
];

export default async function HowItWorksContent() {
  const data = await getHome().catch((error: unknown) => {
    if (error instanceof DataUnavailableError) return null;
    throw error;
  });
  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div className="page-container">
          <p className={styles.eyebrow}>A LITTLE CLARITY GOES A LONG WAY</p>
          <h1>
            Less searching.
            <br />
            <span>More direction.</span>
          </h1>
          <p className={styles.intro}>
            From your first discovery to a shortlist that feels more like you.
            Here’s how ReerHub helps you take the next step.
          </p>
          <div className={styles.actions}>
            <Link href="#live-demo" className="btn-primary">
              Try the matching demo <span aria-hidden="true">↓</span>
            </Link>
            <Link href="/jobs" className="btn-secondary">
              Explore jobs
            </Link>
          </div>
          <p className={styles.heroNote}>
            Free to browse and apply. Pro adds personalized recommendations.
          </p>
        </div>
      </header>
      <div className={`page-container ${styles.content}`}>
        <section aria-labelledby="journey-title">
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>YOUR NEXT MOVE, MADE CLEARER</p>
            <h2 id="journey-title">A path you can make your own.</h2>
          </div>
          <div className={styles.steps}>
            {steps.map((step) => (
              <article key={step.number} className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">
                  {step.number}
                </span>
                <div>
                  <p className={styles.access}>{step.access}</p>
                  <h3>{step.title}</h3>
                  <p className={styles.stepBody}>{step.body}</p>
                  <Link href={step.href}>
                    {step.action} <span aria-hidden="true">↗</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section
          id="live-demo"
          className={styles.demo}
          aria-labelledby="demo-title"
        >
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>SEE THE REASONS, NOT JUST A NUMBER</p>
            <h2 id="demo-title">
              A sample profile.
              <br />A real possibility.
            </h2>
            <p>
              Try a fictional profile against current openings. The same backend
              scoring engine supplies the evidence; no member data is shown.
            </p>
          </div>
          <div className={styles.demoGrid}>
            <LiveMatchingExample examples={data?.matchingExamples} />
            <aside className={styles.demoNotes}>
              <p className={styles.access}>What this example tells you</p>
              <h3>Perspective for your next step.</h3>
              <ul>
                <li>
                  <strong>Relevance, not probability.</strong> A score helps you
                  prioritize reading. It does not predict a hiring outcome.
                </li>
                <li>
                  <strong>Experience has its own check.</strong> A high score
                  does not mean every employer requirement is satisfied.
                </li>
                <li>
                  <strong>Real openings change.</strong> A sample may have no
                  verified match at 75% or above. That is an honest result.
                </li>
                <li>
                  <strong>Your profile makes it personal.</strong> Pro
                  recommendations depend on your saved preferences and the
                  current catalog.
                </li>
              </ul>
              <Link href="/matching-methodology">
                Understand the evidence <span aria-hidden="true">↗</span>
              </Link>
            </aside>
          </div>
        </section>
        <section
          className={styles.motionSection}
          aria-labelledby="motion-title"
        >
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>THE BIG PICTURE</p>
            <h2 id="motion-title">From openings to your shortlist.</h2>
            <p>
              This animated scene illustrates the workflow. Its movement is a
              product demonstration; actual scores and reasons come from the
              live example above.
            </p>
          </div>
          <MatchJourney companies={data?.companies || []} />
        </section>
        <section className={styles.closing} aria-labelledby="next-step-title">
          <p className={styles.eyebrow}>START WHERE YOU ARE</p>
          <h2 id="next-step-title">
            Your next chapter starts
            <br />
            with one clear step.
          </h2>
          <p>
            Explore the openings. Save the ones that matter. Add Pro when you
            want a more personal shortlist.
          </p>
          <div className={styles.actions}>
            <HomeAccountAction
              className="btn-primary"
              guest="Create a free account"
            />
            <Link href="/billing" className="btn-secondary">
              Compare Free and Pro
            </Link>
          </div>
          <Link href="/faq" className={styles.faqLink}>
            Questions? Find clear answers in our FAQ ↗
          </Link>
        </section>
      </div>
    </div>
  );
}
