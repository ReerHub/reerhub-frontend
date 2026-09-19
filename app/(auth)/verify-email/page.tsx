"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import Turnstile, { type TurnstileHandle } from "@/components/Turnstile";
import { resendVerifyPublic, verifyEmail } from "@/lib/auth";

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
          <p className="text-slate-500 mb-6">
            Links expire after 24 hours. Enter your email below and we will send
            a fresh one — no login needed.
          </p>
          <ResendForm />
          <p className="mt-6">
            <Link href="/login" className="text-electric font-semibold text-sm">
              Back to login
            </Link>
          </p>
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

function ResendForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const turnstileRef = useRef<TurnstileHandle>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const turnstileToken = await turnstileRef.current?.execute();
      await resendVerifyPublic(email, turnstileToken ?? undefined);
      setSent(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Request failed");
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <p className="bg-green-50 border border-green-200 text-green-800 rounded-xl px-4 py-3 text-sm font-medium">
        If an unverified account exists for {email}, a new link is on its way.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3 text-left">
      <div>
        <label
          htmlFor="re-email"
          className="text-sm font-semibold text-slate-700"
        >
          Account email
        </label>
        <input
          id="re-email"
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[15px] outline-none focus:border-electric-dark focus:ring-2 focus:ring-electric-soft"
        />
      </div>
      <button
        type="submit"
        disabled={busy}
        className="w-full px-4 py-2.5 bg-electric text-white rounded-xl font-semibold hover:bg-electric-dark disabled:opacity-50"
      >
        {busy ? "Sending…" : "Send a new link"}
      </button>
      <Turnstile ref={turnstileRef} />
    </form>
  );
}
