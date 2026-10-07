"use client";
import Link from "next/link";
import { Suspense, useCallback, useEffect, useState } from "react";
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

function SavedRoles({
  ids,
  onSave,
}: {
  ids: string[];
  onSave: (id: string, saved: boolean) => void;
}) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  useEffect(() => {
    let active = true;
    getSavedJobs(page)
      .then((data) => {
        if (active) {
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
  }, [page]);
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
        <p>Saved roles could not load. Refresh to try again.</p>
      </div>
    );
  const visible = jobs.filter((j) => ids.includes(j._id));
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
            onClick={() => setPage(page - 1)}
          >
            Previous
          </button>
          <span className="self-center text-sm text-slate-600">
            {page} / {pages}
          </span>
          <button
            className="btn-secondary"
            disabled={page === pages}
            onClick={() => setPage(page + 1)}
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
  useEffect(() => {
    if (user)
      savedIds()
        .then(setIds)
        .catch(() => toast.error("Saved roles could not load"));
  }, [user]);
  const toggleSave = useCallback(async (id: string, saved: boolean) => {
    try {
      if (saved) await saveJob(id);
      else await unsaveJob(id);
      setIds((prev) =>
        saved ? [...new Set([...prev, id])] : prev.filter((x) => x !== id),
      );
      toast.success(
        saved ? "Added to your shortlist" : "Removed from your shortlist",
      );
    } catch {
      toast.error("Could not update saved role");
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
  const view =
    requested === "saved"
      ? "saved"
      : !pro && requested === "discover"
        ? "discover"
        : pro
          ? "matches"
          : "discover";
  const tabs = [
    ...(pro ? [{ id: "matches", label: "Your matches" }] : []),
    ...(!pro ? [{ id: "discover", label: "Discover jobs" }] : []),
    {
      id: "saved",
      label: `Saved roles${ids.length ? ` (${ids.length})` : ""}`,
    },
  ];
  const signals = [
    !!user.profile.techTrack,
    !!user.profile.currentRole || !!user.profile.techRoles?.length,
    (user.profile.skills?.length || 0) >= 3,
    user.profile.experienceYears !== undefined,
    !!user.profile.city ||
      (user.profile.remoteType && user.profile.remoteType !== "unknown"),
  ];
  const completion = Math.round(
    (signals.filter(Boolean).length / signals.length) * 100,
  );
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
              ? "Your shortlist is built for you. Start with the strongest matches, then broaden only when you want to."
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
              <RecommendationPanel savedIds={ids} onToggleSave={toggleSave} />
            ) : view === "saved" ? (
              <SavedRoles ids={ids} onSave={toggleSave} />
            ) : (
              <JobBrowser
                heading="Open roles to explore"
                savedIds={ids}
                showSave
                onToggleSave={toggleSave}
              />
            )}
          </section>
        </div>
        <aside className="space-y-5">
          <section className="surface-panel p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-ink">Your profile signals</h2>
              <span className="text-sm font-bold text-primary-deep">
                {completion}%
              </span>
            </div>
            <div className="my-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${completion}%` }}
              />
            </div>
            <p className="text-sm leading-6 text-slate-600">
              {completion === 100
                ? "Your profile is match-ready. Keep your skills and preferences current as your search changes."
                : "Add your target role, at least three skills, track, experience, and location or work preference for reliable Pro matches."}
            </p>
            <Link
              href="/profile"
              className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary"
            >
              {completion === 100
                ? "Review preferences"
                : "Complete my profile"}
              <Icon name="arrow" className="h-4 w-4" />
            </Link>
          </section>
          {!pro && <UpgradePanel compact />}
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
