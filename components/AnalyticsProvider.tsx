"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { analyticsConsent, subscribeConsent } from "@/lib/consent";
import {
  startAnalytics,
  stopAnalytics,
  analyticsReady,
  track,
  trackPublicPage,
  publicTagLoaded,
} from "@/lib/analytics";
import { useAuth } from "@/components/AuthProvider";
import { isPublicAnalyticsPath } from "@/lib/public-analytics";
import { pageFamily } from "@/lib/analytics-events";
export default function AnalyticsProvider() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  useEffect(() => {
    if (loading) return;
    let active = true;
    const apply = async () => {
      if (user || !isPublicAnalyticsPath(pathname) || !analyticsConsent()) {
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
          if (publicTagLoaded()) trackPublicPage();
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
    const restored = (event: PageTransitionEvent) => {
      if (event.persisted && publicTagLoaded()) window.location.reload();
    };
    window.addEventListener("pageshow", restored);
    window.addEventListener("message", analyticsReady);
    const unsubscribe = subscribeConsent(() => {
      void apply();
    });
    void apply();
    return () => {
      active = false;
      unsubscribe();
      window.removeEventListener("message", analyticsReady);
      window.removeEventListener("pageshow", restored);
    };
  }, [pathname, user, loading]);
  return null;
}
