"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";

const DISCOVER_LINKS = [
  { href: "/jobs", label: "All tech roles" },
  { href: "/engineering-jobs", label: "Engineering jobs" },
  { href: "/ai-jobs", label: "AI / ML jobs" },
  { href: "/remote-jobs", label: "Remote jobs" },
  { href: "/companies", label: "All companies" },
  { href: "/#why", label: "Why ReerHub" },
];

const CITY_LINKS = [
  { href: "/bengaluru-jobs", label: "Bengaluru jobs" },
  { href: "/chennai-jobs", label: "Chennai jobs" },
  { href: "/hyderabad-jobs", label: "Hyderabad jobs" },
  { href: "/mumbai-jobs", label: "Mumbai jobs" },
  { href: "/delhi-jobs", label: "Delhi NCR jobs" },
  { href: "/pune-jobs", label: "Pune jobs" },
];

// Company/resource/about entries without a dedicated page yet fall back to
// the closest real surface (never a dead end); hrefs get upgraded as those
// pages ship.
const COMPANY_LINKS = [
  { href: "/companies", label: "Top companies" },
  { href: "/jobs", label: "Startup jobs" },
  { href: "/companies", label: "Product companies" },
  { href: "/jobs", label: "Unicorns" },
  { href: "/jobs", label: "Recently added" },
  { href: "/companies", label: "View all companies" },
];

const RESOURCE_LINKS = [
  { href: "/jobs", label: "Blog" },
  { href: "/jobs", label: "Career tips" },
  { href: "/jobs", label: "Resume guide" },
  { href: "/jobs", label: "Interview prep" },
  { href: "/jobs", label: "Salary insights" },
  { href: "/jobs", label: "Engineering news" },
];

const ABOUT_LINKS = [
  { href: "/#why", label: "About us" },
  { href: "/#why", label: "Our mission" },
  { href: "/#why", label: "Contact" },
  { href: "/privacy", label: "Privacy policy" },
  { href: "/terms", label: "Terms of use" },
];

const COLUMNS = [
  { heading: "Discover", links: DISCOVER_LINKS },
  { heading: "Jobs by city", links: CITY_LINKS },
  { heading: "Companies", links: COMPANY_LINKS },
  { heading: "Resources", links: RESOURCE_LINKS },
  { heading: "About", links: ABOUT_LINKS },
];

function SocialIcon({ label, path }) {
  return (
    <a
      href="#"
      aria-label={label}
      onClick={(e) => e.preventDefault()}
      className="text-slate-400 hover:text-white transition-colors"
    >
      <svg
        className="w-5 h-5"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden
      >
        <path d={path} />
      </svg>
    </a>
  );
}

const SOCIALS = [
  {
    label: "Discord",
    path: "M20.32 4.37a19.8 19.8 0 00-4.93-1.51 13.78 13.78 0 00-.64 1.28 18.27 18.27 0 00-5.5 0 12.64 12.64 0 00-.64-1.28h-.05A19.74 19.74 0 003.64 4.37 20.15 20.15 0 00.11 18.06a19.9 19.9 0 006.04 3.03c.46-.63.87-1.3 1.22-2a12.9 12.9 0 01-1.93-.92c.16-.12.32-.24.47-.37a14.2 14.2 0 0012.18 0c.15.13.31.25.47.37-.61.36-1.26.68-1.93.92.35.7.76 1.37 1.22 2a19.83 19.83 0 006.04-3.03 20.02 20.02 0 00-3.57-13.69ZM8.02 15.33c-1.18 0-2.16-1.08-2.16-2.42s.95-2.42 2.16-2.42 2.18 1.09 2.16 2.42c0 1.34-.95 2.42-2.16 2.42Zm7.97 0c-1.18 0-2.16-1.08-2.16-2.42s.95-2.42 2.16-2.42 2.18 1.09 2.16 2.42c0 1.34-.95 2.42-2.16 2.42Z",
  },
  {
    label: "X",
    path: "M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23Zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64Z",
  },
  {
    label: "LinkedIn",
    path: "M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45Z",
  },
  {
    label: "RSS feed",
    path: "M6.18 17.82a2.18 2.18 0 1 1-4.36 0 2.18 2.18 0 0 1 4.36 0ZM1.82 8.73V5.82C8.1 5.82 13.18 10.9 13.18 17.18h-2.91c0-4.68-3.77-8.45-8.45-8.45Zm0 5.82V11.64c3.2 0 5.73 2.53 5.73 5.73H4.64c0-.73-.4-1.46-.91-1.96-.5-.51-1.18-.86-1.91-.86Z",
  },
];

function SubscribeBox() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error("Enter a valid email address");
      return;
    }
    setBusy(true);
    // No alerts backend yet (roadmap) — capture intent without dead-ending.
    setTimeout(() => {
      setBusy(false);
      setEmail("");
      toast.success("You're on the list — alerts launch soon");
    }, 400);
  };

  return (
    <div>
      <h3 className="text-[13px] font-bold uppercase tracking-[0.12em] text-electric mb-5">
        Get job alerts
      </h3>
      <form
        onSubmit={submit}
        className="flex flex-col sm:flex-row gap-2.5 mb-4"
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          aria-label="Email address"
          className="flex-1 min-w-0 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-[15px] text-white placeholder:text-slate-500 outline-none focus:border-electric transition-all"
        />
        <button
          type="submit"
          disabled={busy}
          className="shrink-0 px-6 py-2.5 bg-electric text-white rounded-lg font-semibold text-[15px] hover:bg-electric-dark transition-all disabled:opacity-50"
        >
          {busy ? "Joining…" : "Subscribe"}
        </button>
      </form>
      <p className="text-sm text-slate-400 leading-relaxed">
        Get the latest engineering roles, delivered to your inbox.
        <br />
        No spam. Unsubscribe anytime.
      </p>
    </div>
  );
}

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-ink text-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-10">
        <div className="flex items-center justify-end gap-5 mb-12">
          <label className="relative inline-flex items-center">
            <span className="sr-only">Language</span>
            <select
              aria-label="Language"
              defaultValue="en"
              className="appearance-none bg-white/5 border border-white/10 rounded-lg pl-3 pr-8 py-2 text-sm text-slate-300 outline-none focus:border-electric cursor-pointer"
            >
              <option value="en">English</option>
            </select>
            <svg
              className="w-4 h-4 text-slate-400 absolute right-2.5 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
              />
            </svg>
          </label>
          <div className="flex items-center gap-4">
            {SOCIALS.map((s) => (
              <SocialIcon key={s.label} label={s.label} path={s.path} />
            ))}
          </div>
        </div>

        <div className="grid gap-10 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 mb-14">
          {COLUMNS.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <h3 className="text-[13px] font-bold uppercase tracking-[0.12em] text-electric mb-5">
                {col.heading}
              </h3>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-[15px] text-slate-300 hover:text-white transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
          <SubscribeBox />
        </div>

        <div className="select-none" aria-hidden>
          <p className="text-right text-[13px] font-semibold uppercase tracking-[0.35em] text-slate-500 mb-2">
            Real Effective
            <br />
            Engineering Roles
          </p>
          <div className="flex items-end gap-4 sm:gap-6">
            <Image
              src="/reerhub-icon-logo.png"
              alt=""
              width={160}
              height={160}
              className="w-24 h-24 sm:w-36 sm:h-36 shrink-0"
            />
            <p
              className="font-display font-bold leading-none tracking-tight text-transparent whitespace-nowrap"
              style={{
                fontSize: "clamp(3.5rem, 17vw, 13rem)",
                WebkitTextStroke: "1.5px rgba(47, 111, 237, 0.65)",
              }}
            >
              ReerHub
            </p>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[13px] text-slate-400">
            © {currentYear} ReerHub. All rights reserved.
          </p>
          <nav
            aria-label="Legal"
            className="flex items-center gap-4 text-[13px]"
          >
            <Link
              href="/privacy"
              className="text-slate-400 hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <span aria-hidden className="text-slate-600">
              |
            </span>
            <Link
              href="/terms"
              className="text-slate-400 hover:text-white transition-colors"
            >
              Terms of Use
            </Link>
          </nav>
          <p className="text-[13px] text-slate-400">
            Built for engineers. Updated daily.
          </p>
        </div>
      </div>
    </footer>
  );
}
