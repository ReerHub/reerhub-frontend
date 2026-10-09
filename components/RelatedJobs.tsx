"use client";

import { useCallback } from "react";
import toast from "react-hot-toast";
import JobCard from "@/components/JobCard";
import { useSavedJobs, toggleSaved } from "@/lib/saved-store";
import { useAuth } from "./AuthProvider";
import type { Job } from "@/lib/reerhub";

/**
 * Related-jobs grid with working bookmark toggles (server page can't
 * hold save state, so this client island owns ids + toggling).
 */
export default function RelatedJobs({
  jobs,
  companyName,
}: {
  jobs: Job[];
  companyName: string;
}) {
  const { user } = useAuth();
  const ids = useSavedJobs(user?.id);
  const authed = !!user;

  const toggleSave = useCallback(async (jobId: string, next: boolean) => {
    try {
      await toggleSaved(jobId, next);
      if (next) toast.success("Saved");
    } catch {
      toast.error("Could not save. Please log in and try again.");
    }
  }, []);

  if (jobs.length === 0) return null;
  const savedSet = new Set(ids);

  return (
    <section className="mt-8">
      <h2 className="font-bold text-slate-900 text-xl mb-4">
        More from {companyName}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {jobs.map((related) => (
          <JobCard
            key={related._id}
            job={related}
            showSave={authed}
            saved={savedSet.has(related._id)}
            onToggleSave={toggleSave}
          />
        ))}
      </div>
    </section>
  );
}
