"use client";

import { useState } from "react";
import { companyTile } from "@/lib/format";

export default function CompanyLogo({
  name,
  logoUrl,
  size = "md",
}: {
  name: string;
  logoUrl?: string;
  size?: "sm" | "md" | "lg";
}) {
  const [failed, setFailed] = useState(false);
  const dims =
    size === "sm"
      ? "w-11 h-11 rounded-xl text-lg"
      : size === "lg"
        ? "w-16 h-16 rounded-2xl text-3xl"
        : "w-12 h-12 rounded-xl text-xl";

  if (!logoUrl || failed) {
    return (
      <span
        className={`${dims} ${companyTile()} flex items-center justify-center font-bold shrink-0 shadow-sm`}
        aria-hidden
      >
        {(name || "C").charAt(0).toUpperCase()}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logoUrl}
      alt={`${name} logo`}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`${dims} object-contain bg-white border border-slate-200/80 shrink-0 shadow-sm p-1`}
    />
  );
}
