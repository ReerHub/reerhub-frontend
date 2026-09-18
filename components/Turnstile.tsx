"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: {
          sitekey: string;
          size?: string;
          callback?: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
        },
      ) => string;
      execute: (widgetId: string) => void;
      reset: (widgetId: string) => void;
    };
  }
}

export type TurnstileHandle = {
  execute: () => Promise<string | null>;
};

const SCRIPT_ID = "cf-turnstile";

/**
 * Invisible Cloudflare Turnstile. Renders nothing visible; call
 * `execute()` on submit to obtain a token. Resolves null when no site
 * key is configured (local dev) so forms keep working.
 */
const Turnstile = forwardRef<TurnstileHandle>(function Turnstile(_, ref) {
  const hostRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<string | null>(null);
  const resolverRef = useRef<((token: string | null) => void) | null>(null);
  const [ready, setReady] = useState(
    () =>
      typeof document !== "undefined" && !!document.getElementById(SCRIPT_ID),
  );
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

  useEffect(() => {
    if (!siteKey || ready) return;
    if (document.getElementById(SCRIPT_ID)) {
      setReady(true);
      return;
    }
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    script.onload = () => setReady(true);
    document.head.appendChild(script);
  }, [siteKey, ready]);

  useEffect(() => {
    if (!ready || !hostRef.current || !window.turnstile || !siteKey) return;
    if (widgetRef.current) return;
    const settle = (token: string | null) => {
      resolverRef.current?.(token);
      resolverRef.current = null;
    };
    widgetRef.current = window.turnstile.render(hostRef.current, {
      sitekey: siteKey,
      size: "invisible",
      callback: (token: string) => settle(token),
      "error-callback": () => settle(null),
      "expired-callback": () => settle(null),
    });
  }, [ready, siteKey]);

  useImperativeHandle(ref, () => ({
    execute: () =>
      new Promise<string | null>((resolve) => {
        if (!siteKey || !window.turnstile || !widgetRef.current) {
          resolve(null);
          return;
        }
        resolverRef.current = resolve;
        const timer = setTimeout(() => {
          resolverRef.current = null;
          resolve(null);
        }, 8000);
        const wrapped = (token: string | null) => {
          clearTimeout(timer);
          resolve(token);
        };
        resolverRef.current = wrapped;
        try {
          window.turnstile.execute(widgetRef.current);
        } catch {
          clearTimeout(timer);
          resolverRef.current = null;
          resolve(null);
        }
      }),
  }));

  if (!siteKey) return null;
  return <div ref={hostRef} aria-hidden />;
});

export default Turnstile;
