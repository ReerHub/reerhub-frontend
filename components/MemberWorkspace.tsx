"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { useAuth } from "@/components/AuthProvider";
import { dashboardView } from "@/lib/dashboard";
import { workspaceLinks } from "@/lib/workspace";
import Icon from "@/components/ui/Icon";

export default function MemberWorkspace({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const { user, loading } = useAuth();
  const protectedWorkspace =
    pathname === "/dashboard" || pathname === "/profile";
  const memberBilling =
    pathname === "/billing" || pathname === "/billing/success";
  if (!protectedWorkspace && !(memberBilling && user)) return children;
  const pro = !!user?.membership?.isPro;
  const view = dashboardView(params.get("view"), pro);
  return (
    <div className="member-workspace">
      <aside className="workspace-sidebar" aria-label="Your workspace">
        <div className="workspace-identity">
          <span className="workspace-monogram" aria-hidden="true">
            {user?.name?.slice(0, 1) || "R"}
          </span>
          <div>
            <strong>
              {loading ? "Your workspace" : user?.name || "Your workspace"}
            </strong>
            <span>{pro ? "Your Pro membership" : "Your next chapter"}</span>
          </div>
        </div>
        <p className="workspace-label">YOUR WORKSPACE</p>
        <nav aria-label="Member workspace">
          {workspaceLinks(pro).map(({ href, label, icon }) => {
            const active = href.startsWith("/dashboard?")
              ? pathname === "/dashboard" && href.endsWith(`=${view}`)
              : pathname === href ||
                (href === "/billing" && pathname === "/billing/success");
            return (
              <Link
                key={href}
                href={href}
                scroll={!href.startsWith("/dashboard?")}
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
          <p>
            A little clarity.
            <br />
            <strong>A lot of possibility.</strong>
          </p>
          <Link href="/contact" className="workspace-link">
            <Icon name="shield" className="h-5 w-5" />
            Help & support
          </Link>
          <Link href="/" className="workspace-link">
            <Icon name="arrow" className="h-5 w-5" />
            Back to ReerHub
          </Link>
        </div>
      </aside>
      <div className="workspace-main">{children}</div>
    </div>
  );
}
