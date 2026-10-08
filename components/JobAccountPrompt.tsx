"use client";
import Link from "next/link";
import { useAuth } from "./AuthProvider";

export default function JobAccountPrompt({ path }: { path: string }) {
  const { user } = useAuth();
  if (user?.membership?.isPro) return null;
  return (
    <section className="upgrade-panel mb-6 flex flex-wrap items-center justify-between gap-4 p-5">
      <div className="max-w-md">
        <h2 className="font-semibold text-ink">
          Keep your next move in focus.
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {user
            ? "Let Pro find the roles that fit your profile."
            : "Create a free account to save roles, or explore Pro for personalized matches."}
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        {!user && (
          <Link
            href={`/login?next=${encodeURIComponent(path)}`}
            className="btn-secondary"
          >
            Save with a free account
          </Link>
        )}
        <Link
          href="/billing"
          className={user ? "btn-primary" : "btn-secondary"}
        >
          Explore Pro
        </Link>
      </div>
    </section>
  );
}
