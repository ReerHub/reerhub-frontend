export const metadata = {
  title: "Privacy Policy | ReerHub",
  description: "How ReerHub collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">
        Privacy Policy
      </h1>
      <p className="text-sm text-slate-500 mb-8">
        Last updated: September 2026
      </p>
      <div className="space-y-6 text-[15px] leading-relaxed text-slate-600">
        <section>
          <h2 className="font-bold text-slate-900 text-lg mb-2">
            What we collect
          </h2>
          <p>
            <strong>Account data:</strong> when you sign up we store your name,
            email address, password (hashed, never in plain text), and — if you
            use Google sign-in — your Google profile name, email, and avatar.
            <strong> Profile data:</strong> anything you add to your profile
            (headline, current role, track, skills, city, experience).
            <strong> Usage data:</strong> roles you save, pages you visit, and
            basic technical logs (IP address, browser type) for security and
            debugging.
          </p>
        </section>
        <section>
          <h2 className="font-bold text-slate-900 text-lg mb-2">
            How we use it
          </h2>
          <p>
            To run your account, personalize job recommendations, send
            verification and password-reset emails, keep the service secure, and
            improve ReerHub. We never sell your personal data and never share it
            with advertisers.
          </p>
        </section>
        <section>
          <h2 className="font-bold text-slate-900 text-lg mb-2">Cookies</h2>
          <p>
            We use strictly-necessary cookies to keep you logged in
            (`accessToken`, `refreshToken`), a CSRF token to protect forms, and
            a cookie-consent preference. There are no advertising or cross-site
            tracking cookies.
          </p>
        </section>
        <section>
          <h2 className="font-bold text-slate-900 text-lg mb-2">Your rights</h2>
          <p>
            You can download everything we store about you from Profile → Your
            data, update your profile at any time, and delete your account
            (including saved jobs) permanently from the same page. For any other
            request, email privacy@reerhub.com and we will respond within 30
            days.
          </p>
        </section>
        <section>
          <h2 className="font-bold text-slate-900 text-lg mb-2">
            Data retention
          </h2>
          <p>
            Account data is kept while your account is active and deleted when
            you delete your account. Security logs are retained for up to 90
            days. Job listings are public data from official company pages.
          </p>
        </section>
        <section>
          <h2 className="font-bold text-slate-900 text-lg mb-2">Contact</h2>
          <p>
            Questions about this policy: privacy@reerhub.com. If we make
            material changes, we will highlight them here and, where
            appropriate, notify you by email.
          </p>
        </section>
      </div>
    </div>
  );
}
