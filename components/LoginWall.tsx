import Link from "next/link";

/**
 * Login gate for teaser views (job detail). Anonymous visitors and crawlers
 * see the same excerpt; members get the full description, skills, and the
 * official Apply link after signing in.
 */
export default function LoginWall({ next }: { next: string }) {
  return (
    <div className="bg-ink text-white rounded-2xl p-6 shadow-card-hover">
      <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-teal-300 mb-2">
        Members only
      </p>
      <p className="text-sm text-white/70 leading-relaxed mb-5">
        Log in to read the full description, see required skills, save this
        role, and apply on the company&apos;s official site.
      </p>
      <div className="flex flex-col gap-2">
        <Link
          href={`/login?next=${encodeURIComponent(next)}`}
          className="flex items-center justify-center w-full px-6 py-3 bg-electric text-white rounded-xl font-semibold text-[15px] hover:bg-electric-dark active:bg-electric-deep transition-all shadow-sm"
        >
          Log in to view &amp; apply
        </Link>
        <Link
          href={`/login?next=${encodeURIComponent(next)}`}
          className="flex items-center justify-center w-full px-6 py-2.5 rounded-xl font-semibold text-sm text-white/80 hover:text-white border border-white/15 hover:border-white/30 transition-all"
        >
          New here? It takes seconds
        </Link>
      </div>
    </div>
  );
}
