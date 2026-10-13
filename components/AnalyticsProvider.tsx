"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { analyticsConsent, subscribeConsent } from "@/lib/consent";
import {
  startAnalytics,
  stopAnalytics,
  analyticsReady,
  track,
} from "@/lib/analytics";
import { pageFamily } from "@/lib/analytics-events";
export default function AnalyticsProvider() {
  const pathname = usePathname();
  useEffect(() => {
    let active = true;
    const apply = async () => {
      if (!analyticsConsent()) {
        stopAnalytics();
        return;
      }
      try {
        const response = await fetch("/api/config", { cache: "no-store" });
        const config = await response.json();
        if (active && analyticsConsent()) {
          startAnalytics(
            config.gtmContainerId || config.ga4MeasurementId || "",
          );
          const family = pageFamily(pathname);
          if (family === "discovery" || family === "home")
            track("discovery", { page_family: family }, pathname);
          if (family === "pricing")
            track("view_pricing", { page_family: family }, pathname);
        }
      } catch {
        /* Analytics availability never blocks the product. */
      }
    };
    window.addEventListener("message", analyticsReady);
    const unsubscribe = subscribeConsent(() => {
      void apply();
    });
    void apply();
    return () => {
      active = false;
      unsubscribe();
      window.removeEventListener("message", analyticsReady);
    };
  }, [pathname]);
  return null;
}
