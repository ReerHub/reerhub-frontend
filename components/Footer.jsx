import Link from "next/link";
import Image from "next/image";
import Icon from "@/components/ui/Icon";
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
    "Your ReerHub",
    [
      ["/dashboard", "Your dashboard"],
      ["/profile", "Profile & preferences"],
      ["/billing", "Explore ReerHub Pro"],
      ["/privacy", "Privacy policy"],
      ["/terms", "Terms of use"],
      ["mailto:hello@reerhub.com", "Contact support"],
    ],
  ],
];
export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="page-container">
        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link
              href="/"
              className="inline-flex max-w-full rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              aria-label="ReerHub home"
            >
              <Image
                src="/reerhub-sticker-logo-text.png"
                width={2172}
                height={724}
                alt=""
                className="h-auto w-[240px] max-w-full rounded-lg"
              />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-7 text-slate-600">
              Find your next role where it actually lives. Official tech
              openings, and a clearer way to choose what’s next.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 text-xs font-medium text-teal-800">
              <Icon name="shield" className="h-4 w-4" />
              Official sources. Direct applications.
            </div>
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
        <div className="footer-bottom flex flex-col justify-between gap-3 py-6 text-xs sm:flex-row">
          <div className="flex gap-6">
            <Link href="/terms">Terms of use</Link>
            <Link href="/privacy">Privacy policy</Link>
          </div>
          <p>© {new Date().getFullYear()} ReerHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
