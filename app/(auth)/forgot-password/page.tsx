"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import Turnstile, { type TurnstileHandle } from "@/components/Turnstile";
import { forgotPassword } from "@/lib/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const turnstileRef = useRef<TurnstileHandle>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const turnstileToken = await turnstileRef.current?.execute();
      await forgotPassword(email, turnstileToken ?? undefined);
      setSent(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Request failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
        Forgot password
      </h1>
      <p className="text-slate-500 mb-8">
        {sent
          ? `If an account exists for ${email}, a reset link is on its way.`
          : "Enter your email and we will send a reset link."}
      </p>
      {!sent && (
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label
              htmlFor="fp-email"
              className="text-sm font-semibold text-slate-700"
            >
              Email
            </label>
            <input
              id="fp-email"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-[15px] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500 disabled:opacity-50"
          >
            {busy ? "Sending…" : "Send reset link"}
          </button>
          <Turnstile ref={turnstileRef} />
        </form>
      )}
      <p className="mt-6 text-sm text-center">
        <Link href="/login" className="text-blue-600 font-semibold">
          Back to login
        </Link>
      </p>
    </div>
  );
}
