"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Icon from "@/components/ui/Icon";
import { adminDashboardPath, adminGoogleLogin } from "@/lib/admin";

export default function AdminAuth() {
  const router = useRouter();
  const target = useRef<HTMLDivElement>(null);
  const signingIn = useRef(false);
  const [clientId, setClientId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [ready, setReady] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let live = true;
    fetch("/api/config")
      .then(async (response) => {
        if (!response.ok)
          throw new Error("Sign-in configuration could not be loaded.");
        const config = await response.json();
        if (!config.googleClientId)
          throw new Error(
            "Google sign-in is not configured for this deployment. Check GOOGLE_CLIENT_ID.",
          );
        if (live) {
          setClientId(config.googleClientId);
          setError("");
        }
      })
      .catch((e) => {
        if (live)
          setError(e instanceof Error ? e.message : "Could not load sign-in.");
      });
    return () => {
      live = false;
    };
  }, [attempt]);
  useEffect(() => {
    if (!clientId) return;
    let live = true;
    let initialized = false;
    let script = document.getElementById(
      "google-gsi",
    ) as HTMLScriptElement | null;
    const initialize = () => {
      if (!live || initialized || !window.google || !target.current) return;
      initialized = true;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async ({ credential }) => {
          if (signingIn.current) return;
          if (!credential) {
            setError("Google did not return a credential. Please try again.");
            return;
          }
          signingIn.current = true;
          setError("");
          setMessage("Verifying administrator access…");
          try {
            await adminGoogleLogin(credential);
            router.replace(adminDashboardPath());
          } catch (e) {
            setError(e instanceof Error ? e.message : "Sign-in failed.");
            setMessage("");
          } finally {
            signingIn.current = false;
          }
        },
      });
      target.current.replaceChildren();
      window.google.accounts.id.renderButton(target.current, {
        theme: "outline",
        size: "large",
        width: Math.min(340, target.current.clientWidth || 280),
        text: "signin_with",
      });
      setReady(true);
      setError("");
    };
    const failed = () => {
      if (live)
        setError(
          "Google sign-in could not load. Check your connection or browser blocker, then retry.",
        );
    };
    if (window.google) initialize();
    else {
      if (!script) {
        script = document.createElement("script");
        script.id = "google-gsi";
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        document.head.appendChild(script);
      }
      script.addEventListener("load", initialize);
      script.addEventListener("error", failed);
    }
    const timeout = window.setTimeout(() => {
      if (!initialized) failed();
    }, 12000);
    return () => {
      live = false;
      window.clearTimeout(timeout);
      script?.removeEventListener("load", initialize);
      script?.removeEventListener("error", failed);
    };
  }, [clientId, attempt, router]);
  function retry() {
    if (!window.google) document.getElementById("google-gsi")?.remove();
    setError("");
    setReady(false);
    setAttempt((a) => a + 1);
  }
  return (
    <main className="admin-ui auth-shell">
      <section className="auth-story">
        <div className="brand">
          <Image src="/reerhub-icon-logo.png" width={38} height={38} alt="" />
          <span>
            ReerHub<small>OPERATIONS CONSOLE</small>
          </span>
        </div>
        <div>
          <p className="eyebrow">Behind every better match</p>
          <h1>
            A clearer view.
            <br />
            <span>A healthier platform.</span>
          </h1>
          <p>
            Your workspace for official job sources, quality openings, and
            member support. Built for thoughtful operations, not unrestricted
            database edits.
          </p>
          <div className="auth-features">
            <div>
              <Icon name="sliders" />
              Monitor source health and freshness
            </div>
            <div>
              <Icon name="briefcase" />
              Keep job data accurate and useful
            </div>
            <div>
              <Icon name="shield" />
              Trace every privileged change
            </div>
          </div>
        </div>
        <p className="auth-bottom">ReerHub · Authorized operators only</p>
      </section>
      <section className="auth-main">
        <div className="auth-card">
          <div className="auth-shield">
            <Icon name="shield" />
          </div>
          <p className="eyebrow">Secure administrator access</p>
          <h2>Welcome to operations.</h2>
          <p>
            Sign in with the Google account already granted an administrator
            role.
          </p>
          <div className="google-slot" ref={target} aria-busy={!ready} />
          {!ready && !error && (
            <p role="status" className="subtle">
              Preparing secure Google sign-in…
            </p>
          )}
          {message && (
            <div className="notice" role="status">
              {message}
            </div>
          )}
          {error && (
            <div className="notice error" role="alert">
              <span>{error}</span>
            </div>
          )}
          {error && (
            <button className="button full-width" onClick={retry}>
              Retry sign-in setup
            </button>
          )}
          <div className="auth-policy">
            <strong>Restricted by design.</strong>
            <br />
            Normal customer accounts cannot access this workspace. Signing in
            never creates an account or grants an admin role.
          </div>
        </div>
      </section>
    </main>
  );
}
