import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  ArrowRight,
  FileText,
  Layers,
  Sparkles,
} from "lucide-react";
import JobsPromotion from "@/components/resume/JobsPromotion";
import Brand from "@/components/resume/Brand";
import {
  publicMetadata,
  safeJsonLd,
  applicationSchema,
  faqSchema,
  RESUME_FAQS,
  SITE,
  publisher,
} from "@/lib/resume/seo";
export const metadata = publicMetadata(
  "Free resume builder for tech careers",
  "Create your resume with three free templates, live preview and watermark-free PDF downloads. No sign-up needed. Save versions with your REERHUB account.",
  "/",
);
export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd([
            applicationSchema,
            faqSchema,
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "@id": `${SITE}/#website`,
              name: "REERHUB Resume Builder",
              url: SITE,
              publisher,
            },
          ]),
        }}
      />
      <main id="main-content">
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="dot" /> A NEW CHAPTER, BY YOU
            </span>
            <h1>
              Your experience.
              <br />
              Beautifully
              <br />
              <em>put together.</em>
            </h1>
            <p>
              Create a resume you’re proud to send—and tailor it to your next
              role. Thoughtful tools for wherever you are in your tech career.
            </p>
            <div className="hero-actions">
              <Link className="button primary" href="/resume/editor">
                Build my resume <ArrowRight size={18} />
              </Link>
              <Link className="text-link" href="/resume/templates">
                Find your template <ArrowUpRight size={16} />
              </Link>
            </div>
            <div className="fine-benefits">
              <span>
                <Check size={14} /> Free PDF downloads
              </span>
              <span>
                <Check size={14} /> No sign-up needed
              </span>
            </div>
          </div>
          <div className="hero-art" aria-label="Illustrative resume example">
            <div className="orbit-label">
              <span className="mint-square">
                <Check size={16} />
              </span>{" "}
              A little clarity. A lot of possibility.
            </div>
            <div className="resume-sheet">
              <div className="sheet-kicker">SOFTWARE ENGINEER</div>
              <h2>
                Alex Morgan<span>.</span>
              </h2>
              <p className="sheet-contact">
                Bengaluru, India · alex@example.com
              </p>
              <div className="sheet-rule" />
              <h3>PROFILE</h3>
              <p>
                Thoughtful engineer building reliable software.
                <br />
                Curious by nature. Collaborative by choice.
              </p>
              <h3>EXPERIENCE</h3>
              <b>Software Engineer</b>
              <p className="sheet-muted">Example Company · 2023 — Present</p>
              <ul>
                <li>Built accessible interfaces with React and TypeScript.</li>
                <li>Partnered with design to simplify complex workflows.</li>
              </ul>
              <h3>SELECTED PROJECTS</h3>
              <b>Campus resource exchange</b>
              <p>A searchable directory connecting students to resources.</p>
              <h3>TOOLKIT</h3>
              <p>TypeScript / React / Node.js / SQL / Git</p>
              <span className="example-stamp">ILLUSTRATIVE EXAMPLE</span>
            </div>
            <div className="art-note">
              <Sparkles size={17} />
              <span>
                Made to feel like <strong>you.</strong>
              </span>
            </div>
            <span className="art-caption">
              A clean page. A clearer next step.
            </span>
          </div>
        </section>
        <section className="trust-strip">
          <span>YOUR STORY. YOUR NEXT STEP.</span>
          <p>Designed for the work you want to do.</p>
          <div>
            <span>Students</span>
            <span>Career changers</span>
            <span>Experienced builders</span>
          </div>
        </section>
        <section className="intro-section">
          <div>
            <span className="eyebrow">LESS FORMATTING. MORE FORWARD.</span>
            <h2>
              Make room for
              <br />
              what matters.
            </h2>
          </div>
          <p>
            Your experience deserves more than a blank document and a blinking
            cursor. Bring the facts. We’ll help you put them in a clear,
            considered shape.
          </p>
        </section>
        <section className="feature-grid">
          <article>
            <span className="feature-icon">
              <FileText />
            </span>
            <h3>A great first impression.</h3>
            <p>
              Three carefully made templates. Clear hierarchy, considered
              spacing and room for your experience.
            </p>
          </article>
          <article>
            <span className="feature-icon mint">
              <Layers />
            </span>
            <h3>Every version, in reach.</h3>
            <p>
              Build without an account. Sign in when you’re ready to save,
              duplicate and keep versions for different roles.
            </p>
          </article>
          <article>
            <span className="feature-icon peach">
              <Sparkles />
            </span>
            <h3>A clearer next draft.</h3>
            <p>
              Review your resume for unfinished details and compare tech terms
              against a job description. Free, private and on your device.
            </p>
          </article>
        </section>
        <JobsPromotion jobsUrl="" />
        <section className="resume-faq" aria-labelledby="resume-faq-heading">
          <span className="eyebrow">A LITTLE CLARITY BEFORE YOU START</span>
          <h2 id="resume-faq-heading">Your questions. Answered.</h2>
          {RESUME_FAQS.map(({ question, answer }) => (
            <details key={question}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
        </section>
        <section className="closing">
          <span className="eyebrow">THE NEXT CHAPTER IS YOURS.</span>
          <h2>Let’s put it on paper.</h2>
          <Link className="button dark" href="/resume/editor">
            Create my resume <ArrowRight size={18} />
          </Link>
          <p>Free to build. Free to download. Always your words.</p>
        </section>
      </main>
      <footer>
        <Brand />
        <span>A REERHUB TECHNOLOGIES product</span>
        <nav>
          <Link href="/jobs">
            Explore jobs <ArrowUpRight size={13} />
          </Link>
          <Link href="/resume/privacy">Privacy</Link>
          <a href="mailto:support@reerhub.com">Get in touch</a>
        </nav>
      </footer>
    </>
  );
}
