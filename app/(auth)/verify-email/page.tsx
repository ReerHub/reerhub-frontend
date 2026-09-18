"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { verifyEmail } from "@/lib/auth";

function VerifyInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [state, setState] = useState<"busy" | "ok" | "fail">(
    token ? "busy" : "fail",
  );

  useEffect(() => {
    if (!token) return;
    verifyEmail(token)
      .then(() => setState("ok"))
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : "Verification failed");
        setState("fail");
      });
  }, [token]);

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      {state === "busy" && (
        <p className="text-slate-500">Verifying your email…</p>
      )}
      {state === "ok" && (
        <>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Email verified
          </h1>
          <p className="text-slate-500 mb-8">
            Your account is ready. Let&apos;s find your next role.
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-8 py-3 bg-electric text-white rounded-xl font-semibold hover:bg-electric-dark"
          >
            Go to dashboard
          </Link>
        </>
      )}
      {state === "fail" && (
        <>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Link invalid or expired
          </h1>
          <p className="text-slate-500 mb-8">
            Request a new verification email from your profile, or try logging
            in again.
          </p>
          <Link href="/login" className="text-electric font-semibold">
            Back to login
          </Link>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyInner />
    </Suspense>
  );
}
