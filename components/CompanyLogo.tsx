"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { companyLogoUrl } from "@/lib/company-logo";

export default function CompanyLogo({
  name,
  logoUrl,
}: {
  name: string;
  logoUrl?: string;
}) {
  const [failedUrl, setFailedUrl] = useState<string>();
  const [visible, setVisible] = useState(false);
  const frame = useRef<HTMLSpanElement>(null);
  const imageUrl = companyLogoUrl(name, logoUrl);
  useEffect(() => {
    if (!imageUrl || visible || !frame.current) return;
    let cancelled = false;
    if (typeof window.IntersectionObserver !== "function") {
      void Promise.resolve().then(() => {
        if (!cancelled) setVisible(true);
      });
      return () => {
        cancelled = true;
      };
    }
    const observer = new window.IntersectionObserver(
      (entries) => {
        if (
          !cancelled &&
          entries.some(
            (entry) =>
              entry.isIntersecting &&
              entry.boundingClientRect.width > 0 &&
              entry.boundingClientRect.height > 0,
          )
        )
          setVisible(true);
      },
      { rootMargin: "160px" },
    );
    observer.observe(frame.current);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [imageUrl, visible]);
  return (
    <span
      ref={frame}
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
      ) : visible ? (
        <Image
          src={imageUrl}
          alt={`${name} logo`}
          width={38}
          height={38}
          loading="lazy"
          fetchPriority="low"
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
      ) : (
        <>
          <span
            data-company-logo-placeholder
            aria-hidden
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 7,
              background: "#f1f5f9",
            }}
          />
          <noscript>
            <style>{`[data-company-logo-placeholder] { display: none !important; }`}</style>
            {/* Ordinary HTML remains useful when scripts are disabled. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={`${name} logo`}
              width={38}
              height={38}
              loading="lazy"
              referrerPolicy="no-referrer"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                borderRadius: 7,
              }}
            />
          </noscript>
        </>
      )}
    </span>
  );
}
