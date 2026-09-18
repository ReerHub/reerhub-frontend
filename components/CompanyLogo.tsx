"use client";

import Image from "next/image";
import { useState } from "react";
import { companyTile } from "@/lib/format";

const DIMS = { sm: 44, md: 48, lg: 64 } as const;

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
  const px = DIMS[size];
  const radius = size === "lg" ? "rounded-2xl" : "rounded-xl";
  const text =
    size === "sm" ? "text-lg" : size === "lg" ? "text-3xl" : "text-xl";

  if (!logoUrl || failed) {
    return (
      <span
        className={`${radius} ${companyTile()} flex items-center justify-center font-bold ${text} shrink-0 shadow-sm`}
        style={{ width: px, height: px }}
        aria-hidden
      >
        {(name || "C").charAt(0).toUpperCase()}
      </span>
    );
  }

  return (
    <Image
      src={logoUrl}
      alt={`${name} logo`}
      width={px}
      height={px}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`${radius} object-contain bg-white border border-slate-200/80 shrink-0 shadow-sm p-1`}
    />
  );
}
