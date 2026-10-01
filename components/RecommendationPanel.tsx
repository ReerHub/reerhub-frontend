"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getRecommendations,
  setRecommendationFeedback,
  type Recommendation,
} from "@/lib/auth";
import { jobUrl } from "@/lib/reerhub";

export default function RecommendationPanel() {
  const [jobs, setJobs] = useState<Recommendation[]>([]);
  const [completion, setCompletion] = useState(0);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getRecommendations()
      .then((data) => {
        setJobs(data.jobs);
        setCompletion(data.profileCompletion);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  const feedback = async (jobId: string, value: string) => {
    try {
      await setRecommendationFeedback(jobId, value);
      setJobs((items) =>
        value === "not_relevant"
          ? items.filter((item) => item._id !== jobId)
          : items,
      );
      toast.success("Feedback saved");
    } catch {
      toast.error("Could not save feedback");
    }
  };
  return (
    <section className="mb-8" aria-labelledby="matches-title">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <p className="text-sm font-semibold text-electric">
            Your ranked roles
          </p>
          <h2 id="matches-title" className="text-2xl font-bold text-slate-900">
            Best matches today
          </h2>
        </div>
        <Link href="/profile" className="text-sm font-semibold text-electric">
          Profile {completion}% complete
        </Link>
      </div>
      {loading ? (
        <div className="h-44 rounded-2xl skeleton" />
      ) : jobs.length ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {jobs.map((job) => (
            <article
              key={job._id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-card"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-electric">
                    {job.fit.score}% FIT
                  </p>
                  <h3 className="mt-1 font-bold text-slate-900">{job.title}</h3>
                  <p className="text-sm text-slate-500">{job.companyId.name}</p>
                </div>
                <span
                  className="w-10 h-10 rounded-full bg-electric-soft text-electric flex items-center justify-center font-bold"
                  aria-label={`${job.fit.score}% fit`}
                >
                  {job.fit.score}
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-4 leading-relaxed">
                {job.fit.reasons.join(" · ")}
              </p>
              <div className="mt-4 flex items-center gap-3">
                <Link
                  href={jobUrl(job)}
                  className="text-sm font-bold text-electric"
                >
                  View role
                </Link>
                <button
                  onClick={() => feedback(job._id, "relevant")}
                  className="text-sm text-slate-500 hover:text-slate-900"
                >
                  Relevant
                </button>
                <button
                  onClick={() => feedback(job._id, "not_relevant")}
                  className="text-sm text-slate-500 hover:text-slate-900"
                >
                  Hide
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 text-slate-600">
          Add your skills, role, and location to see a ranked job shortlist.
        </div>
      )}
    </section>
  );
}
