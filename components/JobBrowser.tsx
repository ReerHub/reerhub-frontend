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
    <div className="bg-white dark:bg-[#0B1A33] border border-[#E2E8F0] dark:border-white/10 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="skeleton w-12 h-12 rounded-[10px]" />
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
    <div className="col-span-full text-center py-16 px-6 bg-white dark:bg-[#0B1A33] border border-[#E2E8F0] dark:border-white/10 rounded-xl">
      <h2 className="font-bold text-[#0F172A] dark:text-white text-lg mb-2">
        No tech roles match those filters
      </h2>
      <p className="text-[#64748B] dark:text-[#94A3B8] text-[15px] mb-6">
        Try a shorter keyword, another city, or browse everything.
      </p>
      <button
        onClick={onClear}
        className="px-6 py-2.5 bg-[#2563EB] text-white rounded-lg text-sm font-semibold hover:bg-[#1D4ED8] transition-all"
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

export default function JobBrowser({
  initialCategory = "",
  heading = "Latest tech roles",
  showFilters = true,
}: {
  initialCategory?: "" | TechTrack;
  heading?: string;
  showFilters?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const INITIAL: Filters = useMemo(
    () => filtersFromSearchParams(searchParams, initialCategory),
    // Re-derive only when the serialised query changes (e.g. back/forward).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams.toString(), initialCategory],
  );

  const [filters, setFilters] = useState<Filters>(INITIAL);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searched, setSearched] = useState(false);

  const filtersRef = useRef(filters);
  filtersRef.current = filters;

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
      if (append) setLoadingMore(true);
      else setLoading(true);
      try {
        const result = await listJobsWithMeta({
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
        });
        if (signal?.aborted) return;
        setJobs((prev) => (append ? [...prev, ...result.jobs] : result.jobs));
        setTotal(result.total);
        setTotalPages(result.totalPages);
        setPage(pageToLoad);
      } catch {
        if (!signal?.aborted)
          toast.error("Could not load jobs. Is the backend running?");
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
    setFilters(INITIAL);
    fetchJobs(1, INITIAL, false, ac.signal);
    return () => ac.abort();
  }, [fetchJobs, INITIAL]);

  const clearAll = () => {
    const next = filtersFromSearchParams(
      new URLSearchParams(),
      initialCategory,
    );
    setFilters(next);
    setSearched(false);
    pushToUrl(next);
    fetchJobs(1, next, false);
  };

  const submit = useCallback(
    (overrides?: Partial<Filters>) => {
      setSearched(true);
      const next = overrides
        ? { ...filtersRef.current, ...overrides }
        : filtersRef.current;
      if (overrides) setFilters(next);
      pushToUrl(next);
      fetchJobs(1, next);
    },
    [fetchJobs, pushToUrl],
  );

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
        <h2 className="text-2xl font-bold text-[#0F172A] dark:text-white">
          {searched ? "Results" : heading}
        </h2>
        {!loading && jobs.length > 0 && (
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
            {total} {total === 1 ? "role" : "roles"}
          </p>
        )}
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : jobs.length > 0 ? (
          jobs.map((job) => <JobCard key={job._id} job={job} />)
        ) : (
          <EmptyState onClear={clearAll} />
        )}
      </div>
      {!loading && page < totalPages && (
        <div className="text-center mt-8">
          <button
            onClick={() => fetchJobs(page + 1, filtersRef.current, true)}
            disabled={loadingMore}
            className="px-8 py-3 bg-white dark:bg-[#0B1A33] border border-[#E2E8F0] dark:border-white/10 rounded-lg font-semibold text-[#0F172A] dark:text-white text-[15px] hover:bg-[#F8FAFC] dark:hover:bg-white/5 transition-all disabled:opacity-50"
          >
            {loadingMore
              ? "Loading\u2026"
              : `Load more (${total - jobs.length} left)`}
          </button>
        </div>
      )}
    </div>
  );
}
