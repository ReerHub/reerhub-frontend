"use client";
import { useRef, useState } from "react";
import { writeAdmin } from "@/lib/admin";

type ReviewJob = {
  _id: string;
  locationScope?: string;
  locationReason?: string;
  locationSignature?: string;
};
export default function AdminLocationReview({
  job,
  onSaved,
  disabled,
  onPending,
}: {
  job: ReviewJob;
  onSaved: () => void;
  disabled?: boolean;
  onPending?: (pending: boolean) => void;
}) {
  const [scope, setScope] = useState("india"),
    [url, setUrl] = useState(""),
    [reason, setReason] = useState(""),
    [confirmed, setConfirmed] = useState(false),
    [pending, setPending] = useState(false),
    [error, setError] = useState("");
  const lock = useRef(false);
  return (
    <section className="panel" aria-label="Location evidence review">
      <h3>Location review: {job.locationScope || "awaiting verification"}</h3>
      <p>
        {job.locationReason}. Decide only from official employer evidence; the
        link is recorded, not fetched. A non-India decision removes the job and
        its saved references.
      </p>
      {!job.locationSignature ? (
        <p>Wait for data verification before reviewing this record.</p>
      ) : (
        <fieldset className="form-grid" disabled={pending || disabled}>
          <label className="field">
            Decision
            <select value={scope} onChange={(e) => setScope(e.target.value)}>
              <option value="india">Confirmed India eligibility</option>
              <option value="foreign">
                Not eligible for India — remove job
              </option>
            </select>
          </label>
          <label className="field">
            Official evidence URL
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </label>
          <label className="field field-full">
            Evidence explanation
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </label>
          <label className="check-field field-full">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            I checked official evidence supporting this decision.
          </label>
          {error && <p role="alert">{error}</p>}
          <button
            type="button"
            className="button"
            disabled={
              !confirmed || reason.trim().length < 10 || !url || pending
            }
            onClick={async () => {
              if (lock.current || disabled) return;
              lock.current = true;
              setPending(true);
              onPending?.(true);
              setError("");
              try {
                await writeAdmin(
                  `/admin/jobs/${job._id}/location-review`,
                  "POST",
                  {
                    scope,
                    evidenceUrl: url,
                    reason,
                    signature: job.locationSignature,
                    acknowledgeEvidence: true,
                  },
                );
                onSaved();
              } catch (e) {
                setError(
                  e instanceof Error
                    ? e.message
                    : "Could not save decision. Your evidence is retained.",
                );
              } finally {
                lock.current = false;
                setPending(false);
                onPending?.(false);
              }
            }}
          >
            {pending ? "Saving decision…" : "Save location decision"}
          </button>
        </fieldset>
      )}
    </section>
  );
}
