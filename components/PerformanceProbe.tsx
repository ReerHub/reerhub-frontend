"use client";
// Synthetic production-build QA only; never mounted on production deployments.
import { useEffect, useState } from "react";
export default function PerformanceProbe() {
  const [metrics, setMetrics] = useState({
    lcpMs: 0,
    cls: 0,
    interactionMs: 0,
  });
  useEffect(() => {
    const value = { lcpMs: 0, cls: 0, interactionMs: 0 };
    const observers: PerformanceObserver[] = [];
    for (const type of ["largest-contentful-paint", "layout-shift", "event"]) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const raw of list.getEntries()) {
            const entry = raw as PerformanceEntry & {
              value: number;
              hadRecentInput: boolean;
              interactionId: number;
            };
            if (type === "largest-contentful-paint")
              value.lcpMs = Math.round(entry.startTime);
            if (type === "layout-shift" && !entry.hadRecentInput)
              value.cls += entry.value;
            if (type === "event" && entry.interactionId)
              value.interactionMs = Math.max(
                value.interactionMs,
                entry.duration,
              );
          }
          setMetrics({ ...value });
        });
        observer.observe({ type, buffered: true });
        observers.push(observer);
      } catch {
        /* Some browser engines do not expose these entries. */
      }
    }
    const flush = () =>
      navigator.sendBeacon(
        "/api/v1/fixture-metrics",
        JSON.stringify({ path: location.pathname, ...value }),
      );
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      observers.forEach((o) => o.disconnect());
    };
  }, []);
  return (
    <aside
      aria-label="Synthetic performance measurements"
      className="fixed bottom-2 left-2 z-50 rounded border bg-white p-2 text-xs text-slate-700"
    >
      QA: LCP {metrics.lcpMs || "unavailable"}ms · CLS {metrics.cls.toFixed(3)}{" "}
      · interaction {metrics.interactionMs || "unavailable"}ms
    </aside>
  );
}
