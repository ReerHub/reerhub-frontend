"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { listCompanies } from "@/lib/reerhub";

const DISCOVER_LINKS = [
  { href: "/", label: "All tech roles" },
  { href: "/engineering", label: "Engineering jobs" },
  { href: "/ai", label: "AI / ML jobs" },
  { href: "/companies", label: "All companies" },
  { href: "/#why", label: "Why ReerHub" },
];

function ColumnHeading({ children }) {
  return (
    <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 mb-5">
      {children}
    </h3>
  );
}

function FooterLink({ href, label, external = false }) {
  const classes =
    "text-sm text-slate-600 hover:text-blue-600 transition-colors leading-relaxed";
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
      >
        {label}
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      {label}
    </Link>
  );
}

function MailIcon() {
  return (
    <svg
      className="w-4 h-4 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
      />
    </svg>
  );
}

function SubscribeBox() {
  return (
    <div>
      <ColumnHeading>Get job alerts</ColumnHeading>
      <p className="text-sm text-slate-600 leading-relaxed rounded-xl px-4 py-3 bg-slate-50 border border-slate-200 inline-flex items-start gap-2.5">
        <span className="text-blue-600 mt-0.5">
          <MailIcon />
        </span>
        <span>
          Weekly alerts are{" "}
          <span className="font-semibold text-blue-600">coming soon</span>.
          Meanwhile, browse the latest roles on the{" "}
          <Link
            href="/jobs"
            className="text-blue-600 hover:underline underline-offset-2 font-medium"
          >
            jobs page
          </Link>
          .
        </span>
      </p>
    </div>
  );
}

export default function Footer() {
  const currentYear = new Date().getFullYear();
  // Dynamic so the footer scales from 10 to 100+ companies with no edits.
  const [companies, setCompanies] = useState([]);
  useEffect(() => {
    listCompanies()
      .then((list) => setCompanies(list.slice(0, 8)))
      .catch(() => {});
  }, []);

  return (
    <footer className="bg-white border-t border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-10">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.4fr] mb-12">
          <div>
            <Link
              href="/"
              className="flex items-center gap-2.5"
              aria-label="ReerHub home"
            >
              <Image
                src="/reerhub-logo-64.png"
                alt="ReerHub logo"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <span className="font-bold text-slate-900 text-[17px] tracking-tight">
                ReerHub
              </span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed mt-4 max-w-xs">
              Real Effective Engineering Roles Hub — tech jobs in India,
              indexed daily from official company career pages.
            </p>
            <p className="text-xs text-slate-400 mt-4">
              Applications happen on official company sites.
            </p>
          </div>

          <nav aria-label="Discover">
            <ColumnHeading>Discover</ColumnHeading>
            <ul className="space-y-2.5">
              {DISCOVER_LINKS.map((l) => (
                <li key={l.label}>
                  <FooterLink href={l.href} label={l.label} />
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Companies">
            <ColumnHeading>Companies</ColumnHeading>
            <ul className="space-y-2.5">
              {companies.map((c) => (
                <li key={c.slug}>
                  <FooterLink
                    href={`/companies/${c.slug}`}
                    label={`${c.name} jobs`}
                  />
                </li>
              ))}
            </ul>
            <p className="mt-3 pt-3 border-t border-slate-100">
              <FooterLink href="/companies" label="View all →" />
            </p>
          </nav>

          <SubscribeBox />
        </div>

        <div className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            © {currentYear} ReerHub. All rights reserved.
          </p>
          <p className="text-xs text-slate-400">
            Built for engineers. Updated daily.
          </p>
        </div>
      </div>
    </footer>
  );
}