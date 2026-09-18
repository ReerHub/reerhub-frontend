"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import toast from "react-hot-toast";
import GoogleButton from "@/components/GoogleButton";
import { useAuth } from "@/components/AuthProvider";
import { login, safeNext } from "@/lib/auth";

const inputCls =
  "w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[15px] text-slate-900 placeholder:text-slate-400 outline-none focus:border-electric-dark focus:ring-2 focus:ring-electric-soft transition-all";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, refresh } = useAuth();
  const next = safeNext(searchParams.get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace(next);
  }, [loading, user, next, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const me = await login({ email, password });
      await refresh();
      toast.success(`Welcome back, ${me.name.split(" ")[0]}`);
      router.push(next);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
        Welcome back
      </h1>
      <p className="text-slate-500 mb-8">
        Log in to see your recommended tech roles.
      </p>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label
            htmlFor="login-email"
            className="text-sm font-semibold text-slate-700"
          >
            Email
          </label>
          <input
            id="login-email"
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
            htmlFor="login-password"
            className="text-sm font-semibold text-slate-700"
          >
            Password
          </label>
          <input
            id="login-password"
            className={inputCls}
            type="password"
            required
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="w-full px-4 py-2.5 bg-electric text-white rounded-xl font-semibold hover:bg-electric-dark transition-all disabled:opacity-50"
        >
          {busy ? "Logging in…" : "Log in"}
        </button>
      </form>
      <div className="my-6 flex items-center gap-3 text-xs text-slate-400">
        <span className="flex-1 h-px bg-slate-200" />
        or
        <span className="flex-1 h-px bg-slate-200" />
      </div>
      <GoogleButton next={next} />
      <div className="mt-6 flex items-center justify-between text-sm">
        <Link href="/forgot-password" className="text-electric font-semibold">
          Forgot password?
        </Link>
        <Link href="/signup" className="text-slate-500">
          New here? <span className="text-electric font-semibold">Sign up</span>
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
