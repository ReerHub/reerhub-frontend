"use client";
import Link from "@/components/AppLink";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/components/AuthProvider";
import JobBrowser from "@/components/JobBrowser";
import JobCard from "@/components/JobCard";
import RecommendationPanel from "@/components/RecommendationPanel";
import UpgradePanel from "@/components/UpgradePanel";
import Icon from "@/components/ui/Icon";
import { getSavedJobs } from "@/lib/auth";
import { useSavedJobs, toggleSaved } from "@/lib/saved-store";
import { type Job } from "@/lib/reerhub";
import { isPro } from "@/lib/membership";

function SavedRoles({
  ids,
  onSave,
  savingIds,
}: {
  ids: string[];
  onSave: (id: string, saved: boolean) => void;
  savingIds: string[];
}) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadedPage, setLoadedPage] = useState(0);
  const [error, setError] = useState(false);
  const params = useSearchParams();
  const page = Math.max(1, Number.parseInt(params.get("page") || "1", 10) || 1);
  const setPage = useCallback((target: number, replace = false) => {
    const url = new URL(window.location.href);
    if (target > 1) url.searchParams.set("page", String(target));
    else url.searchParams.delete("page");
    const href = `${url.pathname}${url.search}${url.hash}`;
    if (replace) window.history.replaceState(null, "", href);
    else window.history.pushState(null, "", href);
  }, []);
  const [pages, setPages] = useState(1);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    getSavedJobs(page, controller.signal)
      .then((data) => {
        if (active) {
          const totalPages = data.meta?.totalPages || 1;
          if (page > totalPages || (page > 1 && !(data.data || []).length)) {
            setPage(Math.max(1, Math.min(page - 1, totalPages)), true);
            return;
          }
          setLoadedPage(page);
          setJobs(data.data || []);
          setPages(data.meta?.totalPages || 1);
          setError(false);
        }
      })
      .catch(() => {
        if (active) {
          setLoadedPage(page);
          setError(true);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [page, attempt, ids, setPage]);
  if (loading || loadedPage !== page)
    return (
      <div className="grid gap-5 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div className="skeleton h-64 rounded-2xl" key={i} />
        ))}
      </div>
    );
  if (error)
    return (
      <div className="surface-panel p-8">
        <h2 className="font-semibold text-ink">
          Your shortlist couldn’t load.
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Your saved roles are still yours. Try loading them again.
        </p>
        <button
          className="btn-secondary mt-5"
          onClick={() => {
            setLoading(true);
            setAttempt((value) => value + 1);
          }}
        >
          Try again
        </button>
      </div>
    );
  const visible = jobs.filter((j) => ids.includes(j._id));
  if (page > 1 && visible.length === 0)
    return (
      <div role="status" className="surface-panel p-8">
        Loading your shortlist…
      </div>
    );
  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-ink">
          Your shortlist
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Keep the openings you want to revisit in one place.
        </p>
      </div>
      {visible.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              saved
              showSave
              savePending={savingIds.includes(job._id)}
              onToggleSave={onSave}
            />
          ))}
        </div>
      ) : (
        <div className="surface-panel flex flex-col items-center p-10 text-center">
          <Icon name="bookmark" className="mb-4 h-8 w-8 text-primary" />
          <h3 className="text-xl font-bold text-ink">
            Your next role could be one save away.
          </h3>
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
            Save openings while you explore. They’ll be here when you’re ready
            to review the details and apply.
          </p>
          <Link href="/dashboard?view=discover" className="btn-primary mt-5">
            Discover jobs
          </Link>
        </div>
      )}
      {pages > 1 && (
        <div className="mt-6 flex justify-center gap-3">
          <button
            className="btn-secondary"
            disabled={page === 1}
            onClick={() => {
              setLoading(true);
              setPage(page - 1);
            }}
          >
            Previous
          </button>
          <span className="self-center text-sm text-slate-600">
            {page} / {pages}
          </span>
          <button
            className="btn-secondary"
            disabled={page === pages}
            onClick={() => {
              setLoading(true);
              setPage(page + 1);
            }}
          >
            Next
          </button>
        </div>
      )}
    </>
  );
}
function Dashboard({ view }: { view: "discover" | "saved" | "matches" }) {
  const { user, loading } = useAuth();
  const pro = isPro(user);
  const ids = useSavedJobs(user?.id);
  const pendingSaves = useRef(new Set<string>());
  const mounted = useRef(false);
  const [savingIds, setSavingIds] = useState<string[]>([]);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, [user]);
  const toggleSave = useCallback(async (id: string, saved: boolean) => {
    if (pendingSaves.current.has(id)) return;
    pendingSaves.current.add(id);
    setSavingIds([...pendingSaves.current]);
    try {
      await toggleSaved(id, saved);
      if (!mounted.current) return;
      toast.success(
        saved ? "Added to your shortlist" : "Removed from your shortlist",
      );
    } catch {
      if (mounted.current) toast.error("Could not update saved role");
    } finally {
      pendingSaves.current.delete(id);
      if (mounted.current) setSavingIds([...pendingSaves.current]);
    }
  }, []);
  if (loading)
    return (
      <div className="page-container py-12">
        <div className="skeleton mb-6 h-28 rounded-2xl" />
        <div className="skeleton h-80 rounded-2xl" />
      </div>
    );
  if (!user)
    return (
      <div className="page-container py-16">
        <h1 className="text-3xl font-bold text-ink">
          Your workspace is waiting.
        </h1>
        <Link href="/login?next=/dashboard" className="btn-primary mt-6">
          Sign in to continue
        </Link>
      </div>
    );
  return (
    <div
      className={`dashboard-page page-container ${view === "discover" ? "discovery-page py-4 sm:py-8" : "py-9 sm:py-12"}`}
    >
      <div
        className={`flex flex-wrap items-start justify-between ${view === "discover" ? "mb-4 gap-2" : "mb-8 gap-5"}`}
      >
        <div>
          {view !== "discover" && (
            <p className="mb-2 text-sm font-semibold text-primary-deep">
              YOUR WORKSPACE
            </p>
          )}
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
            {view === "matches"
              ? "Your matches"
              : view === "saved"
                ? "Saved roles"
                : "Find jobs"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {view === "matches"
              ? "A little clarity about where your skills fit."
              : view === "saved"
                ? "The possibilities you want to come back to."
                : "Explore official openings and take your next step."}
          </p>
        </div>
        <Link
          href="/profile"
          className={
            view === "discover"
              ? "inline-flex min-h-11 items-center gap-2 text-sm text-primary"
              : "btn-secondary"
          }
        >
          <Icon name="user" className="h-4 w-4" />
          Edit my profile
        </Link>
      </div>
      <div className="dashboard-layout grid gap-6">
        <div className="min-w-0">
          <section
            id="dashboard-content"
            aria-label={
              view === "matches"
                ? "Matches"
                : view === "saved"
                  ? "Saved roles"
                  : "Job results"
            }
          >
            {view === "matches" && !pro ? (
              <UpgradePanel />
            ) : view === "matches" ? (
              <RecommendationPanel
                savedIds={ids}
                savingIds={savingIds}
                onToggleSave={toggleSave}
              />
            ) : view === "saved" ? (
              <SavedRoles ids={ids} savingIds={savingIds} onSave={toggleSave} />
            ) : (
              <JobBrowser
                heading="Open roles to explore"
                savedIds={ids}
                savingIds={savingIds}
                showSave
                onToggleSave={toggleSave}
              />
            )}
          </section>
        </div>
        <aside className="space-y-5">
          {!pro && view !== "matches" && <UpgradePanel compact />}
          {pro && view === "matches" && (
            <section className="surface-panel p-6">
              <h2 className="font-semibold text-ink">
                Prefer to browse yourself?
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Your ranked matches are here. All official openings are still
                available in discovery.
              </p>
              <Link
                href="/jobs"
                className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary"
              >
                Browse all jobs
                <Icon name="arrow" className="h-4 w-4" />
              </Link>
            </section>
          )}
          <section className="p-5">
            <p className="flex items-center gap-2 text-sm font-semibold text-teal-800">
              <Icon name="shield" className="h-4 w-4" />
              Always apply at the source
            </p>
            <p className="mt-3 text-xs leading-6 text-slate-600">
              REERHUB helps you discover roles. Applications are completed
              directly on the company’s official hiring page.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
export default function MemberResultsPage({
  view,
}: {
  view: "discover" | "saved" | "matches";
}) {
  return (
    <Suspense
      fallback={
        <div className="page-container py-12">
          <div className="skeleton h-80 rounded-2xl" />
        </div>
      }
    >
      <Dashboard view={view} />
    </Suspense>
  );
}
