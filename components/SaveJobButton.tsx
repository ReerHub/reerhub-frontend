"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import toast from "react-hot-toast";
import { saveJob, savedIds, unsaveJob } from "@/lib/auth";

/**
 * Standalone bookmark toggle for server-rendered pages (job detail).
 * Signed-out visitors can return to this role after signing in to save it.
 */
export default function SaveJobButton({
  jobId,
  variant = "pill",
}: {
  jobId: string;
  variant?: "pill" | "icon";
}) {
  const [saved, setSaved] = useState(false);
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const { user, loading } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;
    if (!user) return;
    savedIds()
      .then((list) => {
        if (!cancelled) {
          setSaved(list.includes(jobId));
          setVisible(true);
        }
      })
      .catch(() => {
        // Logged out: no saved list, so no button (nothing to toggle).
      });
    return () => {
      cancelled = true;
    };
  }, [jobId, user?.id, user]);

  if (loading) return null;
  if (!user)
    return (
      <Link
        href={`/login?next=${encodeURIComponent(pathname)}`}
        aria-label="Sign in to save this job"
        className="btn-secondary min-h-11"
      >
        Save role
      </Link>
    );
  if (!visible) return null;

  const toggle = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (saved) {
        await unsaveJob(jobId);
        setSaved(false);
      } else {
        await saveJob(jobId);
        setSaved(true);
        toast.success("Saved");
      }
    } catch {
      toast.error("Could not save. Please log in and try again.");
    } finally {
      setBusy(false);
    }
  };

  if (variant === "icon") {
    return (
      <button
        onClick={toggle}
        disabled={busy}
        aria-label={saved ? "Remove saved job" : "Save job"}
        aria-pressed={saved}
        className={`min-w-11 min-h-11 w-11 h-11 rounded-full border flex items-center justify-center transition-all ${
          saved
            ? "bg-electric border-electric text-white"
            : "bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300"
        }`}
      >
        <svg
          className="w-4 h-4"
          fill={saved ? "currentColor" : "none"}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.472 48.472 0 0111.186 0z"
          />
        </svg>
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      aria-pressed={saved}
      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-semibold transition-all ${
        saved
          ? "bg-electric border-electric text-white"
          : "bg-white border-slate-200 text-slate-600 hover:border-slate-400"
      }`}
    >
      <svg
        className="w-4 h-4"
        fill={saved ? "currentColor" : "none"}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.472 48.472 0 0111.186 0z"
        />
      </svg>
      {saved ? "Saved" : "Save"}
    </button>
  );
}
