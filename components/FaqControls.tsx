"use client";
import { useEffect } from "react";
export default function FaqControls() {
  useEffect(() => {
    const openHash = () => {
      let id: string;
      try {
        id = decodeURIComponent(window.location.hash.slice(1));
      } catch {
        return;
      }
      const detail = document.getElementById(id);
      if (detail instanceof HTMLDetailsElement && detail.matches("[data-faq]"))
        detail.open = true;
    };
    openHash();
    window.addEventListener("hashchange", openHash);
    return () => window.removeEventListener("hashchange", openHash);
  }, []);
  const expand = (open: boolean) =>
    document
      .querySelectorAll<HTMLDetailsElement>("details[data-faq]")
      .forEach((detail) => {
        detail.open = open;
      });
  return (
    <div className="faq-controls">
      <button
        type="button"
        className="btn-secondary"
        onClick={() => expand(true)}
      >
        Expand all
      </button>
      <button
        type="button"
        className="btn-secondary"
        onClick={() => expand(false)}
      >
        Collapse all
      </button>
    </div>
  );
}
