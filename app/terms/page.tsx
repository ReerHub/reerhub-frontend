export const metadata = {
  title: "Terms of Service | ReerHub",
  description: "The rules for using ReerHub.",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">
        Terms of Service
      </h1>
      <p className="text-sm text-slate-500 mb-8">
        Last updated: September 2026
      </p>
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
            You must provide accurate information, keep your password secret,
            and be at least 16 years old. One account per person. We may suspend
            accounts that abuse the service (spam, scraping, automated account
            creation, or attempts to breach security).
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
        <section>
          <h2 className="font-bold text-slate-900 text-lg mb-2">
            Changes & contact
          </h2>
          <p>
            We may update these terms; material changes will be highlighted
            here. Continued use after changes means you accept them. Contact:
            hello@reerhub.com.
          </p>
        </section>
      </div>
    </div>
  );
}
