"use client";
import Link from "next/link";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/components/AuthProvider";
import JobBrowser from "@/components/JobBrowser";
import JobCard from "@/components/JobCard";
import MembershipStatus from "@/components/MembershipStatus";
import RecommendationPanel from "@/components/RecommendationPanel";
import UpgradePanel from "@/components/UpgradePanel";
import Icon from "@/components/ui/Icon";
import { getSavedJobs, saveJob, savedIds, unsaveJob } from "@/lib/auth";
import { type Job } from "@/lib/reerhub";
import { isPro } from "@/lib/membership";
import DashboardGuidance from "@/components/DashboardGuidance";
import { dashboardView } from "@/lib/dashboard";

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
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    getSavedJobs(page)
      .then((data) => {
        if (active) {
          const totalPages = data.meta?.totalPages || 1;
          if (page > totalPages || (page > 1 && !(data.data || []).length)) {
            setPage(Math.max(1, Math.min(page - 1, totalPages)));
            return;
          }
          setJobs(data.data || []);
          setPages(data.meta?.totalPages || 1);
          setError(false);
        }
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page, attempt, ids]);
  if (loading)
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
function Dashboard() {
  const { user, loading } = useAuth();
  const params = useSearchParams();
  const router = useRouter();
  const pro = isPro(user);
  const [ids, setIds] = useState<string[]>([]);
  const pendingSaves = useRef(new Set<string>());
  const mounted = useRef(false);
  const [savingIds, setSavingIds] = useState<string[]>([]);
  useEffect(() => {
    let active = true;
    mounted.current = true;
    if (user)
      savedIds()
        .then((value) => {
          if (active) setIds(value);
        })
        .catch(() => {
          if (active) toast.error("Saved roles could not load");
        });
    return () => {
      active = false;
      mounted.current = false;
    };
  }, [user]);
  const toggleSave = useCallback(async (id: string, saved: boolean) => {
    if (pendingSaves.current.has(id)) return;
    pendingSaves.current.add(id);
    setSavingIds([...pendingSaves.current]);
    try {
      if (saved) await saveJob(id);
      else await unsaveJob(id);
      if (!mounted.current) return;
      setIds((prev) =>
        saved ? [...new Set([...prev, id])] : prev.filter((x) => x !== id),
      );
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
  const requested = params.get("view");
  const view = dashboardView(requested, pro);
  const tabs = [
    ...(pro ? [{ id: "matches", label: "Your matches" }] : []),
    { id: "discover", label: "Discover jobs" },
    {
      id: "saved",
      label: `Saved roles${ids.length ? ` (${ids.length})` : ""}`,
    },
  ];
  return (
    <div className="page-container py-9 sm:py-12">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="mb-2 text-sm font-semibold text-primary-deep">
            {pro ? "Your Pro workspace" : "Your discovery workspace"}
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Good to see you, {user.name.split(" ")[0]}.
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {pro
              ? "Explore your ranked recommendations, official openings, and saved shortlist."
              : "Find official openings, build your shortlist, and choose your next move."}
          </p>
        </div>
        <Link href="/profile" className="btn-secondary">
          <Icon name="user" className="h-4 w-4" />
          Edit my profile
        </Link>
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">
          <DashboardGuidance profile={user.profile} pro={pro} />
          {pro ? (
            <MembershipStatus user={user} />
          ) : (
            <div className="surface-panel flex items-center gap-4 p-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <Icon name="briefcase" />
              </span>
              <div>
                <h2 className="font-semibold text-ink">
                  Free to explore. Ready when you are.
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Full job details, direct Apply links, and saved roles are
                  included in your free account.
                </p>
              </div>
            </div>
          )}
          <div
            className="workspace-tabs my-7"
            role="tablist"
            aria-label="Dashboard views"
          >
            {tabs.map((tab, index) => (
              <button
                role="tab"
                key={tab.id}
                id={`tab-${tab.id}`}
                aria-selected={view === tab.id}
                aria-controls="dashboard-content"
                tabIndex={view === tab.id ? 0 : -1}
                onKeyDown={(event) => {
                  if (
                    !["ArrowRight", "ArrowLeft", "Home", "End"].includes(
                      event.key,
                    )
                  )
                    return;
                  event.preventDefault();
                  const next =
                    event.key === "Home"
                      ? 0
                      : event.key === "End"
                        ? tabs.length - 1
                        : (index +
                            (event.key === "ArrowRight"
                              ? 1
                              : tabs.length - 1)) %
                          tabs.length;
                  (
                    event.currentTarget.parentElement?.children[
                      next
                    ] as HTMLElement
                  )?.focus();
                  router.push(`/dashboard?view=${tabs[next].id}`, {
                    scroll: false,
                  });
                }}
                onClick={() =>
                  router.push(`/dashboard?view=${tab.id}`, { scroll: false })
                }
              >
                {tab.label}
              </button>
            ))}
          </div>
          <section
            id="dashboard-content"
            role="tabpanel"
            aria-labelledby={`tab-${view}`}
          >
            {view === "matches" ? (
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
          {!pro && <UpgradePanel compact />}
          {pro && (
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
              ReerHub helps you discover roles. Applications are completed
              directly on the company’s official hiring page.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="page-container py-12">
          <div className="skeleton h-80 rounded-2xl" />
        </div>
      }
    >
      <Dashboard />
    </Suspense>
  );
}
