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
    <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#2DD4BF] mb-5">
      {children}
    </h3>
  );
}

function FooterLink({ href, label, external = false }) {
  const classes = "text-sm text-[#94A3B8] hover:text-white transition-colors";
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

function SubscribeBox() {
  return (
    <div>
      <ColumnHeading>Get job alerts</ColumnHeading>
      <p className="text-sm text-[#CBD5E1] leading-relaxed rounded-lg px-4 py-3 border border-white/10 bg-white/5">
        Weekly tech-role alerts are{" "}
        <span className="font-semibold text-[#2DD4BF]">coming soon</span>.
        Meanwhile, browse the latest roles on the{" "}
        <Link
          href="/jobs"
          className="text-[#2DD4BF] hover:underline underline-offset-2 font-medium"
        >
          jobs page
        </Link>
        .
      </p>
      <p className="text-[11px] leading-relaxed text-[#64748B] mt-3 max-w-xs">
        No spam, no middlemen — once alerts launch you&apos;ll get one email
        when new roles land at your companies.
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
    <footer className="bg-[#040918] text-[#CBD5E1] relative overflow-hidden">
      {/* brand gradient hairline */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, #2DD4BF 20%, #3B82F6 50%, #6366F1 80%, transparent)",
        }}
        aria-hidden
      />
      {/* ambient glow */}
      <div
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-80 rounded-full blur-3xl pointer-events-none"
        style={{ background: "rgba(59,130,246,0.08)" }}
        aria-hidden
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-8">
        <div className="flex items-center gap-2 mb-12">
          <Link
            href="/"
            className="flex items-center gap-2"
            aria-label="ReerHub home"
          >
            <Image
              src="/reerhub-logo-64.png"
              alt="ReerHub logo"
              width={32}
              height={32}
              className="w-8 h-8 rounded-lg bg-white"
            />
            <span className="font-bold text-white text-[17px] tracking-tight">
              ReerHub
            </span>
          </Link>
        </div>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1.4fr] mb-8">
          <nav aria-label="Discover">
            <ColumnHeading>Discover</ColumnHeading>
            <ul className="space-y-3">
              {DISCOVER_LINKS.map((l) => (
                <li key={l.label}>
                  <FooterLink href={l.href} label={l.label} />
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Companies">
            <ColumnHeading>Companies</ColumnHeading>
            <ul className="space-y-3">
              {companies.map((c) => (
                <li key={c.slug}>
                  <FooterLink
                    href={`/companies/${c.slug}`}
                    label={`${c.name} jobs`}
                  />
                </li>
              ))}
              <li>
                <FooterLink href="/companies" label="View all →" />
              </li>
            </ul>
          </nav>

          <nav aria-label="Official sources">
            <ColumnHeading>Official sources</ColumnHeading>
            <ul className="space-y-3">
              {companies.map((c) => (
                <li key={c.slug}>
                  <FooterLink
                    href={c.careersUrl}
                    label={`${c.name} careers`}
                    external
                  />
                </li>
              ))}
            </ul>
          </nav>

          <SubscribeBox />
        </div>

        {/* giant outlined wordmark */}
        <div
          className="select-none pointer-events-none -mb-2 sm:-mb-4 [mask-image:linear-gradient(to_bottom,black_55%,transparent_98%)]"
          aria-hidden
        >
          <svg
            viewBox="0 0 800 150"
            className="w-full h-auto"
            role="presentation"
          >
            <defs>
              <linearGradient
                id="reerhub-foot-stroke"
                x1="0"
                y1="0"
                x2="1"
                y2="0"
              >
                <stop offset="0%" stopColor="#2DD4BF" />
                <stop offset="50%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#6366F1" />
              </linearGradient>
            </defs>
            <text
              x="400"
              y="122"
              textAnchor="middle"
              fontFamily="Inter, -apple-system, 'Segoe UI', sans-serif"
              fontWeight={800}
              fontSize={148}
              letterSpacing={-6}
              fill="none"
              stroke="url(#reerhub-foot-stroke)"
              strokeWidth={1.5}
              opacity={0.55}
            >
              reerhub
            </text>
          </svg>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#94A3B8]">
            © {currentYear} ReerHub. All rights reserved.
          </p>
          <p className="text-xs text-[#64748B]">
            Applications happen on official company sites.
          </p>
        </div>
      </div>
    </footer>
  );
}
