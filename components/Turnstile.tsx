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
          execution?: "execute" | "render";
          appearance?: "always" | "execute" | "interaction-only";
          callback?: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
        },
      ) => string;
      execute: (widgetId: string) => void;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

export type TurnstileHandle = {
  execute: () => Promise<string | null>;
};

const SCRIPT_ID = "cf-turnstile";

/**
 * Deferred Cloudflare Turnstile. Only shows required interaction; call
 * `execute()` on submit to obtain a token. Resolves null when no site
 * key is configured (local dev) so forms keep working.
 */
const Turnstile = forwardRef<TurnstileHandle>(function Turnstile(_, ref) {
  const hostRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<string | null>(null);
  const resolverRef = useRef<((token: string | null) => void) | null>(null);
  const [ready, setReady] = useState(false);
  const [siteKey, setSiteKey] = useState("");
  const [retry, setRetry] = useState(0);
  const [loadError, setLoadError] = useState(false);
  const configLoaded = useRef(false);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => {
        if (!r.ok) throw new Error("Configuration unavailable");
        return r.json();
      })
      .then((j) => {
        configLoaded.current = true;
        setSiteKey(j.turnstileSiteKey || "");
      })
      .catch(() => setLoadError(true));
  }, [retry]);

  useEffect(() => {
    if (!siteKey || ready) return;
    const existing = document.getElementById(SCRIPT_ID);
    const loaded = () => setReady(true);
    if (window.turnstile) {
      loaded();
      return;
    }
    if (existing) {
      existing.addEventListener("load", loaded);
      return () => existing.removeEventListener("load", loaded);
    }
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src =
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setReady(true);
      setLoadError(false);
    };
    script.onerror = () => {
      script.remove();
      setLoadError(true);
    };
    document.head.appendChild(script);
  }, [siteKey, ready, retry]);

  useEffect(() => {
    if (!ready || !hostRef.current || !window.turnstile || !siteKey) return;
    if (widgetRef.current) return;
    const settle = (token: string | null) => {
      resolverRef.current?.(token);
      resolverRef.current = null;
    };
    widgetRef.current = window.turnstile.render(hostRef.current, {
      sitekey: siteKey,
      size: "compact",
      execution: "execute",
      appearance: "interaction-only",
      callback: (token: string) => settle(token),
      "error-callback": () => settle(null),
      "expired-callback": () => settle(null),
    });
    return () => {
      if (widgetRef.current) window.turnstile?.remove(widgetRef.current);
      widgetRef.current = null;
      resolverRef.current?.(null);
      resolverRef.current = null;
    };
  }, [ready, siteKey]);

  useImperativeHandle(ref, () => ({
    execute: () =>
      new Promise<string | null>((resolve, reject) => {
        if (
          !configLoaded.current ||
          loadError ||
          (siteKey && (!window.turnstile || !widgetRef.current))
        ) {
          reject(
            new Error(
              "Security verification is still loading or unavailable. Retry verification, then submit again.",
            ),
          );
          return;
        }
        if (!siteKey) {
          resolve(null);
          return;
        }
        resolverRef.current = resolve;
        const timer = setTimeout(() => {
          resolverRef.current = null;
          resolve(null);
        }, 120000);
        const wrapped = (token: string | null) => {
          clearTimeout(timer);
          resolve(token);
        };
        resolverRef.current = wrapped;
        try {
          window.turnstile!.reset(widgetRef.current!);
          window.turnstile!.execute(widgetRef.current!);
        } catch {
          clearTimeout(timer);
          resolverRef.current = null;
          resolve(null);
        }
      }).then((token) => {
        if (!token && siteKey)
          throw new Error(
            "Security verification was not completed. Please try again.",
          );
        return token;
      }),
  }));

  return (
    <>
      <div ref={hostRef} />
      {loadError && (
        <div className="mt-3 text-sm text-red-700" role="alert">
          Security verification could not load.
          <button
            type="button"
            className="ml-2 min-h-11 underline"
            onClick={() => {
              setLoadError(false);
              setRetry((value) => value + 1);
            }}
          >
            Retry verification
          </button>
        </div>
      )}
    </>
  );
});

export default Turnstile;
