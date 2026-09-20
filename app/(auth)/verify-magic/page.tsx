"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/components/AuthProvider";
import { safeNext, verifyMagicLink } from "@/lib/auth";

function VerifyMagic() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useAuth();
  const token = searchParams.get("token");
  const next = safeNext(searchParams.get("next"));
  const [error, setError] = useState<string | null>(() =>
    !searchParams.get("token")
      ? "This sign-in link is missing its token."
      : null,
  );
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current || !token) return;
    startedRef.current = true;
    verifyMagicLink(token)
      .then(async (me) => {
        await refresh();
        toast.success(`Welcome${me.name ? `, ${me.name.split(" ")[0]}` : ""}`);
        router.push(next);
        router.refresh();
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "This link didn't work");
      });
  }, [token, next, router, refresh]);

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      {error ? (
        <>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
            Link didn&apos;t work
          </h1>
          <p className="text-slate-500 mb-1">
            {error} Links expire after 15 minutes and work only once.
          </p>
          <p className="text-slate-500 mb-8">
            Send yourself a fresh one — no password needed.
          </p>
          <Link
            href={`/login?next=${encodeURIComponent(searchParams.get("next") || "/dashboard")}`}
            className="inline-flex items-center justify-center px-6 py-2.5 bg-electric text-white rounded-xl font-semibold hover:bg-electric-dark transition-all"
          >
            Get a fresh link
          </Link>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
            Signing you in…
          </h1>
          <p className="text-slate-500">
            Verifying your magic link. You&apos;ll land on your dashboard in a
            moment.
          </p>
        </>
      )}
    </div>
  );
}

export default function VerifyMagicPage() {
  return (
    <Suspense>
      <VerifyMagic />
    </Suspense>
  );
}
