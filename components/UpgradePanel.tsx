import Link from "next/link";
import Icon from "@/components/ui/Icon";
export default function UpgradePanel({
  compact = false,
}: {
  compact?: boolean;
}) {
  return (
    <section
      className={`upgrade-panel rounded-2xl border border-primary/20 bg-primary-soft ${compact ? "p-6" : "p-8"}`}
    >
      <span className="inline-flex items-center gap-2 text-sm font-bold text-primary-deep">
        <Icon name="spark" className="h-4 w-4" />
        ReerHub Pro
      </span>
      <h2
        className={`mt-4 font-display font-bold leading-tight tracking-tight text-ink ${compact ? "text-2xl" : "text-3xl"}`}
      >
        Let the right roles rise to the top.
      </h2>
      <p className="mt-3 text-sm leading-7 text-slate-600">
        A ranked workspace built around your skills, experience, and
        preferences.
      </p>
      <ul className="my-5 space-y-3 text-xs leading-6 text-slate-700">
        {[
          "Personalized matches and clear reasons",
          "Relevance feedback and hide controls",
          "Up to 5 strong matches by email daily",
        ].map((x) => (
          <li key={x} className="flex gap-2">
            <Icon name="check" className="mt-1 h-4 w-4 shrink-0 text-primary" />
            {x}
          </li>
        ))}
      </ul>
      <Link href="/billing" className="btn-primary w-full">
        Explore the 7-day trial
      </Link>
      <p className="mt-4 text-center text-xs text-slate-600">
        ₹49/week · ₹149/month · ₹299/quarter
      </p>
    </section>
  );
}
