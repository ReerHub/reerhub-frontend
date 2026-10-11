"use client";
import { useEffect, useRef, useState } from "react";
import { getAdmin, writeAdmin } from "@/lib/admin";

type Repair = {
  status: string;
  processed: number;
  remaining?: number;
  conflicts?: number;
  error?: string;
  completedAt?: string;
};
export default function AdminDataQuality() {
  const [data, setData] = useState<Repair | null>(null),
    [error, setError] = useState(""),
    [pending, setPending] = useState(false),
    [attempt, setAttempt] = useState(0);
  const busy = useRef(false);
  useEffect(() => {
    let active = true,
      timer: ReturnType<typeof setTimeout>;
    const read = async () => {
      try {
        const result = await getAdmin<Repair | null>("/admin/data-quality");
        if (active) {
          setData(result);
          setError("");
          if (result && result.status !== "complete")
            timer = setTimeout(read, 15000);
        }
      } catch {
        if (active)
          setError(
            "Data verification status is unavailable. Refresh to retry.",
          );
      }
    };
    void read();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [attempt]);
  return (
    <section className="panel" aria-label="Job data verification">
      <div className="panel-head">
        <div>
          <h2>Job data verification</h2>
          <p>
            Classification repair does not fetch feeds, close employer roles or
            send emails.
          </p>
        </div>
      </div>
      <div className="modal-body" role="status">
        <p>
          {data
            ? `${data.status} · ${data.processed || 0} processed${data.remaining === undefined ? "" : ` · ${data.remaining} remaining`}`
            : "Verification status not recorded yet."}
        </p>
        {data && data.status !== "complete" && (
          <p>
            India listings and match alerts remain paused until the initial
            verification finishes.
          </p>
        )}
        {(error || data?.error) && <p role="alert">{error || data?.error}</p>}
        <button
          type="button"
          className="button"
          disabled={pending}
          onClick={() => setAttempt((a) => a + 1)}
        >
          Refresh status
        </button>
        {data?.status === "failed" && (
          <button
            type="button"
            className="button"
            disabled={pending}
            onClick={async () => {
              if (busy.current) return;
              busy.current = true;
              setPending(true);
              try {
                await writeAdmin("/admin/data-quality/retry", "POST", {});
                setAttempt((a) => a + 1);
              } catch {
                setError("Could not retry verification.");
              } finally {
                busy.current = false;
                setPending(false);
              }
            }}
          >
            {pending ? "Retrying…" : "Retry verification"}
          </button>
        )}
      </div>
    </section>
  );
}
