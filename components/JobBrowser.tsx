"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import JobCard from "@/components/JobCard";
import DiscoveryPrompt from "@/components/DiscoveryPrompt";
import { useAuth } from "@/components/AuthProvider";
import { useSavedJobs, toggleSaved } from "@/lib/saved-store";
import SearchFilters, { Filters } from "@/components/SearchFilters";
import {
  listCompanies,
  listJobsWithMeta,
  type Company,
  type Job,
  type TechTrack,
} from "@/lib/reerhub";

const PAGE_SIZE = 21;

const FILTER_KEYS: (keyof Filters)[] = [
  "q",
  "companyId",
  "city",
  "remoteType",
  "techTrack",
  "techRole",
  "skills",
  "seniority",
  "employmentType",
  "sort",
  "indiaOnly",
];

function SkeletonCard() {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="skeleton w-11 h-11 rounded-xl" />
        <div className="flex-1">
          <div className="skeleton h-4 w-3/4 rounded mb-2" />
          <div className="skeleton h-3 w-1/3 rounded" />
        </div>
      </div>
      <div className="skeleton h-3.5 w-1/2 rounded" />
    </div>
  );
}

function EmptyState({
  onClear,
  companyOnly = false,
}: {
  onClear: () => void;
  companyOnly?: boolean;
}) {
  return (
    <div className="col-span-full text-center py-16 px-6 bg-white border border-slate-200/80 rounded-2xl shadow-card">
      <div className="mx-auto w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-5">
        <svg
          className="w-7 h-7 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6"
          />
        </svg>
      </div>
      <h2 className="font-bold text-slate-900 text-lg mb-1.5">
        {companyOnly
          ? "No open India tech roles right now"
          : "No tech roles match those filters"}
      </h2>
      <p className="text-slate-500 text-[15px] mb-6">
        {companyOnly
          ? "We check official sources twice daily. Check back for new openings."
          : "Try a shorter keyword, another city, or browse everything."}
      </p>
      {!companyOnly && (
        <button
          onClick={onClear}
          className="px-6 py-2.5 bg-electric text-white rounded-xl text-sm font-semibold hover:bg-electric-dark transition-all shadow-sm"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

function filtersFromSearchParams(
  sp: { get(name: string): string | null },
  initialCategory: "" | TechTrack,
): Filters {
  return {
    q: sp.get("q") ?? "",
    companyId: sp.get("companyId") ?? "",
    city: sp.get("city") ?? "",
    remoteType: sp.get("remoteType") ?? "",
    techTrack: (sp.get("techTrack") as TechTrack) || initialCategory,
    techRole: sp.get("techRole") ?? "",
    skills: sp.get("skills") ?? "",
    seniority: sp.get("seniority") ?? "",
    employmentType: sp.get("employmentType") ?? "",
    sort: sp.get("sort") === "az" ? "az" : "",
    indiaOnly: sp.get("indiaOnly") !== "false",
  };
}

function filtersToSearchParams(filters: Filters): URLSearchParams {
  const sp = new URLSearchParams();
  for (const key of FILTER_KEYS) {
    const v = filters[key];
    if (key === "indiaOnly") {
      if (!v) sp.set("indiaOnly", "false");
    } else if (v && v !== "") {
      sp.set(key, String(v));
    }
  }
  return sp;
}

function buildJobQuery(
  activeFilters: Filters,
  pageToLoad: number,
): Record<string, string | number> {
  return {
    q: activeFilters.q,
    companyId: activeFilters.companyId,
    city: activeFilters.city,
    remoteType: activeFilters.remoteType,
    techTrack: activeFilters.techTrack,
    techRole: activeFilters.techRole,
    skills: activeFilters.skills,
    seniority: activeFilters.seniority,
    employmentType: activeFilters.employmentType,
    sort: activeFilters.sort,
    ...(activeFilters.indiaOnly ? {} : { indiaOnly: "false" }),
    page: pageToLoad,
    limit: PAGE_SIZE,
  };
}

export default function JobBrowser({
  initialCategory = "",
  heading = "Latest tech roles",
  showFilters = true,
  initialFilters,
  savedOnly,
  savedIds,
  savingIds = [],
  showSave,
  onToggleSave,
  initialData,
  companyId,
}: {
  initialCategory?: "" | TechTrack;
  heading?: string;
  showFilters?: boolean;
  initialFilters?: Partial<Filters>;
  savedOnly?: boolean;
  savedIds?: string[];
  savingIds?: string[];
  showSave?: boolean;
  onToggleSave?: (jobId: string, saved: boolean) => void;
  initialData?: Awaited<ReturnType<typeof listJobsWithMeta>>;
  companyId?: string;
}) {
  const { user, loading: authLoading } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const searchParamsKey = searchParams.toString();

  const INITIAL: Filters = useMemo(() => {
    const fromUrl = filtersFromSearchParams(
      new URLSearchParams(companyId ? "" : searchParamsKey),
      initialCategory,
    );
    if (companyId) fromUrl.companyId = companyId;
    if (!initialFilters) return fromUrl;
    // Prefill empty slots from profile; explicit URL params always win.
    const merged: Filters = { ...fromUrl };
    for (const key of FILTER_KEYS) {
      if (key === "indiaOnly") continue;
      const preset = initialFilters[key];
      if (!merged[key] && preset) merged[key] = preset as never;
    }
    return merged;
  }, [searchParamsKey, initialCategory, initialFilters, companyId]);

  const [filters, setFilters] = useState<Filters>(INITIAL);
  const [prevInitial, setPrevInitial] = useState<Filters>(INITIAL);

  // Keep filters in sync when the URL-derived INITIAL changes (back/forward).
  if (INITIAL !== prevInitial) {
    setPrevInitial(INITIAL);
    setFilters(INITIAL);
  }
  const [companies, setCompanies] = useState<Company[]>([]);
  const [jobs, setJobs] = useState<Job[]>(initialData?.jobs || []);
  const [total, setTotal] = useState(initialData?.total || 0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialData?.totalPages || 0);
  const [loading, setLoading] = useState(!initialData);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(false);
  const localSaved = useSavedJobs(user?.id);
  const toggleSave = async (jobId: string, saved: boolean) => {
    if (onToggleSave) {
      onToggleSave(jobId, saved);
      return;
    }
    try {
      await toggleSaved(jobId, saved);
      toast.success(
        saved ? "Added to your shortlist" : "Removed from your shortlist",
      );
    } catch {
      toast.error("Could not update saved role");
    }
  };

  const filtersRef = useRef(filters);
  const requestRef = useRef(0);
  const readController = useRef<AbortController | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      readController.current?.abort();
      if (searchTimer.current) clearTimeout(searchTimer.current);
    },
    [],
  );

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  // Push filter changes into the URL (shallow, no re-render beyond
  // the hooks that depend on searchParams).
  const pushToUrl = useCallback(
    (next: Filters) => {
      const sp = filtersToSearchParams(next);
      if (pathname === "/dashboard") sp.set("view", "discover");
      const qs = sp.toString();
      window.history.replaceState(null, "", `${pathname}${qs ? `?${qs}` : ""}`);
    },
    [pathname],
  );

  const fetchJobs = useCallback(
    async (
      pageToLoad: number,
      activeFilters: Filters,
      append = false,
      signal?: AbortSignal,
    ) => {
      const request = ++requestRef.current;
      readController.current?.abort();
      const controller = new AbortController();
      readController.current = controller;
      const activeSignal = signal
        ? AbortSignal.any([signal, controller.signal])
        : controller.signal;
      try {
        const result = await listJobsWithMeta(
          buildJobQuery(activeFilters, pageToLoad),
          activeSignal,
        );
        if (activeSignal.aborted || request !== requestRef.current) return;
        setJobs((prev) =>
          append
            ? [
                ...new Map(
                  [...prev, ...result.jobs].map((job) => [job._id, job]),
                ).values(),
              ]
            : result.jobs,
        );
        setTotal(result.total);
        setTotalPages(result.totalPages);
        setPage(pageToLoad);
        setError(false);
      } catch {
        if (activeSignal.aborted || request !== requestRef.current) return;
        setError(true);
        toast.error(
          "Couldn't load roles. Check your connection and try again.",
        );
      } finally {
        if (!activeSignal.aborted && request === requestRef.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [],
  );

  // Companies load once; abort on unmount.
  useEffect(() => {
    if (!showFilters) return;
    const ac = new AbortController();
    listCompanies()
      .then((c) => {
        if (!ac.signal.aborted) setCompanies(c);
      })
      .catch(() => {
        if (!ac.signal.aborted) toast.error("Could not load companies");
      });
    return () => ac.abort();
  }, [showFilters]);

  // Initial jobs fetch when INITIAL changes (URL back/forward).
  const originalInitial = useRef(INITIAL);
  useEffect(() => {
    if (authLoading) return;
    if (initialData && !user && INITIAL === originalInitial.current) return;
    const ac = new AbortController();
    void Promise.resolve().then(() => {
      if (!ac.signal.aborted) return fetchJobs(1, INITIAL, false, ac.signal);
    });
    return () => ac.abort();
  }, [INITIAL, user, authLoading, initialData, fetchJobs]);

  const clearAll = () => {
    const next = filtersFromSearchParams(
      new URLSearchParams(),
      initialCategory,
    );
    if (companyId) next.companyId = companyId;
    setFilters(next);
    setSearched(false);
    setLoading(true);
    pushToUrl(next);
    if (JSON.stringify(next) === JSON.stringify(INITIAL))
      fetchJobs(1, next, false);
  };

  const submit = useCallback(
    (overrides?: Partial<Filters>) => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
      searchTimer.current = null;
      setSearched(true);
      setLoading(true);
      const next = overrides
        ? { ...filtersRef.current, ...overrides }
        : filtersRef.current;
      if (overrides) setFilters(next);
      pushToUrl(next);
      if (JSON.stringify(next) === JSON.stringify(INITIAL)) fetchJobs(1, next);
    },
    [fetchJobs, pushToUrl, INITIAL],
  );

  const savedSet = useMemo(
    () => new Set(savedIds || localSaved),
    [savedIds, localSaved],
  );

  const visibleJobs = useMemo(() => {
    if (!savedOnly || !savedIds) return jobs;
    return jobs.filter((j) => savedSet.has(j._id));
  }, [jobs, savedOnly, savedIds, savedSet]);

  return (
    <div>
      {showFilters && (
        <SearchFilters
          filters={filters}
          companies={companies}
          onChange={(patch) => {
            setFilters((f) => ({ ...f, ...patch }));
            if (patch.q !== undefined) {
              if (searchTimer.current) clearTimeout(searchTimer.current);
              searchTimer.current = setTimeout(
                () => submit({ q: patch.q }),
                300,
              );
            }
          }}
          onSubmit={submit}
          onClear={clearAll}
        />
      )}
      <div className="flex items-end justify-between mb-5 mt-10">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          {searched ? "Results" : heading}
        </h2>
        {!loading && jobs.length > 0 && (
          <p className="text-sm text-slate-500">
            {total} {total === 1 ? "role" : "roles"}
          </p>
        )}
      </div>
      <div
        className="discovery-grid grid gap-4 md:grid-cols-2 xl:grid-cols-3"
        aria-busy={loading}
      >
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : error ? (
          <div className="surface-panel col-span-full p-8 text-center">
            <h3 className="text-lg font-bold text-ink">
              We couldn’t load these openings.
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Try again to refresh the current search.
            </p>
            <button
              className="btn-secondary mt-5"
              onClick={() => {
                setLoading(true);
                fetchJobs(1, filters);
              }}
            >
              Try again
            </button>
          </div>
        ) : visibleJobs.length > 0 ? (
          visibleJobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              savePending={savingIds.includes(job._id)}
              saved={savedSet.has(job._id)}
              showSave={showSave ?? !!user}
              onToggleSave={toggleSave}
            />
          ))
        ) : (
          <EmptyState onClear={clearAll} companyOnly={!!companyId} />
        )}
      </div>
      {!loading && !error && <DiscoveryPrompt count={jobs.length} />}
      {!loading && !error && user && page < totalPages && (
        <div className="text-center mt-9">
          <button
            onClick={() => {
              setLoadingMore(true);
              fetchJobs(page + 1, filtersRef.current, true);
            }}
            disabled={loadingMore}
            className="px-8 py-3 bg-white border border-slate-200 rounded-xl font-semibold text-slate-900 text-[15px] hover:border-slate-300 hover:shadow-card transition-all disabled:opacity-50 inline-flex items-center gap-2"
          >
            {loadingMore ? (
              <>
                <span className="w-4 h-4 border-2 border-slate-300 border-t-electric rounded-full animate-spin" />
                Loading…
              </>
            ) : (
              `Load more (${total - jobs.length} left)`
            )}
          </button>
        </div>
      )}
    </div>
  );
}
