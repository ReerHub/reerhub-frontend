"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import JobCard from "@/components/JobCard";
import SearchFilters, { Filters } from "@/components/SearchFilters";
import {
  listCompanies,
  listJobsWithMeta,
  type Company,
  type Job,
  type TechTrack,
} from "@/lib/wareers";

const PAGE_SIZE = 21;

export function SkeletonCard() {
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

export function EmptyState({ onClear }: { onClear: () => void }) {
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

export default function JobBrowser({
  initialCategory = "",
  heading = "Latest tech roles",
  showFilters = true,
}: {
  initialCategory?: "" | TechTrack;
  heading?: string;
  showFilters?: boolean;
}) {
  const INITIAL: Filters = useMemo(
    () => ({
      q: "",
      companyId: "",
      city: "",
      remoteType: "",
      techTrack: initialCategory,
      skills: "",
    }),
    [initialCategory],
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

  const fetchJobs = useCallback(
    async (pageToLoad: number, activeFilters: Filters, append = false) => {
      if (append) setLoadingMore(true);
      else setLoading(true);
      try {
        const result = await listJobsWithMeta({
          q: activeFilters.q,
          companyId: activeFilters.companyId,
          city: activeFilters.city,
          remoteType: activeFilters.remoteType,
          techTrack: activeFilters.techTrack,
          skills: activeFilters.skills,
          page: pageToLoad,
          limit: PAGE_SIZE,
        });
        setJobs((prev) => (append ? [...prev, ...result.jobs] : result.jobs));
        setTotal(result.total);
        setTotalPages(result.totalPages);
        setPage(pageToLoad);
      } catch {
        toast.error("Could not load jobs. Is the backend running?");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [],
  );

  useEffect(() => {
    listCompanies()
      .then(setCompanies)
      .catch(() => toast.error("Could not load companies"));
    fetchJobs(1, INITIAL);
  }, [fetchJobs, INITIAL]);

  const clearAll = () => {
    setFilters(INITIAL);
    setSearched(false);
    fetchJobs(1, INITIAL);
  };

  const submit = () => {
    setSearched(true);
    fetchJobs(1, filters);
  };

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
            onClick={() => fetchJobs(page + 1, filters, true)}
            disabled={loadingMore}
            className="px-8 py-3 bg-white dark:bg-[#0B1A33] border border-[#E2E8F0] dark:border-white/10 rounded-lg font-semibold text-[#0F172A] dark:text-white text-[15px] hover:bg-[#F8FAFC] dark:hover:bg-white/5 transition-all disabled:opacity-50"
          >
            {loadingMore
              ? "Loading…"
              : `Load more (${total - jobs.length} left)`}
          </button>
        </div>
      )}
    </div>
  );
}
