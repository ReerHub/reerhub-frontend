import Link from "next/link";

/**
 * Login gate for teaser views (job detail). Anonymous visitors and crawlers
 * see the same excerpt; members get the full description, skills, and the
 * official Apply link after signing in.
 */
export default function LoginWall({ next }: { next: string }) {
  return (
    <div className="rounded-2xl border border-primary/20 bg-primary-soft p-6 text-ink">
      <p className="text-sm font-bold text-primary-deep mb-2">
        Included with your free account
      </p>
      <p className="text-sm text-slate-600 leading-relaxed mb-5">
        Sign in to read the full description, see required skills, save this
        role, and apply on the company&apos;s official site.
      </p>
      <div className="flex flex-col gap-2">
        <Link
          href={`/login?next=${encodeURIComponent(next)}`}
          className="flex items-center justify-center w-full px-6 py-3 bg-electric text-white rounded-xl font-semibold text-[15px] hover:bg-electric-dark active:bg-electric-deep transition-all shadow-sm"
        >
          Continue for free to view &amp; apply
        </Link>
        <p className="flex items-center justify-center w-full px-6 py-2.5 text-xs text-slate-600">
          Google or email sign-in. No payment required.
        </p>
      </div>
    </div>
  );
}
