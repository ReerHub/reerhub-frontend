"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import ProBadge from "@/components/ProBadge";
import Icon from "@/components/ui/Icon";
export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [account, setAccount] = useState(false);
  const accountRef = useRef(null);
  const triggerRef = useRef(null);
  useEffect(() => {
    const dismiss = (event) => {
      if (event.type === "keydown" && event.key === "Escape") {
        setOpen(false);
        setAccount(false);
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
    {
      href: "/billing",
      label: user?.membership?.isPro ? "Manage Pro" : "ReerHub Pro",
    },
    ...(user ? [{ href: "/dashboard", label: "My dashboard" }] : []),
  ];
  const close = () => {
    setOpen(false);
    setAccount(false);
  };
  return (
    <header className="site-nav">
      <div className="page-container flex h-[72px] items-center justify-between gap-4">
        <Link
          href="/"
          onClick={close}
          className="flex shrink-0 items-center gap-2.5"
          aria-label="ReerHub home"
        >
          <Image
            src="/reerhub-icon-logo.png"
            width={36}
            height={36}
            alt=""
            priority
          />
          <span className="font-display text-xl font-bold tracking-tight text-ink">
            ReerHub<span className="text-primary">.</span>
          </span>
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`nav-link ${pathname.startsWith(href) ? "is-active" : ""}`}
              aria-current={pathname.startsWith(href) ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {loading ? (
            <div className="skeleton h-10 w-20 rounded-xl" />
          ) : user ? (
            <div className="relative flex items-center gap-3" ref={accountRef}>
              <ProBadge user={user} />
              <button
                ref={triggerRef}
                onClick={() => setAccount(!account)}
                className="account-trigger"
                aria-label="Open account navigation"
                aria-expanded={account}
                aria-controls="account-navigation"
              >
                {user.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt=""
                    width={32}
                    height={32}
                    unoptimized
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-soft text-sm font-bold text-primary-deep">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                )}
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
                    ["/profile", "Profile & preferences", "user"],
                    [
                      "/billing",
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
                  <button
                    className="account-link w-full"
                    onClick={async () => {
                      await logout();
                      close();
                      router.push("/");
                      router.refresh();
                    }}
                  >
                    <Icon name="logout" className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="btn-primary text-sm">
              Join free
            </Link>
          )}
          <button
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 md:hidden"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpen(!open)}
          >
            <Icon name={open ? "close" : "menu"} />
          </button>
        </div>
      </div>
      {open && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile primary"
          className="border-t border-slate-100 bg-white p-4 md:hidden"
        >
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={close}
              className={`nav-link block ${pathname.startsWith(href) ? "is-active" : ""}`}
            >
              {label}
            </Link>
          ))}
          <div className="mt-3 flex gap-3 border-t border-slate-100 pt-3">
            <Link href="/engineering-jobs" onClick={close} className="nav-link">
              Engineering
            </Link>
            <Link href="/ai-jobs" onClick={close} className="nav-link">
              AI / ML
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
