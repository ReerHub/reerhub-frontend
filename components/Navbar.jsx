"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { workspaceLinks, requestWorkspaceNavigation } from "@/lib/workspace";
import ProBadge from "@/components/ProBadge";
import Icon from "@/components/ui/Icon";
import UserAvatar from "@/components/UserAvatar";
import BrandWordmark from "@/components/BrandWordmark";
export default function Navbar({ sessionHint = false }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 32);
    const frame = requestAnimationFrame(update);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("pageshow", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("pageshow", update);
    };
  }, [pathname]);
  const [open, setOpen] = useState(false);
  const [account, setAccount] = useState(false);
  const accountRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  useEffect(() => {
    const dismiss = (event) => {
      if (event.type === "keydown" && event.key === "Escape") {
        setOpen(false);
        setAccount(false);
        if (document.activeElement?.closest("#mobile-navigation"))
          menuRef.current?.focus();
        else if (accountRef.current?.contains(document.activeElement))
          triggerRef.current?.focus();
      }
      if (
        event.type === "pointerdown" &&
        !accountRef.current?.contains(event.target)
      )
        setAccount(false);
    };
    document.addEventListener("keydown", dismiss);
    document.addEventListener("pointerdown", dismiss);
    return () => {
      document.removeEventListener("keydown", dismiss);
      document.removeEventListener("pointerdown", dismiss);
    };
  }, []);
  const links = [
    { href: "/jobs", label: "Discover jobs" },
    { href: "/companies", label: "Companies" },
    { href: "/how-it-works", label: "How it works" },
    { href: "/blog", label: "Blog" },
    {
      href: "/resume",
      label: "Resume Builder",
    },
    {
      href: "/billing",
      label: user?.membership?.isPro ? "Manage Pro" : "Pricing",
    },
    ...(user ? [{ href: "/dashboard", label: "My dashboard" }] : []),
  ];
  const neutral = loading && sessionHint;
  const mobileLinks = user || neutral ? [] : links;
  const signOut = () =>
    requestWorkspaceNavigation("/", () => {
      void logout().then(() => window.location.assign(window.location.origin));
    });
  const close = () => {
    setOpen(false);
    setAccount(false);
  };
  const isActive = (href) =>
    href === "/jobs"
      ? pathname.startsWith("/jobs") ||
        /^\/(engineering|ai|bengaluru|hyderabad|pune|chennai|delhi|mumbai|remote)-jobs(?:\/|$)/.test(
          pathname,
        )
      : pathname.startsWith(href);
  return (
    <header className="site-nav" data-scrolled={pathname !== "/" || scrolled}>
      <div className="nav-inner page-container flex h-[72px] items-center justify-between gap-4">
        <Link
          href={user ? "/dashboard" : "/"}
          onClick={close}
          className="flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-2.5"
          aria-label="REERHUB home"
        >
          <Image
            src="/reerhub-icon-logo.png"
            width={36}
            height={36}
            alt=""
            className="rounded-lg bg-white p-0.5"
            priority
          />
          <BrandWordmark className="nav-wordmark hidden text-xl text-white sm:inline" />
        </Link>
        {!user && !neutral && (
          <nav
            aria-label="Primary"
            className="hidden items-center gap-1 lg:flex"
          >
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`nav-link ${isActive(href) ? "is-active" : ""}`}
                aria-current={isActive(href) ? "page" : undefined}
              >
                {label}
              </Link>
            ))}
          </nav>
        )}
        {user && pathname !== "/dashboard/jobs" && (
          <form
            className="workspace-top-search focus-field"
            role="search"
            aria-label="Search workspace jobs"
            onSubmit={(event) => {
              event.preventDefault();
              const q = String(
                new FormData(event.currentTarget).get("q") || "",
              ).trim();
              const href = `/dashboard/jobs${q ? `?q=${encodeURIComponent(q)}` : ""}`;
              requestWorkspaceNavigation(href, () => {
                close();
                router.push(href);
              });
            }}
          >
            <Icon name="search" className="h-4 w-4" />
            <input
              name="q"
              type="search"
              aria-label="Search jobs or skills"
              placeholder="Search jobs or skills…"
            />
            <button type="submit" aria-label="Search workspace">
              <Icon name="arrow" className="h-4 w-4" />
            </button>
          </form>
        )}
        <div className="flex items-center gap-2">
          {loading ? (
            <div className="skeleton h-10 w-20 rounded-xl" />
          ) : user ? (
            <div className="relative flex items-center gap-3" ref={accountRef}>
              <ProBadge user={user} />
              <button
                ref={triggerRef}
                onClick={() => {
                  setOpen(false);
                  setAccount(!account);
                }}
                className="account-trigger"
                aria-label="Open account navigation"
                aria-expanded={account}
                aria-controls="account-navigation"
              >
                <UserAvatar
                  key={user._id || user.email}
                  name={user.name}
                  avatarUrl={user.avatarUrl}
                />
                <Icon name="chevron" className="hidden h-4 w-4 sm:block" />
              </button>
              {account && (
                <div id="account-navigation" className="account-popover">
                  <div className="border-b border-slate-100 px-4 pb-4">
                    <p className="truncate font-semibold text-ink">
                      {user.name}
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-600">
                      {user.email}
                    </p>
                  </div>
                  {[
                    ["/dashboard", "My dashboard", "grid"],
                    ["/dashboard/profile", "Profile & preferences", "user"],
                    [
                      "/dashboard/billing",
                      user.membership?.isPro ? "Manage Pro" : "Explore Pro",
                      "spark",
                    ],
                  ].map(([href, label, icon]) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={close}
                      className="account-link"
                    >
                      <Icon name={icon} className="h-4 w-4" />
                      {label}
                    </Link>
                  ))}
                  <button className="account-link w-full" onClick={signOut}>
                    <Icon name="logout" className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="nav-link hidden min-h-11 items-center sm:inline-flex"
              >
                Sign in
              </Link>
              <Link href="/login" className="btn-primary text-sm">
                Join free
              </Link>
            </>
          )}
          <button
            ref={menuRef}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 lg:hidden"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => {
              setAccount(false);
              setOpen(!open);
            }}
          >
            <Icon name={open ? "close" : "menu"} />
          </button>
        </div>
      </div>
      {open && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile primary"
          className="mobile-nav-panel border-t p-4 lg:hidden"
        >
          {mobileLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={close}
              className={`nav-link block ${isActive(href) ? "is-active" : ""}`}
              aria-current={isActive(href) ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
          {user && (
            <div className="mobile-workspace-links mt-3 border-t border-slate-100 pt-3">
              <p className="workspace-label">YOUR WORKSPACE</p>
              {[
                ...workspaceLinks(!!user.membership?.isPro),
                { href: "/dashboard/how-it-works", label: "How it works" },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={close}
                  className="nav-link block"
                >
                  {label}
                </Link>
              ))}
            </div>
          )}
          {user ? (
            <div className="border-t pt-3">
              <Link
                href="/dashboard/help"
                onClick={close}
                className="nav-link block"
              >
                Help & support
              </Link>
              <button
                onClick={signOut}
                className="nav-link block w-full text-left"
              >
                Sign out
              </button>
            </div>
          ) : !neutral ? (
            <div className="mt-3 flex flex-wrap gap-3 border-t border-slate-100 pt-3">
              <Link
                href="/engineering-jobs"
                onClick={close}
                className="nav-link"
              >
                Engineering
              </Link>
              <Link href="/ai-jobs" onClick={close} className="nav-link">
                AI / ML
              </Link>
            </div>
          ) : null}
        </nav>
      )}
    </header>
  );
}
