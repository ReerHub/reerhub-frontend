import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata(
  "Privacy Policy | REERHUB",
  "Learn how REERHUB collects and protects account and profile data, uses cookies, and handles your privacy choices while you discover tech jobs.",
  "/privacy",
);

export default function PrivacyPage() {
  return (
    <div className="legal-page">
      <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">
        Privacy Policy
      </h1>
      <p className="text-sm text-slate-500 mb-8">Last updated: October 2026</p>
      <div className="space-y-6 text-[15px] leading-relaxed text-slate-600">
        <section>
          <h2 className="font-bold text-slate-900 text-lg mb-2">
            Business identity
          </h2>
          <p>
            REERHUB is the public brand of REERHUB TECHNOLOGIES, a sole
            proprietorship. This policy covers the REERHUB service at
            reerhub.com.
          </p>
        </section>
        <section>
          <h2 className="font-bold text-slate-900 text-lg mb-2">
            What we collect
          </h2>
          <p>
            <strong>Account data:</strong> when you sign up we store your name,
            email address, sign-in provider, and — if you use Google sign-in —
            your Google profile name, email, and avatar.
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
            To run your account, personalize job recommendations, send secure
            sign-in and verification emails, keep the service secure, and
            improve REERHUB. We never sell your personal data and never share it
            with advertisers.
          </p>
        </section>
        <section>
          <h2 className="font-bold text-slate-900 text-lg mb-2">Cookies</h2>
          <p>
            We use strictly-necessary cookies to keep you logged in
            (`accessToken`, `refreshToken`), a CSRF token to protect forms, and
            a versioned privacy preference. Optional analytics through Google
            Tag Manager or Google Analytics 4 runs only with your explicit
            consent. Necessary-cookie choices from older versions never grant
            analytics consent. You can reject analytics, change preferences or
            withdraw using Privacy preferences on every page.
          </p>
          <p className="mt-4 leading-7 text-slate-600">
            With your consent, Google Tag Manager and Google Analytics measure
            visits to public pages and broad actions such as browsing jobs and
            viewing pricing. Analytics may use first-party cookies to recognize
            consenting browsers. Our pageview and product-event payloads omit
            search queries and URL fragments. Measurement stays off on member
            workspaces, sign-in, verification, profile and checkout screens. We
            do not send email addresses, profile contents, payment details or
            sign-in tokens as analytics event data. Google may process ordinary
            technical request information. Advertising signals are disabled.
            Analytics is optional and does not control product access.
          </p>
        </section>
        <section>
          <h2 className="font-bold text-slate-900 text-lg mb-2">Your rights</h2>
          <p>
            You can download everything we store about you from Profile → Your
            data, update your profile at any time, and delete your account
            (including saved jobs) permanently from the same page. For any other
            request, email support@reerhub.com and we will respond within 30
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
            Questions about this policy: support@reerhub.com. If we make
            material changes, we will highlight them here and, where
            appropriate, notify you by email.
          </p>
        </section>
      </div>
    </div>
  );
}
