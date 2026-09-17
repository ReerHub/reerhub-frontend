"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

const LINKS = [
  { href: "/", label: "All Roles" },
  { href: "/engineering", label: "Engineering" },
  { href: "/ai", label: "AI / ML" },
  { href: "/companies", label: "Companies" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-[#060D1D]/90 backdrop-blur border-b border-[#E2E8F0] dark:border-white/10">
      <div className="max-w-6xl mx-auto h-16 px-4 sm:px-6 flex items-center justify-between gap-4">
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
            priority
          />
          <span className="font-bold text-[#0F172A] dark:text-white text-[17px] tracking-tight">
            ReerHub
          </span>
        </Link>
        <div className="flex items-center gap-1.5">
          <nav className="flex items-center gap-1" aria-label="Primary">
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
                  className={`px-2.5 sm:px-4 py-2 rounded-lg text-[13px] sm:text-sm font-semibold transition-all whitespace-nowrap ${
                    active
                      ? "bg-[#EFF6FF] text-[#2563EB] dark:bg-[#2563EB]/15 dark:text-[#60A5FA]"
                      : "text-[#475569] hover:bg-[#F1F5F9] dark:text-[#94A3B8] dark:hover:bg-white/5 dark:hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <span
            className="w-px h-6 bg-[#E2E8F0] dark:bg-white/10 mx-1"
            aria-hidden
          />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
