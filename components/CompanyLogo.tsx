"use client";

import Image from "next/image";
import { useState } from "react";
import { companyLogoUrl } from "@/lib/company-logo";

export default function CompanyLogo({
  name,
  logoUrl,
}: {
  name: string;
  logoUrl?: string;
}) {
  const [failedUrl, setFailedUrl] = useState<string>();
  const imageUrl = companyLogoUrl(name, logoUrl);
  return (
    <span
      data-company-logo
      className="shadow-sm"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
        width: 48,
        height: 48,
        minWidth: 48,
        minHeight: 48,
        flex: "0 0 48px",
        borderRadius: 12,
        border: "1px solid #e2e8f0",
        background: "#ffffff",
        padding: 4,
        overflow: "hidden",
      }}
    >
      {!imageUrl || failedUrl === imageUrl ? (
        <span
          aria-hidden
          style={{ fontSize: 20, fontWeight: 700, color: "#0f172a" }}
        >
          {(name.trim() || "C").charAt(0).toUpperCase()}
        </span>
      ) : (
        <Image
          src={imageUrl}
          alt={`${name} logo`}
          width={38}
          height={38}
          loading="lazy"
          // Preserve direct loading of official assets, including SVG/ICO icons.
          unoptimized
          referrerPolicy="no-referrer"
          onError={() => setFailedUrl(imageUrl)}
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            objectFit: "contain",
            objectPosition: "center",
            borderRadius: 7,
          }}
        />
      )}
    </span>
  );
}
