"use client";

import { useEffect, useRef, useState } from "react";
import { getAdmin, writeAdmin } from "@/lib/admin";
import styles from "./AdminCompanyImport.module.css";

type Row = {
  status: string;
  message?: string;
  checkedAt?: string;
  entry: {
    company: { name: string; website: string; careersUrl: string };
    sources: {
      name: string;
      type: string;
      evidenceUrl: string;
      verifiedAt: string;
    }[];
  };
  feedResults?: { name: string; fetched: number; indiaEngineering: number }[];
  sources?: {
    id: string;
    name: string;
    nextScheduledSyncAt: string;
    lastSuccessfulSyncAt?: string;
    syncState?: string;
  }[];
};
type Batch = {
  _id: string;
  batchId: string;
  status: string;
  claimedUntil?: string;
  interrupted?: boolean;
  rows: Row[];
};
type History = Pick<Batch, "_id" | "batchId" | "status">[];
const labels: Record<string, string> = {
  ready: "Ready",
  pending: "Checking",
  "already-exists": "Already exists",
  conflict: "Conflict",
  unsupported: "Unsupported",
  "verification-failed": "Verification failed",
  imported: "Imported",
  expired: "Verification expired",
};
const time = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export default function AdminCompanyImport() {
  const [batch, setBatch] = useState<Batch | null>(null);
  const [history, setHistory] = useState<History>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const lock = useRef(false);
  const live = useRef(true);
  const request = useRef(0);
  const selectedId = batch?._id;
  const selectedStatus = batch?.status;
  useEffect(() => {
    live.current = true;
    getAdmin<History>("/admin/company-imports")
      .then((data) => {
        if (live.current)
          setHistory((old) => [
            ...old,
            ...data.filter(
              (item) => !old.some((known) => known._id === item._id),
            ),
          ]);
      })
      .catch((e) => {
        if (live.current) setError(e.message);
      });
    return () => {
      live.current = false;
    };
  }, []);
  useEffect(() => {
    if (
      !selectedId ||
      !selectedStatus ||
      !["queued", "validating", "importing"].includes(selectedStatus)
    )
      return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const id = selectedId;
    const poll = async () => {
      const version = request.current;
      let again = true;
      try {
        const next = await getAdmin<Batch>(`/admin/company-imports/${id}`);
        if (!cancelled && version === request.current) {
          setBatch(next);
          setError("");
          if (
            next.interrupted ||
            !["queued", "validating", "importing"].includes(next.status)
          )
            again = false;
        }
      } catch (e) {
        if (!cancelled && version === request.current)
          setError(
            e instanceof Error
              ? e.message
              : "Status unavailable. Your batch is retained.",
          );
      }
      if (!cancelled && again) timer = setTimeout(poll, 5000);
    };
    timer = setTimeout(poll, 1500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [selectedId, selectedStatus]);
  const perform = async (action: () => Promise<Batch>) => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    const version = ++request.current;
    try {
      const next = await action();
      if (!live.current || version !== request.current) return;
      setBatch(next);
      setAcknowledged(false);
      setHistory((old) => [
        { _id: next._id, batchId: next.batchId, status: next.status },
        ...old.filter((item) => item._id !== next._id),
      ]);
    } catch (e) {
      if (live.current)
        setError(
          e instanceof Error ? e.message : "Request failed. Retry safely.",
        );
    } finally {
      lock.current = false;
      if (live.current) setBusy(false);
    }
  };
  const interrupted = Boolean(batch?.interrupted);
  const processing = Boolean(
    batch &&
    ["queued", "validating", "importing"].includes(batch.status) &&
    !interrupted,
  );
  const ready = batch?.rows.filter((row) => row.status === "ready").length || 0;
  const download = () => {
    if (!batch) return;
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(batch, null, 2)], { type: "application/json" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${batch.batchId}-results.json`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <section className={styles.panel} aria-labelledby="company-import-title">
      <h2 id="company-import-title">Import verified companies</h2>
      <p>
        Upload one researched JSON batch. Review the evidence, then import once.
        Jobs are fetched by the next scheduled sync—not by this upload.
      </p>
      <div className={styles.controls}>
        <label className={styles.file}>
          JSON batch · up to 25 companies / 50 sources / 500 KiB
          <input
            type="file"
            accept=".json,application/json"
            disabled={busy || processing}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file) return;
              void perform(async () => {
                if (file.size > 500 * 1024)
                  throw new Error("File exceeds 500 KiB.");
                let data: unknown;
                try {
                  data = JSON.parse(await file.text());
                } catch {
                  throw new Error("Choose a valid JSON file.");
                }
                return writeAdmin<Batch>(
                  "/admin/company-imports",
                  "POST",
                  data,
                );
              });
            }}
          />
        </label>
        <label className={styles.file}>
          Recent batches
          <select
            value={batch?._id || ""}
            disabled={busy}
            onChange={(event) => {
              const id = event.target.value;
              if (id)
                void perform(() =>
                  getAdmin<Batch>(`/admin/company-imports/${id}`),
                );
            }}
          >
            <option value="">Select a batch</option>
            {history.map((item) => (
              <option key={item._id} value={item._id}>
                {item.batchId} · {item.status}
              </option>
            ))}
          </select>
        </label>
      </div>
      {error && (
        <p role="alert" className={styles.error}>
          {error} Previously loaded results are retained.
        </p>
      )}
      {batch && (
        <>
          <p role="status" aria-live="polite">
            <strong>{batch.batchId}</strong> ·{" "}
            {interrupted
              ? "Processing interrupted; retry safely."
              : batch.status}{" "}
            · {ready} ready / {batch.rows.length} companies
          </p>
          <p>
            Feed checks verify availability, not employer ownership. Review the
            research evidence. Valid feeds with zero India engineering roles can
            still be imported.
          </p>
          <div className={styles.rows}>
            {batch.rows.map((row, index) => (
              <article key={index} className={styles.row}>
                <div className={styles.heading}>
                  <h3>{row.entry.company.name}</h3>
                  <span>{labels[row.status] || row.status}</span>
                </div>
                <div className={styles.links}>
                  <a
                    href={row.entry.company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Official website ↗
                  </a>
                  <a
                    href={row.entry.company.careersUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Careers ↗
                  </a>
                </div>
                {row.entry.sources.map((source, i) => (
                  <p key={i}>
                    {source.name} ({source.type}) ·{" "}
                    <a
                      href={source.evidenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Research evidence ↗
                    </a>{" "}
                    · researched {time(source.verifiedAt)} IST
                  </p>
                ))}
                {row.feedResults?.map((feed, i) => (
                  <p key={i}>
                    {feed.name}: {feed.fetched} feed listings ·{" "}
                    {feed.indiaEngineering} India engineering openings
                  </p>
                ))}
                {row.checkedAt && (
                  <p>
                    Feed checked {time(row.checkedAt)} IST · expires after 24
                    hours
                  </p>
                )}
                {row.message && <p>{row.message}</p>}
                {row.sources?.map((source) => (
                  <p key={source.id}>
                    {source.syncState === "unavailable"
                      ? "Source unavailable"
                      : source.lastSuccessfulSyncAt
                        ? `Last synced ${time(source.lastSuccessfulSyncAt)} IST`
                        : source.syncState === "attempted"
                          ? "First sync not completed"
                          : "Awaiting first sync"}{" "}
                    · {source.name} · scheduled{" "}
                    {time(source.nextScheduledSyncAt)} IST. See Job sources for
                    current sync status.
                  </p>
                ))}
              </article>
            ))}
          </div>
          <div className={styles.actions}>
            {ready > 0 && !processing && (
              <label className={styles.confirm}>
                <input
                  type="checkbox"
                  checked={acknowledged}
                  disabled={busy}
                  onChange={(event) => setAcknowledged(event.target.checked)}
                />
                I reviewed the official-link research evidence and approve these
                companies.
              </label>
            )}
            <div className={styles.controls}>
              <button
                className="button primary"
                disabled={busy || processing || !ready || !acknowledged}
                onClick={() =>
                  void perform(() =>
                    writeAdmin<Batch>(
                      `/admin/company-imports/${batch._id}/confirm`,
                      "POST",
                      { acknowledgeEvidence: true },
                    ),
                  )
                }
              >
                {busy ? "Processing…" : `Import ${ready} verified companies`}
              </button>
              <button
                className="button"
                disabled={busy || processing}
                onClick={() =>
                  void perform(() =>
                    writeAdmin<Batch>(
                      `/admin/company-imports/${batch._id}/retry`,
                      "POST",
                    ),
                  )
                }
              >
                Recheck / retry verification
              </button>
              <button className="button" disabled={busy} onClick={download}>
                Download results
              </button>
              <button
                className="button"
                disabled={busy}
                onClick={() =>
                  void perform(() =>
                    getAdmin<Batch>(`/admin/company-imports/${batch._id}`),
                  )
                }
              >
                Refresh status
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
