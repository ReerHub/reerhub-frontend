"use client";
import { useEffect, useState } from "react";
import { getAdminPage, writeAdmin, type AdminPage } from "@/lib/admin";
type Query = {
  _id: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  status: "new" | "in_progress" | "resolved";
  createdAt: string;
};
const EMPTY: AdminPage<Query> = {
  data: [],
  pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
};
export default function AdminContactInbox({ version }: { version: number }) {
  const [result, setResult] = useState(EMPTY);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (status) params.set("status", status);
    getAdminPage<Query>(`/admin/contact-queries?${params}`)
      .then((data) => {
        if (!cancelled) {
          setResult(data);
          if (page > Math.max(1, data.pagination.totalPages))
            setPage(Math.max(1, data.pagination.totalPages));
          setError("");
        }
      })
      .catch((e) => {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Inbox unavailable");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, status, revision, version]);
  async function update(query: Query, next: Query["status"]) {
    setBusy(query._id);
    setError("");
    try {
      await writeAdmin(`/admin/contact-queries/${query._id}`, "PATCH", {
        status: next,
      });
      setLoading(true);
      setRevision((value) => value + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update query");
    } finally {
      setBusy("");
    }
  }
  return (
    <section className="panel data-panel" aria-busy={loading}>
      <div className="panel-head">
        <h2>Contact inbox</h2>
        <label>
          Status{" "}
          <select
            className="control"
            value={status}
            onChange={(e) => {
              setLoading(true);
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All queries</option>
            <option value="new">New</option>
            <option value="in_progress">In progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </label>
      </div>
      {error && (
        <p role="alert" className="p-5">
          {error}{" "}
          <button
            className="button"
            onClick={() => {
              setLoading(true);
              setRevision((v) => v + 1);
            }}
          >
            Retry
          </button>
        </p>
      )}
      {loading ? (
        <p role="status" className="p-5">
          Loading queries…
        </p>
      ) : !error && !result.data.length ? (
        <p className="p-5">No queries in this view.</p>
      ) : (
        !error &&
        result.data.map((query) => (
          <article key={query._id} className="border-b border-slate-200 p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold">{query.name}</h3>
                <a
                  href={`mailto:${query.email}`}
                  className="underline break-all"
                >
                  {query.email}
                </a>
                <p className="mt-2 text-sm text-slate-500">
                  {query.topic} ·{" "}
                  {new Date(query.createdAt).toLocaleString("en-IN", {
                    timeZone: "Asia/Kolkata",
                  })}{" "}
                  IST
                </p>
              </div>
              <label className="text-sm">
                Query status
                <select
                  aria-label={`Status for ${query.name}`}
                  className="control mt-2 block"
                  disabled={!!busy}
                  value={query.status}
                  onChange={(e) =>
                    void update(query, e.target.value as Query["status"])
                  }
                >
                  <option value="new">New</option>
                  <option value="in_progress">In progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </label>
            </div>
            <p className="mt-4 whitespace-pre-wrap break-words leading-7">
              {query.message}
            </p>
          </article>
        ))
      )}
      <div className="flex flex-wrap items-center justify-between gap-3 p-5">
        <p>
          {result.pagination.total} queries · Page {page} of{" "}
          {Math.max(1, result.pagination.totalPages)}
        </p>
        <div className="flex gap-2">
          <button
            className="button"
            disabled={loading || page <= 1}
            onClick={() => {
              setLoading(true);
              setPage((p) => p - 1);
            }}
          >
            Previous
          </button>
          <button
            className="button"
            disabled={loading || page >= result.pagination.totalPages}
            onClick={() => {
              setLoading(true);
              setPage((p) => p + 1);
            }}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
