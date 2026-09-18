"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import GoogleButton from "@/components/GoogleButton";
import Turnstile, { type TurnstileHandle } from "@/components/Turnstile";
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
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileHandle>(null);

  useEffect(() => {
    if (!loading && user) router.replace(next);
  }, [loading, user, next, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setFormError(null);
    try {
      const turnstileToken = await turnstileRef.current?.execute();
      const me = await login({
        email,
        password,
        ...(turnstileToken ? { turnstileToken } : {}),
      });
      await refresh();
      toast.success(`Welcome back, ${me.name.split(" ")[0]}`);
      router.push(next);
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setFormError(message);
      if (
        err instanceof Error &&
        "status" in err &&
        (err as { status?: number }).status !== 401 &&
        (err as { status?: number }).status !== 429
      ) {
        toast.error(message);
      }
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
          <div className="relative">
            <input
              id="login-password"
              className={`${inputCls} pr-16`}
              type={showPassword ? "text" : "password"}
              required
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
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
        {formError && (
          <p
            role="alert"
            className="text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5"
          >
            {formError}
          </p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="w-full px-4 py-2.5 bg-electric text-white rounded-xl font-semibold hover:bg-electric-dark transition-all disabled:opacity-50"
        >
          {busy ? "Logging in…" : "Log in"}
        </button>
        <Turnstile ref={turnstileRef} />
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
