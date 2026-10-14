"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  memberHref,
  workspaceLinks,
  requestWorkspaceNavigation,
} from "@/lib/workspace";
import { navigateAwayFromPublicTag } from "@/lib/analytics";
import { isPro } from "@/lib/membership";
import Icon from "@/components/ui/Icon";

export default function MemberWorkspace({
  children,
  sessionHint = false,
}: {
  children: ReactNode;
  sessionHint?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const workspace =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const destination = memberHref(pathname);
  useEffect(() => {
    if (loading) return;
    const here = pathname + window.location.search + window.location.hash;
    if (user && memberHref(pathname) !== pathname) {
      if (!navigateAwayFromPublicTag(memberHref(here), true))
        router.replace(memberHref(here));
    } else if (!user && workspace)
      router.replace(`/login?next=${encodeURIComponent(here)}`);
  }, [user, loading, pathname, workspace, router]);

  if (
    (loading && (workspace || sessionHint)) ||
    (user && destination !== pathname) ||
    (!user && workspace)
  )
    return (
      <div
        className="member-workspace-pending workspace-loading page-container py-12"
        role="status"
      >
        <div className="skeleton h-10 max-w-sm rounded-xl" />
        <div className="skeleton mt-6 h-64 rounded-3xl" />
        <span className="sr-only">Opening your workspace…</span>
      </div>
    );
  if (!workspace || !user) return children;
  const pro = isPro(user);
  return (
    <div className="member-workspace">
      <aside className="workspace-sidebar" aria-label="Your workspace">
        <div className="workspace-identity">
          <span className="workspace-monogram" aria-hidden="true">
            {user.name?.slice(0, 1) || "R"}
          </span>
          <div>
            <strong>{user.name}</strong>
            <span>{pro ? "Your Pro membership" : "Your next chapter"}</span>
          </div>
        </div>
        <p className="workspace-label">YOUR WORKSPACE</p>
        <nav aria-label="Member workspace">
          {workspaceLinks(pro).map(({ href, label, icon }) => {
            const active =
              href === "/dashboard"
                ? pathname === href
                : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`workspace-link ${active ? "is-active" : ""}`}
              >
                <Icon name={icon} className="h-5 w-5" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="workspace-sidebar-bottom">
          <Link href="/dashboard/help" className="workspace-link">
            <Icon name="shield" className="h-5 w-5" />
            Help & support
          </Link>
          <button
            className="workspace-link w-full"
            onClick={() =>
              requestWorkspaceNavigation("/", () => {
                void logout().then(() =>
                  window.location.assign(window.location.origin),
                );
              })
            }
          >
            <Icon name="logout" className="h-5 w-5" />
            Sign out
          </button>
        </div>
      </aside>
      <div
        className="workspace-main"
        key={`${user.id}:${pro ? "pro" : "free"}`}
      >
        {children}
      </div>
    </div>
  );
}
