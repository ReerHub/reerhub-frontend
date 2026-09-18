"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/jobs", label: "All Roles" },
  { href: "/engineering", label: "Engineering" },
  { href: "/ai", label: "AI / ML" },
  { href: "/companies", label: "Companies" },
];

const AUTH_LINKS = [{ href: "/dashboard", label: "Dashboard" }];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const onLogout = async () => {
    await logout();
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  const links = user ? [...LINKS, ...AUTH_LINKS] : LINKS;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-xl border-b border-slate-200/80">
      <div className="max-w-6xl mx-auto h-16 px-4 sm:px-6 flex items-center justify-between gap-3">
        <Link
          href="/"
          className="flex items-center gap-2.5"
          aria-label="ReerHub home"
        >
          <Image
            src="/reerhub-logo.png"
            alt="ReerHub logo"
            width={96}
            height={64}
            className="h-8 w-auto"
            priority
          />
          <span className="font-bold text-slate-900 text-[17px] tracking-tight">
            ReerHub
          </span>
        </Link>
        <nav
          className="flex items-center gap-1 bg-slate-50 border border-slate-200/70 rounded-full p-1 overflow-x-auto max-w-full"
          aria-label="Primary"
        >
          {links.map((link) => {
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
        <div className="flex items-center gap-2">
          {loading ? (
            <span
              className="w-9 h-9 rounded-full bg-slate-100 animate-pulse"
              aria-hidden
            />
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center"
                aria-label="Account menu"
              >
                {(user.avatarUrl && (
                  <Image
                    src={user.avatarUrl}
                    alt=""
                    width={36}
                    height={36}
                    unoptimized
                    className="w-9 h-9 rounded-full object-cover"
                  />
                )) ||
                  user.name.charAt(0).toUpperCase()}
              </button>
              {menuOpen && (
                <>
                  <button
                    aria-hidden
                    tabIndex={-1}
                    onClick={() => setMenuOpen(false)}
                    className="fixed inset-0 z-10 cursor-default"
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-card-hover py-2 text-sm z-20">
                    <p className="px-4 pt-1 pb-2 border-b border-slate-100 mb-1 min-w-0">
                      <span className="block font-bold text-slate-900 truncate">
                        {user.name}
                      </span>
                      <span className="block text-xs text-slate-500 truncate">
                        {user.email}
                      </span>
                    </p>
                    <Link
                      href="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 hover:bg-slate-50 font-semibold text-slate-900"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 hover:bg-slate-50 text-slate-600"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={onLogout}
                      className="block w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-600"
                    >
                      Log out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-500 transition-all whitespace-nowrap"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
