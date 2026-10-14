import Link from "@/components/AppLink";
import Image from "next/image";
import Icon from "@/components/ui/Icon";
import BrandWordmark from "@/components/BrandWordmark";
import PrivacyPreferencesButton from "@/components/PrivacyPreferencesButton";
import SocialLinks from "@/components/SocialLinks";
const columns = [
  [
    "Discover",
    [
      ["/jobs", "All tech jobs"],
      ["/engineering-jobs", "Engineering"],
      ["/ai-jobs", "AI & machine learning"],
      ["/remote-jobs", "Remote roles"],
      ["/companies", "Companies"],
    ],
  ],
  [
    "Popular locations",
    [
      ["/bengaluru-jobs", "Bengaluru"],
      ["/hyderabad-jobs", "Hyderabad"],
      ["/pune-jobs", "Pune"],
      ["/chennai-jobs", "Chennai"],
      ["/delhi-jobs", "Delhi NCR"],
      ["/mumbai-jobs", "Mumbai"],
    ],
  ],
  [
    "Your REERHUB",
    [
      ["/dashboard", "Your dashboard"],
      ["/profile", "Profile & preferences"],
      ["/billing", "Pricing"],
      ["/about", "About REERHUB"],
      ["/blog", "Blog"],
      ["/how-it-works", "How it works"],
      ["/matching-methodology", "Matching methodology"],
      ["/contact", "Contact and help"],
      ["/faq", "Frequently asked questions"],
      ["mailto:support@reerhub.com", "Email support"],
      ["/privacy", "Privacy policy"],
      ["/terms", "Terms of use"],
    ],
  ],
];
export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="page-container">
        <div className="footer-link-grid grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link
              href="/"
              className="inline-flex min-h-11 max-w-full items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              aria-label="REERHUB home"
            >
              <Image
                src="/reerhub-icon-logo.png"
                width={40}
                height={40}
                alt=""
                className="shrink-0 rounded-lg bg-white p-0.5"
              />
              <BrandWordmark className="text-2xl text-white" />
            </Link>
            <p className="footer-note">
              For the work you want.
              <br />
              And the life you’re building.
            </p>
            <p className="mt-4 max-w-xs text-sm leading-7 text-slate-600">
              Real Effective Engineering Roles Hub
            </p>
            <div className="mt-5 inline-flex items-center gap-2 text-xs font-medium text-teal-800">
              <Icon name="shield" className="h-4 w-4" />
              Official sources. Direct applications.
            </div>
            <SocialLinks />
            <a
              href="https://www.trustpilot.com/review/reerhub.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Review us on Trustpilot (opens in a new tab)"
              className="mt-5 inline-flex min-h-[52px] max-w-full items-center justify-center gap-2 rounded-md border-2 border-[#00b67a] bg-white px-4 py-3 text-base font-medium text-[#191919] transition-colors hover:bg-[#f0fff9] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#00b67a]"
            >
              <span>Review us on</span>
              <Image
                src="/trustpilot-review-logo.svg"
                width={110}
                height={27}
                alt="Trustpilot"
                className="shrink-0"
              />
            </a>
          </div>
          {columns.map(([title, links]) => (
            <nav key={title} aria-label={title}>
              <h2 className="mb-4 text-sm font-bold text-ink">{title}</h2>
              <ul className="space-y-1">
                {links.map(([href, label]) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="inline-flex min-h-9 items-center text-sm text-slate-600 transition-colors hover:text-primary"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="footer-bottom flex flex-col items-start justify-between gap-3 py-6 text-xs sm:flex-row">
          <div className="flex flex-wrap gap-6">
            <Link href="/terms">Terms of use</Link>
            <Link href="/privacy">Privacy policy</Link>
            <PrivacyPreferencesButton />
            <Link href="/contact">Help & support</Link>
            <Link href="/about">About ReerHub</Link>
            <Link href="/matching-methodology">How matching works</Link>
          </div>
          <div className="footer-copyright sm:text-right">
            <p>
              © {new Date().getFullYear()} REERHUB TECHNOLOGIES. All rights
              reserved.
            </p>
          </div>
        </div>
        <div className="footer-wordmark" aria-hidden="true">
          <BrandWordmark />
        </div>
      </div>
    </footer>
  );
}
