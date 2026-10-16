"use client";
import Link from "@/components/AppLink";
import { useAuth } from "@/components/AuthProvider";
import { usePathname, useSearchParams } from "next/navigation";
import Icon from "@/components/ui/Icon";
export default function DiscoveryPrompt({
  count = 0,
  total,
  card = false,
}: {
  count?: number;
  total?: number;
  card?: boolean;
}) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const params = useSearchParams();
  if (user || loading) return null;
  const next = `${pathname}${params.size ? `?${params.toString()}` : ""}`;
  const remaining =
    total === undefined ? undefined : Math.max(0, total - count);
  const more = remaining === undefined ? count >= 10 : remaining > 0;
  return (
    <section
      className={
        card
          ? "flex min-w-0 flex-col items-start justify-center gap-4 rounded-2xl border border-blue-200 bg-blue-50 p-6"
          : "discovery-prompt mt-8"
      }
      aria-labelledby="discovery-prompt-title"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary-deep">
        <Icon name="briefcase" />
      </div>
      <div className="flex-1">
        <p className="mb-1 text-xs font-semibold text-primary-deep">
          {remaining && remaining > 0
            ? `${remaining} more ${remaining === 1 ? "role" : "roles"} available`
            : more
              ? "You’re viewing a limited preview"
              : "Your free discovery account"}
        </p>
        <h2
          id="discovery-prompt-title"
          className="text-xl font-bold tracking-tight text-ink"
        >
          {more
            ? "Sign in to see all open roles"
            : "Save your shortlist with a free account"}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          {more
            ? "You’re seeing the first 10 roles. Sign in or create a free account to browse the complete list."
            : "Create a free account to save roles and return to your shortlist."}{" "}
          No payment required. Job details and official Apply links stay public.
        </p>
      </div>
      <Link
        href={`/login?next=${encodeURIComponent(next)}`}
        data-signup-prompt="true"
        className="btn-primary min-h-11 shrink-0 max-w-full text-center"
      >
        {more ? "Sign in to view all roles" : "Create a free account"}
        <Icon name="arrow" className="h-4 w-4" />
      </Link>
    </section>
  );
}
