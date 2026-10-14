"use client";
import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { publicTagLoaded } from "@/lib/analytics";
import { isPublicAnalyticsPath } from "@/lib/public-analytics";

/** Discard the measured document before mounting any member/account content. */
export default function PublicAnalyticsBoundary({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useAuth();
  const discard =
    publicTagLoaded() && (Boolean(user) || !isPublicAnalyticsPath(pathname));
  useEffect(() => {
    if (discard) window.location.replace(window.location.href);
  }, [discard]);
  if (discard)
    return (
      <div role="status" className="page-container py-12">
        Opening your page…
      </div>
    );
  return children;
}
