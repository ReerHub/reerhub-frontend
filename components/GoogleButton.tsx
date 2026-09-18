"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/components/AuthProvider";
import { googleLogin, safeNext } from "@/lib/auth";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (opts: {
            client_id: string;
            callback: (res: { credential?: string }) => void;
          }) => void;
          renderButton: (
            el: HTMLElement,
            opts: Record<string, unknown>,
          ) => void;
        };
      };
    };
  }
}

export default function GoogleButton({ next }: { next: string }) {
  const router = useRouter();
  const { refresh } = useAuth();
  const safe = safeNext(next);
  const ref = useRef<HTMLDivElement>(null);
  // GIS allows a single initialize() per button element: guard it so
  // StrictMode double-effects (dev) or re-renders never double-init,
  // which Google logs as "initialize() is called multiple times".
  const doneRef = useRef(false);
  const [ready, setReady] = useState(
    () =>
      typeof document !== "undefined" &&
      !!document.getElementById("google-gsi"),
  );
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  useEffect(() => {
    if (!clientId || ready) return;
    const script = document.createElement("script");
    script.id = "google-gsi";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setReady(true);
    document.head.appendChild(script);
  }, [clientId, ready]);

  useEffect(() => {
    if (
      !ready ||
      !ref.current ||
      !window.google ||
      !clientId ||
      doneRef.current
    ) {
      return;
    }
    doneRef.current = true;
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (res) => {
        if (!res.credential) {
          toast.error("Google sign-in failed");
          return;
        }
        try {
          await googleLogin(res.credential);
          await refresh();
          toast.success("Signed in with Google");
          router.push(safe);
          router.refresh();
        } catch {
          toast.error("Google sign-in failed. Please try again.");
        }
      },
    });
    window.google.accounts.id.renderButton(ref.current, {
      theme: "outline",
      size: "large",
      // 280px + page padding fits 320px devices; GIS caps at 400.
      width: 280,
    });
  }, [ready, clientId, safe, router, refresh]);

  if (!clientId) return null;
  return <div ref={ref} className="flex justify-center" />;
}
