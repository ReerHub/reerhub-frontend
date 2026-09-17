"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "All Roles" },
  { href: "/engineering", label: "Engineering" },
  { href: "/ai", label: "AI / ML" },
  { href: "/companies", label: "Companies" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-xl border-b border-slate-200/80">
      <div className="max-w-6xl mx-auto h-16 px-4 sm:px-6 flex items-center justify-between gap-4">
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
            priority
          />
          <span className="font-bold text-slate-900 text-[17px] tracking-tight">
            ReerHub
          </span>
        </Link>
        <nav
          className="flex items-center gap-1 bg-slate-50 border border-slate-200/70 rounded-full p-1"
          aria-label="Primary"
        >
          {LINKS.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`px-3 sm:px-4 py-1.5 rounded-full text-[13px] sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  active
                    ? "bg-white text-slate-900 shadow-card"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}