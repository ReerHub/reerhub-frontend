import Link from "next/link";
import UsagePreferences from "@/components/resume/UsagePreferences";
import Brand from "@/components/resume/Brand";
import { publicMetadata, safeJsonLd, breadcrumb } from "@/lib/resume/seo";
export const metadata = publicMetadata(
  "Resume privacy and data controls",
  "Learn how device drafts, cloud resumes, optional AI processing and privacy choices work in REERHUB Resume Builder.",
  "/privacy",
);
export default function Privacy() {
  return (
    <>
      <header className="marketing-nav">
        <Brand />
        <Link href="/resume/editor">Back to the builder</Link>
      </header>
      <main id="main-content" className="prose">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLd(breadcrumb("Privacy", "/privacy")),
          }}
        />
        <nav className="public-breadcrumb" aria-label="Breadcrumb">
          <Link href="/resume">Resume Builder</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Privacy</span>
        </nav>
        <h1>
          Your resume.
          <br />
          Your control.
        </h1>
        <h2>Guest drafts stay on this device</h2>
        <p>
          The editor stores your guest draft in this browser. Anyone using the
          same browser may be able to access it. Use Clear device draft when you
          finish on a shared device. PDF downloads are generated in your
          browser.
        </p>
        <h2>Cloud resumes belong to your account</h2>
        <p>
          Signing in uses your existing REERHUB account. A guest draft is
          uploaded only when you choose Save to my account. Saved resumes and
          named versions are stored with the REERHUB service and remain
          available if Pro expires. Delete resumes from your library. REERHUB
          account deletion removes associated resume documents and AI usage
          records; your account data export includes cloud resumes.
        </p>
        <h2>Writing assistance is optional</h2>
        <p>
          When available, paid assistance sends the selected writing and, for
          tailoring, your pasted job description to an external AI service.
          Structured contact fields are excluded and email addresses, phone
          numbers and web links are redacted from submitted text. Review the
          content before sending: free text may still contain personal
          information. The service, model and privacy terms will be disclosed
          before activation and first use. You review suggestions before
          applying them.
        </p>
        <h2>Private work stays private</h2>
        <p>
          The editor and library are excluded from search indexing. Resume
          content is not sent to analytics or recorded in application logs.
          There are no public resume links in this release.
        </p>
        <p>
          Questions?{" "}
          <a href="mailto:support@reerhub.com">support@reerhub.com</a>.{" "}
          <a href="https://reerhub.com/privacy">REERHUB privacy policy</a>.
        </p>
        <UsagePreferences />
      </main>
    </>
  );
}
