"use client";

import { useState } from "react";
import Link from "next/link";
import type { MatchingExample } from "@/lib/reerhub";
import { jobUrl } from "@/lib/reerhub";
import { locationLabel } from "@/lib/format";
import JobFreshness from "./JobFreshness";

export default function LiveMatchingExample({
  examples = [],
}: {
  examples?: MatchingExample[];
}) {
  const [selected, setSelected] = useState("");
  const example = examples.find((item) => item.id === selected) || examples[0];
  return (
    <section
      className="match-demo p-5 sm:p-6"
      aria-labelledby="live-match-title"
    >
      <p className="text-xs font-semibold text-primary-deep">
        Live job · Sample profile
      </p>
      <h2 id="live-match-title" className="mt-2 text-xl font-bold text-ink">
        See how Pro finds a match
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        A made-up profile, a real current opening, and the same scoring engine
        used by Pro. No member data is shown.
      </p>
      {example ? (
        <>
          <label
            htmlFor="example-profile"
            className="mt-4 block text-sm font-semibold text-ink"
          >
            Try a sample profile
          </label>
          <select
            id="example-profile"
            value={example.id}
            onChange={(event) => setSelected(event.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-ink"
          >
            {examples.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {example.profile.skills.join(", ")} ·{" "}
            {example.profile.experienceYears} years · Any role in this track ·
            All India · Any work mode
          </p>
          <div
            className="mt-4 border-t border-slate-200 pt-4"
            aria-live="polite"
            aria-atomic="true"
          >
            {example.job && example.fit ? (
              <>
                <p className="text-sm font-semibold text-primary-deep">
                  {example.fit.relevanceScore}% profile relevance
                </p>
                <h3 className="mt-2 text-lg font-bold text-ink">
                  {example.job.title}
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  {example.job.companyId.name} · {locationLabel(example.job)}
                </p>
                <p className="mt-4 text-sm font-semibold text-ink">
                  Why this profile matches
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
                  {example.fit.reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
                <div className="mt-4 text-xs text-slate-600">
                  <JobFreshness job={example.job} />
                </div>
                <Link
                  href={jobUrl(example.job)}
                  prefetch={false}
                  className="btn-secondary mt-4"
                >
                  View this live role
                </Link>
              </>
            ) : (
              <p className="text-sm leading-6 text-slate-600">
                No current role reaches 75% for this sample profile. Try another
                profile or browse all openings.
              </p>
            )}
          </div>
        </>
      ) : (
        <p className="mt-4 text-sm leading-6 text-slate-600">
          Live matching examples are temporarily unavailable. You can still
          browse current openings.
        </p>
      )}
      <p className="mt-4 text-xs leading-6 text-slate-600">
        Your own results depend on your saved profile and current jobs.
        Relevance is not a hiring prediction. This example does not send an
        email.
      </p>
    </section>
  );
}
