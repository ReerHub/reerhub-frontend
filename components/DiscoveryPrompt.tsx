"use client";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { usePathname, useSearchParams } from "next/navigation";
import Icon from "@/components/ui/Icon";
export default function DiscoveryPrompt({ count }: { count?: number }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const params = useSearchParams();
  if (user || loading) return null;
  const next = `${pathname}${params.size ? `?${params.toString()}` : ""}`;
  return (
    <section
      className="discovery-prompt mt-8"
      aria-labelledby="discovery-prompt-title"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary-deep">
        <Icon name="briefcase" />
      </div>
      <div className="flex-1">
        <p className="mb-1 text-xs font-semibold text-primary-deep">
          You’re exploring a preview{count ? ` of ${count} roles` : ""}
        </p>
        <h2
          id="discovery-prompt-title"
          className="text-xl font-bold tracking-tight text-ink"
        >
          There’s more to discover. Your free account unlocks it.
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          See all openings, read full descriptions, save your shortlist, and
          apply on the company’s official site. No payment required.
        </p>
      </div>
      <Link
        href={`/login?next=${encodeURIComponent(next)}`}
        className="btn-primary shrink-0"
      >
        Continue for free
        <Icon name="arrow" className="h-4 w-4" />
      </Link>
    </section>
  );
}
