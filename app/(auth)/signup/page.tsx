"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import GoogleButton from "@/components/GoogleButton";
import Turnstile, { type TurnstileHandle } from "@/components/Turnstile";
import { useAuth } from "@/components/AuthProvider";
import { signup } from "@/lib/auth";

const inputCls =
  "w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-[15px] text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all";

export default function SignupPage() {
  const router = useRouter();
  const { user, loading, refresh } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [checkInbox, setCheckInbox] = useState(false);
  const turnstileRef = useRef<TurnstileHandle>(null);

  useEffect(() => {
    if (!loading && user && !checkInbox) router.replace("/dashboard");
  }, [loading, user, checkInbox, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const turnstileToken = await turnstileRef.current?.execute();
      await signup({
        name,
        email,
        password,
        ...(turnstileToken ? { turnstileToken } : {}),
      });
      await refresh();
      setCheckInbox(true);
      toast.success("Account created — check your inbox to verify");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setBusy(false);
    }
  };

  if (checkInbox) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
          Check your inbox
        </h1>
        <p className="text-slate-500 mb-8">
          We sent a verification link to <strong>{email}</strong>. Click it,
          then head to your dashboard.
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500 transition-all"
        >
          Continue to dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
        Create your account
      </h1>
      <p className="text-slate-500 mb-8">
        Get recommended India tech roles matched to your profile.
      </p>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label
            htmlFor="su-name"
            className="text-sm font-semibold text-slate-700"
          >
            Full name
          </label>
          <input
            id="su-name"
            className={inputCls}
            required
            placeholder="Asha Sharma"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
        </div>
        <div>
          <label
            htmlFor="su-email"
            className="text-sm font-semibold text-slate-700"
          >
            Email
          </label>
          <input
            id="su-email"
            className={inputCls}
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>
        <div>
          <label
            htmlFor="su-password"
            className="text-sm font-semibold text-slate-700"
          >
            Password (min 8 characters)
          </label>
          <input
            id="su-password"
            className={inputCls}
            type="password"
            required
            minLength={8}
            placeholder="Choose a strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500 transition-all disabled:opacity-50"
        >
          {busy ? "Creating…" : "Sign up"}
        </button>
        <Turnstile ref={turnstileRef} />
      </form>
      <div className="my-6 flex items-center gap-3 text-xs text-slate-400">
        <span className="flex-1 h-px bg-slate-200" />
        or
        <span className="flex-1 h-px bg-slate-200" />
      </div>
      <GoogleButton next="/dashboard" />
      <p className="mt-6 text-sm text-slate-500 text-center">
        Have an account?{" "}
        <Link href="/login" className="text-blue-600 font-semibold">
          Log in
        </Link>
      </p>
    </div>
  );
}
