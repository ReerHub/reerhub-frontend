import type { AuthUser } from "@/lib/auth";
import { isPro } from "@/lib/membership";

export default function ProBadge({ user }: { user?: AuthUser | null }) {
  if (!isPro(user)) return null;
  return (
    <span className="pro-badge inline-flex items-center gap-1 rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-bold text-primary-deep">
      <span className="h-1.5 w-1.5 rounded-full bg-green-600" aria-hidden />
      PRO
    </span>
  );
}
