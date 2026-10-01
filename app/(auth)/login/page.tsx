"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import GoogleButton from "@/components/GoogleButton";
import Turnstile, { type TurnstileHandle } from "@/components/Turnstile";
import { useAuth } from "@/components/AuthProvider";
import { requestMagicLink, safeNext } from "@/lib/auth";

const inputCls =
  "w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[15px] text-slate-900 placeholder:text-slate-400 outline-none focus:border-electric-dark focus:ring-2 focus:ring-electric-soft transition-all";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const next = safeNext(searchParams.get("next"));
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileHandle>(null);

  useEffect(() => {
    if (!loading && user) router.replace(next);
  }, [loading, user, next, router]);

  const send = async () => {
    setBusy(true);
    setFormError(null);
    try {
      const turnstileToken = await turnstileRef.current?.execute();
      await requestMagicLink({
        email,
        ...(turnstileToken ? { turnstileToken } : {}),
      });
      setSentTo(email);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Request failed";
      setFormError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await send();
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
        Welcome to ReerHub
      </h1>
      <p className="text-slate-500 mb-8">
        Log in to see your recommended tech roles. No passwords — we email you a
        secure sign-in link.
      </p>
      <GoogleButton next={next} />
      <div className="my-6 flex items-center gap-3 text-xs text-slate-400">
        <span className="flex-1 h-px bg-slate-200" />
        or continue with email
        <span className="flex-1 h-px bg-slate-200" />
      </div>
      {sentTo ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-card">
          <p className="font-bold text-slate-900 text-lg mb-1">
            Check your inbox
          </p>
          <p className="text-sm text-slate-500 mb-1">
            We sent a sign-in link to{" "}
            <span className="font-semibold text-slate-900">{sentTo}</span>.
          </p>
          <p className="text-xs text-slate-400 mb-5">
            The link expires in 15 minutes and works once.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <button
              type="button"
              onClick={() => setSentTo(null)}
              className="text-slate-500 font-medium hover:text-slate-900"
            >
              Use a different email
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={send}
              className="text-electric font-semibold disabled:opacity-50"
            >
              {busy ? "Sending…" : "Resend link"}
            </button>
          </div>
        </div>
      ) : (
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
            {busy ? "Sending…" : "Email me a sign-in link"}
          </button>
          <Turnstile ref={turnstileRef} />
        </form>
      )}
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
