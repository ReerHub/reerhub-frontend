"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import toast from "react-hot-toast";
import { resetPassword } from "@/lib/auth";

function ResetInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await resetPassword(token, password);
      setDone(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setBusy(false);
    }
  };

  if (!token) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Invalid reset link
        </h1>
        <Link href="/forgot-password" className="text-electric font-semibold">
          Request a new one
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Password updated
        </h1>
        <Link
          href="/login"
          className="inline-block mt-4 px-8 py-3 bg-electric text-white rounded-xl font-semibold hover:bg-electric-dark"
        >
          Log in
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
        Set a new password
      </h1>
      <form onSubmit={submit} className="space-y-4 mt-6">
        <div>
          <label
            htmlFor="rp-password"
            className="text-sm font-semibold text-slate-700"
          >
            New password (min 8 characters)
          </label>
          <div className="relative">
            <input
              id="rp-password"
              className="w-full px-4 py-2.5 pr-16 bg-white border border-slate-200 rounded-xl text-[15px] outline-none focus:border-electric-dark focus:ring-2 focus:ring-electric-soft"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              placeholder="Choose a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500 hover:text-slate-900"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>
        <button
          type="submit"
          disabled={busy}
          className="w-full px-4 py-2.5 bg-electric text-white rounded-xl font-semibold hover:bg-electric-dark disabled:opacity-50"
        >
          {busy ? "Updating…" : "Reset password"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetInner />
    </Suspense>
  );
}
