"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  adminAuthPath,
  getAdmin,
  getAdminPage,
  type AdminPage,
} from "@/lib/admin";
import {
  operationLabel,
  operationsTime,
  operationsToday,
  type OperationsKind,
  type OperationsRow,
  type OperationsSummary,
} from "@/lib/admin-operations";
import styles from "./AdminOperations.module.css";
const FILTERS = {
  changes: ["created", "updated", "reopened", "closed"],
  syncs: ["running", "success", "partial", "failed"],
  emails: ["delivered", "sending", "failed", "review"],
  sources: [],
};
const KINDS: { value: OperationsKind; label: string }[] = [
  { value: "changes", label: "Job changes" },
  { value: "syncs", label: "Sync runs" },
  { value: "emails", label: "Match emails" },
  { value: "sources", label: "Source schedule" },
];
const valueText = (value: unknown) =>
  value === undefined
    ? "Not recorded"
    : typeof value === "string"
      ? value
      : JSON.stringify(value);
export default function AdminOperations({ version }: { version: number }) {
  const router = useRouter();
  const [day, setDay] = useState(operationsToday);
  const [kind, setKind] = useState<OperationsKind>("changes");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [attempt, setAttempt] = useState(0);
  const [summary, setSummary] = useState<OperationsSummary | null>(null);
  const [rows, setRows] = useState<AdminPage<OperationsRow> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    const params = new URLSearchParams({
      date: day,
      kind,
      status,
      page: String(page),
      limit: "25",
    });
    Promise.all([
      getAdmin<OperationsSummary>(`/admin/operations?date=${day}`),
      getAdminPage<OperationsRow>(`/admin/operations/rows?${params}`),
    ])
      .then(([data, list]) => {
        if (active) {
          setSummary(data);
          setRows(list);
          setError("");
        }
      })
      .catch((e) => {
        if (active) {
          if (e.status === 401 || e.status === 403)
            router.replace(adminAuthPath());
          else setError(e.message || "Operations could not load.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [day, kind, status, page, attempt, version, router]);
  const refresh = () => {
    setLoading(true);
    setAttempt((value) => value + 1);
  };
  const choose = (nextKind: OperationsKind, nextStatus = "") => {
    if (nextKind === kind && nextStatus === status && page === 1) {
      refresh();
      return;
    }
    setLoading(true);
    setKind(nextKind);
    setStatus(nextStatus);
    setPage(1);
  };
  return (
    <div className={styles.root}>
      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>Daily operations</h2>
            <p>
              Job changes and daily match-email attempts · all dates and times
              in IST.
            </p>
          </div>
          <div className={styles.controls}>
            <label>
              Report date
              <input
                type="date"
                value={day}
                max={operationsToday()}
                onChange={(event) => {
                  if (event.target.value) {
                    setLoading(true);
                    setDay(event.target.value);
                    setPage(1);
                  }
                }}
              />
            </label>
            <button
              className="button compact"
              onClick={refresh}
              disabled={loading}
            >
              Refresh report
            </button>
          </div>
        </div>
        <div className={styles.body}>
          {error && (
            <div className="notice error" role="alert">
              {error} Previous data is not shown as current.
              <button className="button compact" onClick={refresh}>
                Retry
              </button>
            </div>
          )}
          {loading ? (
            <p role="status">Loading operations…</p>
          ) : !error && summary ? (
            <>
              <div className="metrics">
                {Object.entries(summary.changes).map(([key, count]) => (
                  <button
                    className="metric"
                    key={key}
                    onClick={() => choose("changes", key)}
                  >
                    <span className="metric-top">
                      {operationLabel(key)} events
                    </span>
                    <strong>{count}</strong>
                    <span className="metric-foot">View jobs →</span>
                  </button>
                ))}
              </div>
              <p className="subtle">
                Counts are recorded change events, not unique jobs. Closed jobs
                are retained, not deleted. Linked job details reflect their
                current state.
              </p>
              <div className={styles.summaryGrid}>
                <section>
                  <h3>Sync results</h3>
                  <div className={styles.counts}>
                    {Object.entries(summary.syncs).map(([key, count]) => (
                      <button key={key} onClick={() => choose("syncs", key)}>
                        {operationLabel(key)} <strong>{count}</strong>
                      </button>
                    ))}
                  </div>
                  <p className="subtle">
                    Runs started on the selected IST date; partial or failed
                    feeds need review.
                  </p>
                </section>
                <section>
                  <h3>Match-email attempts</h3>
                  <div className={styles.counts}>
                    {Object.entries(summary.deliveries).map(([key, count]) => (
                      <button key={key} onClick={() => choose("emails", key)}>
                        {operationLabel(key)} <strong>{count}</strong>
                      </button>
                    ))}
                  </div>
                  <p className="subtle">
                    SMTP accepted is not proof of inbox delivery or opening.
                    Attempts are grouped by attempted time, not the legacy UTC
                    delivery-claim day. Magic-link emails are not included.
                  </p>
                </section>
              </div>
              <section className={styles.run}>
                <h3>Latest scheduled digest run for this date</h3>
                {summary.digestRun ? (
                  <>
                    <p>
                      {operationLabel(summary.digestRun.status)} · Started{" "}
                      {operationsTime(summary.digestRun.startedAt)} · Completed{" "}
                      {operationsTime(summary.digestRun.completedAt)}
                    </p>
                    {summary.digestRun.summary ? (
                      <>
                        <p>
                          {summary.digestRun.summary.evaluated} evaluated ·{" "}
                          {summary.digestRun.summary.sent} sent ·{" "}
                          {summary.digestRun.summary.failed} failures ·{" "}
                          {summary.digestRun.summary.reviewRequired} need review
                        </p>
                        <h4>Skipped in this run</h4>
                        <ul className={styles.skipList}>
                          {Object.entries(
                            summary.digestRun.summary.skipped,
                          ).map(([reason, count]) => (
                            <li key={reason}>
                              {operationLabel(reason)}: <strong>{count}</strong>
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <p>Summary not recorded for this run.</p>
                    )}
                  </>
                ) : (
                  <p>
                    No scheduled digest-run summary recorded for this date.
                    Historical skip reasons cannot be reconstructed; recording
                    begins with this release.
                  </p>
                )}
              </section>
              <details className={styles.run}>
                <summary>Current automation schedule</summary>
                <p>
                  Scheduler{" "}
                  {summary.scheduler.enabled
                    ? "enabled in API configuration"
                    : "disabled in API configuration"}
                  . This is not a scheduler heartbeat.
                </p>
                <p>
                  Source start windows:{" "}
                  {summary.scheduler.sourceTimes.join(" and ")} IST. Match
                  emails: {summary.scheduler.digestTime} IST onward, after due
                  source work and subscription reconciliation.
                </p>
                <ul>
                  {summary.scheduler.tasks.map((task) => (
                    <li key={task.key}>
                      {operationLabel(task.key)} · Due{" "}
                      {operationsTime(task.dueAt)} · Last completed{" "}
                      {operationsTime(task.lastCompletedAt)}
                      {task.claimedUntil &&
                      new Date(task.claimedUntil) > new Date()
                        ? " · Claimed / working"
                        : ""}
                    </li>
                  ))}
                </ul>
                <p className="subtle">
                  Schedule is current, regardless of report date. Offline
                  servers and slow feeds can delay execution.
                </p>
              </details>
              <p className="subtle">
                Report refreshed {operationsTime(summary.generatedAt)} IST.
              </p>
            </>
          ) : null}
        </div>
      </section>
      <section className="panel">
        <div className="panel-head">
          <div className={styles.controls}>
            {KINDS.map((section) => (
              <button
                className="button compact"
                key={section.value}
                aria-pressed={kind === section.value}
                onClick={() => choose(section.value)}
              >
                {section.label}
              </button>
            ))}
          </div>
          <label>
            Status
            <select
              value={status}
              disabled={kind === "sources"}
              onChange={(event) => choose(kind, event.target.value)}
            >
              <option value="">All</option>
              {FILTERS[kind].map((value) => (
                <option key={value} value={value}>
                  {operationLabel(value)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className={styles.body}>
          {kind === "sources" && (
            <p className="subtle">
              Current active sources—not a historical snapshot. Next scheduled
              start is not guaranteed completion.
            </p>
          )}
          {loading ? (
            <p role="status">Loading records…</p>
          ) : error ? (
            <p>Records unavailable. Retry the report above.</p>
          ) : rows?.data.length ? (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>
                      {kind === "emails"
                        ? "Member"
                        : kind === "sources"
                          ? "Source"
                          : "Job / source"}
                    </th>
                    <th>Status & timing (IST)</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.data.map((row) => (
                    <tr key={row._id}>
                      <td>
                        {kind === "emails" ? (
                          <>
                            <strong>
                              {row.userId?.name || "Deleted member"}
                            </strong>
                            <span className="subtle">
                              {row.userId?.email || "Email unavailable"}
                            </span>
                          </>
                        ) : kind === "changes" ? (
                          <>
                            {row.jobId ? (
                              <a
                                href={`/jobs/${row.jobId._id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {row.jobId.title}
                              </a>
                            ) : (
                              "Job unavailable"
                            )}
                            <span className="subtle">
                              {row.jobId?.companyId?.name} ·{" "}
                              {row.jobId?.sourceId?.name}
                            </span>
                          </>
                        ) : (
                          <>
                            <strong>
                              {kind === "sources"
                                ? row.name
                                : row.sourceId?.name || "Source unavailable"}
                            </strong>
                            <span className="subtle">
                              {row.companyId?.name}
                            </span>
                          </>
                        )}
                      </td>
                      <td>
                        <strong>
                          {kind === "sources"
                            ? row.syncClaimedUntil &&
                              new Date(row.syncClaimedUntil) > new Date()
                              ? "Claimed / working"
                              : "Scheduled"
                            : operationLabel(
                                row.type || row.status || "Unknown",
                              )}
                        </strong>
                        <span className="subtle">
                          {kind === "sources"
                            ? `Next: ${operationsTime(row.nextScheduledSyncAt)}`
                            : operationsTime(
                                row.detectedAt ||
                                  row.startedAt ||
                                  row.attemptedAt,
                              )}
                        </span>
                        {row.completedAt && (
                          <span className="subtle">
                            Completed {operationsTime(row.completedAt)}
                          </span>
                        )}
                        {row.deliveredAt && (
                          <span className="subtle">
                            SMTP accepted {operationsTime(row.deliveredAt)}
                          </span>
                        )}
                      </td>
                      <td>
                        {kind === "sources" ? (
                          <>
                            <p>
                              Last attempt{" "}
                              {operationsTime(row.lastAttemptedSyncAt)}
                            </p>
                            <p>
                              Last successful sync{" "}
                              {operationsTime(row.lastSuccessfulSyncAt)}
                            </p>
                          </>
                        ) : kind === "emails" ? (
                          <ul>
                            {row.jobIds?.map((job) => (
                              <li key={job._id}>
                                <a
                                  href={`/jobs/${job._id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {job.title}
                                </a>{" "}
                                · {job.companyId?.name}
                              </li>
                            ))}
                          </ul>
                        ) : kind === "syncs" ? (
                          <>
                            <p>
                              {Object.entries(row.stats || {})
                                .map(
                                  ([key, count]) =>
                                    `${operationLabel(key)}: ${count}`,
                                )
                                .join(" · ")}
                            </p>
                            {[
                              ...(row.errors || []),
                              ...(row.warnings || []),
                            ].map((message, index) => (
                              <p key={index}>{message}</p>
                            ))}
                          </>
                        ) : Object.keys(row.changes || {}).length ? (
                          <details>
                            <summary>View changed fields</summary>
                            {Object.entries(row.changes || {}).map(
                              ([field, change]) => (
                                <div className={styles.change} key={field}>
                                  <strong>{field}</strong>
                                  <p>Before: {valueText(change.old)}</p>
                                  <p>After: {valueText(change.new)}</p>
                                </div>
                              ),
                            )}
                          </details>
                        ) : (
                          <p>
                            {row.type === "closed"
                              ? "Marked closed after a successful source refresh."
                              : row.type === "reopened"
                                ? "Previously closed opening became active."
                                : row.type === "created"
                                  ? "New indexed opening."
                                  : "No field-level difference recorded."}
                          </p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>
              No{" "}
              {KINDS.find(
                (section) => section.value === kind,
              )?.label.toLowerCase()}{" "}
              recorded
              {kind !== "sources" ? " for this IST date and filter" : ""}.
            </p>
          )}
          {!loading && !error && rows && rows.pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                className="button compact"
                disabled={page <= 1}
                onClick={() => {
                  setLoading(true);
                  setPage(page - 1);
                }}
              >
                Previous
              </button>
              <span>
                Page {page} of {rows.pagination.totalPages} ·{" "}
                {rows.pagination.total} records
              </span>
              <button
                className="button compact"
                disabled={page >= rows.pagination.totalPages}
                onClick={() => {
                  setLoading(true);
                  setPage(page + 1);
                }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
