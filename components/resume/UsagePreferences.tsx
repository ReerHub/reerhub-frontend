"use client";
import { useEffect, useState } from "react";
import { METRICS_KEY } from "@/lib/resume/metrics";
export default function UsagePreferences() {
  const [enabled, setEnabled] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    Promise.resolve().then(() => {
      try {
        setEnabled(localStorage.getItem(METRICS_KEY) === "yes");
      } catch {
        setError(
          "Device preferences are unavailable. Usage measurement stays off.",
        );
      }
    });
  }, []);
  return (
    <section className="usage-preferences">
      <h2>Optional usage counts</h2>
      <p>
        Help us improve by sharing daily counts of builder starts, PDF
        downloads, cloud saves and AI suggestions received. This is off by
        default. We store only the event name, date and aggregate count for up
        to 90 days—no resume content, account details or page URLs. You can turn
        it off here at any time.
      </p>
      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => {
            try {
              localStorage.setItem(
                METRICS_KEY,
                e.target.checked ? "yes" : "no",
              );
              setEnabled(e.target.checked);
              setError("");
            } catch {
              setError(
                "Could not save this preference. Usage measurement stays off.",
              );
              setEnabled(false);
            }
          }}
        />
        <span>Share anonymous usage counts</span>
      </label>
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
