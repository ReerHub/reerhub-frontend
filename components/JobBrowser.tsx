"use client";

import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import CatalogNotice, { catalogInitializing } from "./CatalogNotice";
import JobCard from "@/components/JobCard";
import DiscoveryPrompt from "@/components/DiscoveryPrompt";
import { useAuth } from "@/components/AuthProvider";
import { useSavedJobs, toggleSaved } from "@/lib/saved-store";
import SearchFilters, { Filters } from "@/components/SearchFilters";
import { locationScopeFromParams } from "@/lib/location-scope";
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
  "earlyCareer",
  "sort",
  "locationScope",
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
          ? "No open tech roles in this location scope right now"
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
    earlyCareer: sp.get("earlyCareer") ?? "",
    sort: sp.get("sort") === "az" ? "az" : "",
    locationScope: locationScopeFromParams(sp),
  };
}

function filtersToSearchParams(filters: Filters): URLSearchParams {
  const sp = new URLSearchParams();
  for (const key of FILTER_KEYS) {
    const v = filters[key];
    if (key === "locationScope") {
      if (v !== "india") sp.set("locationScope", String(v));
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
    earlyCareer: activeFilters.earlyCareer || "",
    sort: activeFilters.sort,
    locationScope: activeFilters.locationScope,
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
  companyTotal,
  initialLocationScope = "india",
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
  companyTotal?: number;
  initialLocationScope?: import("@/lib/location-scope").LocationScope;
}) {
  const { user, loading: authLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const searchParamsKey = searchParams.toString();

  const INITIAL: Filters = useMemo(() => {
    const fromUrl = filtersFromSearchParams(
      new URLSearchParams(searchParamsKey),
      initialCategory,
    );
    if (companyId) {
      const scope = fromUrl.locationScope;
      Object.assign(
        fromUrl,
        filtersFromSearchParams(new URLSearchParams(), initialCategory),
        { companyId, locationScope: scope },
      );
    }
    if (!initialFilters) return fromUrl;
    // Prefill empty slots from profile; explicit URL params always win.
    const merged: Filters = { ...fromUrl };
    for (const key of FILTER_KEYS) {
      if (key === "locationScope") continue;
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
  const serverFilters = filtersFromSearchParams(
    new URLSearchParams(),
    initialCategory,
  );
  Object.assign(
    serverFilters,
    initialFilters,
    { locationScope: initialLocationScope },
    companyId ? { companyId } : {},
  );
  const initialMatchesScope =
    JSON.stringify(INITIAL) === JSON.stringify(serverFilters);
  const [jobs, setJobs] = useState<Job[]>(
    initialMatchesScope ? initialData?.jobs || [] : [],
  );
  const [catalog, setCatalog] = useState(initialData);
  const [total, setTotal] = useState(initialData?.total || 0);
  const [totalAvailable, setTotalAvailable] = useState(
    initialData?.totalAvailable ?? companyTotal,
  );
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialData?.totalPages || 0);
  const [loading, setLoading] = useState(!initialData || !initialMatchesScope);
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
      const url = `${pathname}${qs ? `?${qs}` : ""}`;
      if (companyId) router.push(url, { scroll: false });
      else window.history.pushState(null, "", url);
    },
    [pathname, companyId, router],
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
        setCatalog(result);
        setTotal(result.total);
        setTotalAvailable(result.totalAvailable);
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
    if (
      initialData &&
      !user &&
      initialMatchesScope &&
      INITIAL === originalInitial.current
    )
      return;
    const ac = new AbortController();
    void Promise.resolve().then(() => {
      if (!ac.signal.aborted) {
        setLoading(true);
        return fetchJobs(1, INITIAL, false, ac.signal);
      }
    });
    return () => ac.abort();
  }, [INITIAL, user, authLoading, initialData, initialMatchesScope, fetchJobs]);

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
      {!loading && !error && <CatalogNotice data={catalog} />}
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
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5 mt-10">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          {searched ? "Results" : heading}
        </h2>
        {!loading && jobs.length > 0 && (
          <p className="text-sm text-slate-500 text-right">
            {!user
              ? totalAvailable !== undefined
                ? `Showing ${jobs.length} of ${Math.max(totalAvailable, jobs.length)} roles`
                : `${jobs.length} ${jobs.length === 1 ? "role" : "roles"} · Preview`
              : `${total} ${total === 1 ? "role" : "roles"}`}
            {!user &&
              !authLoading &&
              jobs.length >= 10 &&
              (totalAvailable === undefined ||
                totalAvailable > jobs.length) && (
                <span className="mt-1 block text-xs text-blue-700">
                  Sign in for the full list
                </span>
              )}
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
        ) : catalogInitializing(catalog) ? null : (
          <EmptyState onClear={clearAll} companyOnly={!!companyId} />
        )}
        {!loading &&
          !error &&
          !user &&
          !authLoading &&
          jobs.length >= 10 &&
          (totalAvailable === undefined || totalAvailable > jobs.length) && (
            <DiscoveryPrompt count={jobs.length} total={totalAvailable} card />
          )}
      </div>
      {!loading &&
        !error &&
        !(
          jobs.length >= 10 &&
          (totalAvailable === undefined || totalAvailable > jobs.length)
        ) && <DiscoveryPrompt count={jobs.length} total={totalAvailable} />}
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
