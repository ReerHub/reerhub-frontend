"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import JobCard from "@/components/JobCard";
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

function EmptyState({ onClear }: { onClear: () => void }) {
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
        No tech roles match those filters
      </h2>
      <p className="text-slate-500 text-[15px] mb-6">
        Try a shorter keyword, another city, or browse everything.
      </p>
      <button
        onClick={onClear}
        className="px-6 py-2.5 bg-electric text-white rounded-xl text-sm font-semibold hover:bg-electric-dark transition-all shadow-sm"
      >
        Clear filters
      </button>
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
  showSave,
  onToggleSave,
}: {
  initialCategory?: "" | TechTrack;
  heading?: string;
  showFilters?: boolean;
  initialFilters?: Partial<Filters>;
  savedOnly?: boolean;
  savedIds?: string[];
  showSave?: boolean;
  onToggleSave?: (jobId: string, saved: boolean) => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const searchParamsKey = searchParams.toString();

  const INITIAL: Filters = useMemo(() => {
    const fromUrl = filtersFromSearchParams(
      new URLSearchParams(searchParamsKey),
      initialCategory,
    );
    if (!initialFilters) return fromUrl;
    // Prefill empty slots from profile; explicit URL params always win.
    const merged: Filters = { ...fromUrl };
    for (const key of FILTER_KEYS) {
      if (key === "indiaOnly") continue;
      const preset = initialFilters[key];
      if (!merged[key] && preset) merged[key] = preset as never;
    }
    return merged;
  }, [searchParamsKey, initialCategory, initialFilters]);

  const [filters, setFilters] = useState<Filters>(INITIAL);
  const [prevInitial, setPrevInitial] = useState<Filters>(INITIAL);

  // Keep filters in sync when the URL-derived INITIAL changes (back/forward).
  if (INITIAL !== prevInitial) {
    setPrevInitial(INITIAL);
    setFilters(INITIAL);
  }
  const [companies, setCompanies] = useState<Company[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searched, setSearched] = useState(false);

  const filtersRef = useRef(filters);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  // Push filter changes into the URL (shallow, no re-render beyond
  // the hooks that depend on searchParams).
  const pushToUrl = useCallback(
    (next: Filters) => {
      const sp = filtersToSearchParams(next);
      const qs = sp.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router, pathname],
  );

  const fetchJobs = useCallback(
    async (
      pageToLoad: number,
      activeFilters: Filters,
      append = false,
      signal?: AbortSignal,
    ) => {
      try {
        const result = await listJobsWithMeta(
          buildJobQuery(activeFilters, pageToLoad),
        );
        if (signal?.aborted) return;
        setJobs((prev) => (append ? [...prev, ...result.jobs] : result.jobs));
        setTotal(result.total);
        setTotalPages(result.totalPages);
        setPage(pageToLoad);
      } catch {
        if (!signal?.aborted)
          toast.error(
            "Couldn't load roles. Check your connection and try again.",
          );
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [],
  );

  // Companies load once; abort on unmount.
  useEffect(() => {
    const ac = new AbortController();
    listCompanies()
      .then((c) => {
        if (!ac.signal.aborted) setCompanies(c);
      })
      .catch(() => {
        if (!ac.signal.aborted) toast.error("Could not load companies");
      });
    return () => ac.abort();
  }, []);

  // Initial jobs fetch when INITIAL changes (URL back/forward).
  useEffect(() => {
    const ac = new AbortController();
    listJobsWithMeta(buildJobQuery(INITIAL, 1))
      .then((result) => {
        if (ac.signal.aborted) return;
        setJobs(result.jobs);
        setTotal(result.total);
        setTotalPages(result.totalPages);
        setPage(1);
      })
      .catch(() => {
        if (!ac.signal.aborted)
          toast.error(
            "Couldn't load roles. Check your connection and try again.",
          );
      })
      .finally(() => {
        if (!ac.signal.aborted) setLoading(false);
      });
    return () => ac.abort();
  }, [INITIAL]);

  const clearAll = () => {
    const next = filtersFromSearchParams(
      new URLSearchParams(),
      initialCategory,
    );
    setFilters(next);
    setSearched(false);
    setLoading(true);
    pushToUrl(next);
    fetchJobs(1, next, false);
  };

  const submit = useCallback(
    (overrides?: Partial<Filters>) => {
      setSearched(true);
      setLoading(true);
      const next = overrides
        ? { ...filtersRef.current, ...overrides }
        : filtersRef.current;
      if (overrides) setFilters(next);
      pushToUrl(next);
      fetchJobs(1, next);
    },
    [fetchJobs, pushToUrl],
  );

  const savedSet = useMemo(() => new Set(savedIds || []), [savedIds]);

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
          onChange={(patch) => setFilters((f) => ({ ...f, ...patch }))}
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
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : visibleJobs.length > 0 ? (
          visibleJobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              saved={savedSet.has(job._id)}
              showSave={showSave}
              onToggleSave={onToggleSave}
            />
          ))
        ) : (
          <EmptyState onClear={clearAll} />
        )}
      </div>
      {!loading && page < totalPages && (
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
