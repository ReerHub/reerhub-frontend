"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { adminGoogleLogin } from "../../lib/admin";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (result: { credential?: string }) => void;
          }) => void;
          renderButton: (
            target: HTMLElement,
            options: Record<string, unknown>,
          ) => void;
        };
      };
    };
  }
}

export default function AdminAuth() {
  const router = useRouter();
  const target = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  const [clientId, setClientId] = useState("");
  const [message, setMessage] = useState("");
  const [ready, setReady] = useState(
    () => typeof window !== "undefined" && !!window.google,
  );
  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((data) => setClientId(data.googleClientId || ""))
      .catch(() => setMessage("Configuration could not be loaded."));
  }, []);
  useEffect(() => {
    if (!clientId || document.getElementById("google-gsi")) return;
    const script = document.createElement("script");
    script.id = "google-gsi";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => setReady(true);
    document.head.appendChild(script);
  }, [clientId]);
  useEffect(() => {
    if (
      !ready ||
      !target.current ||
      !window.google ||
      !clientId ||
      initialized.current
    )
      return;
    initialized.current = true;
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async ({ credential }) => {
        if (!credential)
          return setMessage("Google did not return a sign-in credential.");
        setMessage("Checking administrator access…");
        try {
          await adminGoogleLogin(credential);
          router.replace("/dashboard");
        } catch (error) {
          setMessage(
            error instanceof Error ? error.message : "Sign-in failed.",
          );
        }
      },
    });
    window.google.accounts.id.renderButton(target.current, {
      theme: "outline",
      size: "large",
      width: 320,
      text: "signin_with",
    });
  }, [ready, clientId, router]);
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        padding: 20,
        background:
          "linear-gradient(135deg,#eef4ff 0%,#f4f7fb 48%,#eaf7f3 100%)",
      }}
    >
      <section
        style={{
          width: "min(460px,100%)",
          padding: "40px",
          border: "1px solid #dce4f0",
          borderRadius: 20,
          background: "white",
          boxShadow: "0 24px 60px #10213d18",
        }}
      >
        <div
          className="brand"
          style={{ color: "#10213d", padding: 0, marginBottom: 34 }}
        >
          <span className="brand-mark">R</span> ReerHub Admin
        </div>
        <h1 className="ops-title" style={{ fontSize: 32 }}>
          Operations, with guardrails.
        </h1>
        <p style={{ color: "#62708a", margin: "12px 0 28px" }}>
          Use the Google account that has been granted administrator access.
          Customer accounts cannot enter this console.
        </p>
        <div ref={target} style={{ minHeight: 44 }} />
        {!clientId && !message && (
          <p className="notice error">
            Google sign-in is not configured for this deployment.
          </p>
        )}
        {message && (
          <p
            className={`notice ${message.includes("not authorized") ? "error" : ""}`}
            role="status"
          >
            {message}
          </p>
        )}
        <p className="subtle" style={{ marginTop: 28 }}>
          This area is restricted to authorized ReerHub operators.
        </p>
      </section>
    </main>
  );
}
