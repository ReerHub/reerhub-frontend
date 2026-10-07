"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import GoogleButton from "@/components/GoogleButton";
import Turnstile, { type TurnstileHandle } from "@/components/Turnstile";
import { useAuth } from "@/components/AuthProvider";
import { requestMagicLink, safeNext } from "@/lib/auth";
import Link from "next/link";
import Icon from "@/components/ui/Icon";

const inputCls =
  "w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[15px] text-slate-900 placeholder:text-slate-400 outline-none focus:border-electric-dark focus:ring-2 focus:ring-electric-soft transition-all";

function LoginForm() {
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const next = safeNext(searchParams.get("next"));
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileHandle>(null);

  useEffect(() => {
    // A full navigation drops anonymous router-cache entries and makes the
    // protected-route guard read the newly issued session cookies.
    if (!loading && user) window.location.replace(next);
  }, [loading, user, next]);

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

  if (loading || user) {
    return (
      <div className="page-container py-20 text-center" role="status">
        {user ? "Signed in. Opening your workspace…" : "Checking your session…"}
      </div>
    );
  }

  return (
    <div className="page-container grid min-h-[75vh] items-center gap-12 py-12 lg:grid-cols-2 lg:py-16">
      <aside className="hidden max-w-lg lg:block">
        <div className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-teal-800">
          <Icon name="shield" />
          Official openings. Your next opportunity.
        </div>
        <h2 className="font-display text-5xl font-bold leading-tight tracking-tight text-ink">
          A better starting point for your next chapter.
        </h2>
        <p className="mt-5 text-lg leading-8 text-slate-600">
          One free account. Every detail you need to take your next step.
        </p>
        <ul className="mt-8 space-y-5">
          {[
            "Read full role descriptions and requirements",
            "Save the opportunities worth coming back to",
            "Apply directly on official company hiring pages",
          ].map((x) => (
            <li
              key={x}
              className="flex items-center gap-3 text-sm text-slate-600"
            >
              <Icon name="check" className="h-5 w-5 shrink-0 text-primary" />
              {x}
            </li>
          ))}
        </ul>
      </aside>
      <div className="surface-panel mx-auto w-full max-w-md p-6 sm:p-9">
        <h1 className="font-display text-3xl font-bold text-slate-900 tracking-tight mb-3">
          Your next move starts here.
        </h1>
        <p className="text-slate-500 mb-8">
          Sign in or create your free account. Use Google or a secure link sent
          to your email.
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
        <p className="mt-6 text-center text-xs leading-6 text-slate-600">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="underline underline-offset-2">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline underline-offset-2">
            Privacy Policy
          </Link>
          .
        </p>
        <p className="mt-3 text-center text-xs text-slate-600">
          Free job discovery. No card required.
        </p>
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
