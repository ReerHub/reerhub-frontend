"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import CompanyLogo from "@/components/CompanyLogo";
import Icon from "@/components/ui/Icon";
import { listCompanyPage, type CompanyPage } from "@/lib/reerhub";
export default function CompanyDirectory({
  initialData,
  initialKey,
}: {
  initialData: CompanyPage;
  initialKey: string;
}) {
  const params = useSearchParams();
  const query = params.get("q") || "",
    hiring = params.get("hiring") === "true";
  const page = Math.max(1, Number.parseInt(params.get("page") || "1", 10) || 1);
  const key = JSON.stringify([query, hiring, page]);
  const [result, setResult] = useState(initialData);
  const [loadedKey, setLoadedKey] = useState(initialKey);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const loading = loadedKey !== key;
  const filtered = result.data;
  const update = (q: string, hiringOnly: boolean, targetPage = 1) => {
    const next = new URLSearchParams();
    if (q) next.set("q", q);
    if (hiringOnly) next.set("hiring", "true");
    if (targetPage > 1) next.set("page", String(targetPage));
    window.history.replaceState(
      null,
      "",
      `/companies${next.size ? `?${next}` : ""}`,
    );
  };
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(
      () => {
        const read =
          key === initialKey && !attempt
            ? Promise.resolve(initialData)
            : listCompanyPage(
                { page, limit: 50, q: query, hiring: String(hiring) },
                controller.signal,
              );
        read
          .then((data) => {
            if (!controller.signal.aborted) {
              setResult(data);
              setLoadedKey(key);
              setError(false);
            }
          })
          .catch(() => {
            if (!controller.signal.aborted) {
              setError(true);
              setLoadedKey(key);
            }
          });
      },
      key === initialKey ? 0 : 300,
    );
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [key, initialKey, initialData, page, query, hiring, attempt]);
  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <label className="flex w-full max-w-md items-center gap-3 rounded-xl border border-slate-300 bg-white px-4">
          <Icon name="search" className="h-5 w-5 text-slate-600" />
          <span className="sr-only">Search companies or industries</span>
          <input
            className="w-full bg-transparent py-3.5 text-sm text-ink outline-none"
            value={query}
            onChange={(e) => update(e.target.value, hiring)}
            placeholder="Search companies or industries"
          />
        </label>
        <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={hiring}
            onChange={(e) => update(query, e.target.checked)}
            className="h-4 w-4 accent-primary"
          />
          With open roles
        </label>
      </div>
      <p className="mb-5 text-xs font-medium text-slate-600" role="status">
        {loading
          ? "Loading companies…"
          : `${result.pagination.total} companies`}
      </p>
      {error && (
        <div role="alert" className="surface-panel p-6">
          Companies could not load.{" "}
          <button
            className="btn-secondary"
            onClick={() => setAttempt((n) => n + 1)}
          >
            Retry
          </button>
        </div>
      )}
      <div
        aria-busy={loading}
        className="discovery-grid grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {filtered.map((c) => (
          <Link
            prefetch={false}
            key={c._id}
            href={`/companies/${c.slug}`}
            className="company-card job-card group block p-6"
          >
            <div className="flex items-center gap-4">
              <CompanyLogo name={c.name} logoUrl={c.logoUrl} />
              <div className="min-w-0 break-words">
                <h2 className="text-lg font-bold text-ink group-hover:text-primary">
                  {c.name}
                </h2>
                <p className="mt-1 text-xs text-slate-600">
                  {c.industry || "Technology"}
                </p>
              </div>
            </div>
            <p className="my-5 flex items-center gap-1.5 text-xs text-teal-800">
              <Icon name="shield" className="h-4 w-4" />
              Official career page
            </p>
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-sm text-slate-600">
                <strong className="font-bold text-ink">
                  {c.activeJobs || 0}
                </strong>{" "}
                open roles
              </span>
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-primary">
                Explore
                <Icon name="arrow" className="h-4 w-4" />
              </span>
            </div>
          </Link>
        ))}
      </div>
      {!loading && !error && !filtered.length && (
        <div className="surface-panel p-10 text-center">
          <h2 className="text-xl font-bold text-ink">No companies found.</h2>
          <p className="mt-3 text-sm text-slate-600">
            Try another name or show all companies.
          </p>
          <button
            className="btn-secondary mt-5"
            onClick={() => {
              update("", false);
            }}
          >
            Clear search
          </button>
        </div>
      )}
      {result.pagination.totalPages > 1 && (
        <nav
          className="mt-8 flex items-center justify-center gap-4"
          aria-label="Company pages"
        >
          <button
            className="btn-secondary"
            disabled={loading || page <= 1}
            onClick={() => update(query, hiring, page - 1)}
          >
            Previous
          </button>
          <span>
            Page {page} of {result.pagination.totalPages}
          </span>
          <button
            className="btn-secondary"
            disabled={loading || page >= result.pagination.totalPages}
            onClick={() => update(query, hiring, page + 1)}
          >
            Next
          </button>
        </nav>
      )}
    </>
  );
}
