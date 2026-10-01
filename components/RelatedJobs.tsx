"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import JobCard from "@/components/JobCard";
import { saveJob, savedIds, unsaveJob } from "@/lib/auth";
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
  const [ids, setIds] = useState<string[]>([]);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    savedIds()
      .then((list) => {
        if (!cancelled) {
          setIds(list);
          setAuthed(true);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleSave = useCallback(async (jobId: string, next: boolean) => {
    try {
      if (next) {
        await saveJob(jobId);
        setIds((prev) => (prev.includes(jobId) ? prev : [...prev, jobId]));
        toast.success("Saved");
      } else {
        await unsaveJob(jobId);
        setIds((prev) => prev.filter((id) => id !== jobId));
      }
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
