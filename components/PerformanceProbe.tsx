"use client";
// Official Web Vitals collection for disposable production-build QA only.
// This component is never mounted on ordinary production deployments.
import { useEffect, useState } from "react";
import { onCLS, onINP, onLCP } from "web-vitals";
export default function PerformanceProbe() {
  const [metrics, setMetrics] = useState({ lcpMs: 0, cls: 0, inpMs: 0 });
  useEffect(() => {
    let active = true;
    const value = { lcpMs: 0, cls: 0, inpMs: 0 };
    const publish = () => {
      if (active) setMetrics({ ...value });
    };
    onLCP(
      (metric) => {
        value.lcpMs = Math.round(metric.value);
        publish();
      },
      { reportAllChanges: true },
    );
    onCLS(
      (metric) => {
        value.cls = metric.value;
        publish();
      },
      { reportAllChanges: true },
    );
    onINP(
      (metric) => {
        value.inpMs = Math.round(metric.value);
        publish();
      },
      { reportAllChanges: true },
    );
    const flush = () =>
      navigator.sendBeacon(
        "/api/v1/fixture-metrics",
        JSON.stringify({ path: location.pathname, ...value }),
      );
    window.addEventListener("pagehide", flush);
    return () => {
      active = false;
      window.removeEventListener("pagehide", flush);
    };
  }, []);
  return (
    <aside
      aria-label="Synthetic performance measurements"
      className="fixed bottom-2 left-2 z-50 rounded border bg-white p-2 text-xs text-slate-700"
    >
      QA: LCP {metrics.lcpMs || "unavailable"}ms · CLS {metrics.cls.toFixed(3)}{" "}
      · INP {metrics.inpMs || "unavailable"}ms
    </aside>
  );
}
