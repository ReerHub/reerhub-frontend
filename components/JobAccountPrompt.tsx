"use client";
import Link from "next/link";
import { useAuth } from "./AuthProvider";

export default function JobAccountPrompt({ path }: { path: string }) {
  const { user } = useAuth();
  if (user?.membership?.isPro) return null;
  return (
    <section className="surface-panel mb-6 flex flex-wrap items-center justify-between gap-4 p-5">
      <p className="text-sm text-slate-600">
        Job details and applications are free.{" "}
        {user
          ? "Let Pro find the roles that fit your profile."
          : "Create a free account to save roles, or explore Pro for personalized matches."}
      </p>
      <div className="flex flex-wrap gap-3">
        {!user && (
          <Link
            href={`/login?next=${encodeURIComponent(path)}`}
            className="btn-secondary"
          >
            Save with a free account
          </Link>
        )}
        <Link href="/billing" className="btn-primary">
          Explore Pro
        </Link>
      </div>
    </section>
  );
}
