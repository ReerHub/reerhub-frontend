"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import DashboardJobCard from "@/components/DashboardJobCard";
import { useAuth } from "@/components/AuthProvider";
import {
  requestVerifyEmail,
  saveJob,
  savedIds,
  unsaveJob,
  type AuthUser,
} from "@/lib/auth";
import {
  listJobsWithMeta,
  TECH_TRACKS,
  type Job,
  type TechTrack,
} from "@/lib/reerhub";

const PAGE_SIZE = 18;
const FULL_TIME_VALUES = ["Full-time", "Full Time Employee"];
const WORK_MODES = [
  { value: "onsite", label: "Onsite" },
  { value: "hybrid", label: "Hybrid" },
  { value: "remote", label: "Remote" },
];
const LEVELS = ["Senior", "Staff", "Lead", "Principal", "Manager", "Director"];

function toggle(list: string[], value: string): string[] {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

function Check({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-3 py-1.5 cursor-pointer text-[15px] text-slate-900">
      <span
        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
          checked
            ? "bg-slate-950 border-slate-950"
            : "border-slate-300 bg-white"
        }`}
        aria-hidden
      >
        {checked && (
          <svg
            className="w-3.5 h-3.5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      {label}
    </label>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/70 p-2">
      <div className="skeleton rounded-2xl min-h-56" />
      <div className="skeleton h-5 w-2/3 rounded mx-3 mt-4" />
      <div className="skeleton h-9 w-24 rounded-full ml-auto mr-3 my-3" />
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  // Remount when the account changes so profile prefill runs via
  // initializers (no setState-in-effect needed).
  return <DashboardBoard key={user?.id ?? "guest"} user={user} />;
}

function buildParams(
  source: Record<string, string>,
): Record<string, string | number> {
  const params: Record<string, string | number> = { page: 1, limit: PAGE_SIZE };
  for (const [k, v] of Object.entries(source)) {
    if (v) params[k] = v;
  }
  return params;
}

function DashboardBoard({ user }: { user: AuthUser | null }) {
  const [q, setQ] = useState(user?.profile.currentRole || "");
  const [city, setCity] = useState(user?.profile.city || "");
  const [track, setTrack] = useState<"" | TechTrack>(
    (user?.profile.techTrack as TechTrack) || "",
  );
  const [modes, setModes] = useState<string[]>([]);
  const [fullTime, setFullTime] = useState(false);
  const [levels, setLevels] = useState<string[]>([]);
  const [savedOnly, setSavedOnly] = useState(false);
  const [sort, setSort] = useState<"updated" | "az">("updated");

  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [ids, setIds] = useState<string[]>([]);

  const query = useMemo(
    () => ({
      q,
      city,
      seniority: levels.join(","),
      techTrack: track,
      remoteType: modes.join(","),
      employmentType: fullTime ? FULL_TIME_VALUES.join(",") : "",
      skills: (user?.profile.skills || []).join(","),
    }),
    [q, city, levels, track, modes, fullTime, user],
  );

  // Snapshot of the first-load params (mount only).
  const firstParamsRef = useRef<Record<string, string | number> | null>(null);
  if (firstParamsRef.current === null) {
    firstParamsRef.current = buildParams({
      q: user?.profile.currentRole || "",
      city: user?.profile.city || "",
      seniority: "",
      techTrack: user?.profile.techTrack || "",
      remoteType: "",
      employmentType: "",
      skills: (user?.profile.skills || []).join(","),
    });
  }

  useEffect(() => {
    let cancelled = false;
    savedIds()
      .then((list) => {
        if (!cancelled) setIds(list);
      })
      .catch(() => {});
    listJobsWithMeta(firstParamsRef.current ?? { page: 1, limit: PAGE_SIZE })
      .then((result) => {
        if (cancelled) return;
        setJobs(result.jobs);
        setTotal(result.total);
        setTotalPages(result.totalPages);
        setPage(1);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        toast.error("Could not load jobs. Is the backend running?");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const fetchJobs = useCallback(
    async (
      pageToLoad: number,
      append = false,
      override?: Record<string, string>,
    ) => {
      if (append) setLoadingMore(true);
      else setLoading(true);
      try {
        const source = override ?? query;
        const params: Record<string, string | number> = {
          page: pageToLoad,
          limit: PAGE_SIZE,
        };
        for (const [k, v] of Object.entries(source)) {
          if (v) params[k] = v;
        }
        const result = await listJobsWithMeta(params);
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
    [query],
  );

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    fetchJobs(1);
  };

  const toggleSave = useCallback(async (jobId: string, next: boolean) => {
    try {
      if (next) {
        await saveJob(jobId);
        setIds((prev) => (prev.includes(jobId) ? prev : [...prev, jobId]));
        toast.success("Saved");
      } else {
        await unsaveJob(jobId);
        setIds((prev) => prev.filter((id) => id !== jobId));
      }
    } catch {
      toast.error("Please log in to save jobs");
    }
  }, []);

  const resend = async () => {
    try {
      await requestVerifyEmail();
      toast.success("Verification email sent");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send email");
    }
  };

  const savedSet = useMemo(() => new Set(ids), [ids]);
  const visible = useMemo(() => {
    const base = savedOnly ? jobs.filter((j) => savedSet.has(j._id)) : jobs;
    if (sort === "az") {
      return [...base].sort((a, b) =>
        `${a.companyId?.name || ""} ${a.title}`.localeCompare(
          `${b.companyId?.name || ""} ${b.title}`,
        ),
      );
    }
    return base;
  }, [jobs, savedOnly, savedSet, sort]);

  const clearSidebar = () => {
    setModes([]);
    setFullTime(false);
    setLevels([]);
  };

  const clearSidebarAndFetch = () => {
    clearSidebar();
    fetchJobs(1, false, {
      ...query,
      remoteType: "",
      employmentType: "",
      seniority: "",
    });
  };

  const clearAll = () => {
    const cleared = {
      q: "",
      city: "",
      seniority: "",
      techTrack: "",
      remoteType: "",
      employmentType: "",
      skills: (user?.profile.skills || []).join(","),
    };
    setQ("");
    setCity("");
    setTrack("");
    clearSidebar();
    setSavedOnly(false);
    fetchJobs(1, false, cleared);
  };

  return (
    <div className="bg-[#E5E8EF] -mt-16 pt-16 pb-10 min-h-screen">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-6 pt-4">
        {/* ── Dark shell: search filters (site nav lives in Navbar) ── */}
        <section className="bg-[#0B0F1C] rounded-[2rem] px-5 sm:px-8 py-7">
          <div className="mb-5">
            <h1 className="text-white text-xl sm:text-2xl font-bold tracking-tight">
              {user
                ? `Find your next role, ${user.name.split(" ")[0]}`
                : "Find your next role"}
            </h1>
            <p className="text-white/50 text-sm mt-1">
              Recommended from your profile
              {user?.profile.city ? ` · ${user.profile.city}` : " · India"}
              {ids.length > 0 ? ` · ${ids.length} saved` : ""}
            </p>
          </div>
          <form
            onSubmit={submit}
            className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_1fr_auto]"
          >
            <label className="flex items-center gap-3 px-4 rounded-2xl bg-transparent border border-white/10 focus-within:border-white/30 transition-all">
              <svg
                className="w-5 h-5 text-white/50 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Role — Designer"
                className="w-full py-3 bg-transparent outline-none text-white placeholder:text-white/35 text-[15px]"
              />
            </label>
            <label className="flex items-center gap-3 px-4 rounded-2xl bg-transparent border border-white/10 focus-within:border-white/30 transition-all">
              <svg
                className="w-5 h-5 text-white/50 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.75}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 10.5c0 7.14-7.5 11.25-7.5 11.25S4.5 17.64 4.5 10.5a7.5 7.5 0 1115 0z"
                />
              </svg>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Work location"
                className="w-full py-3 bg-transparent outline-none text-white placeholder:text-white/35 text-[15px]"
              />
            </label>
            <label className="flex items-center gap-3 px-4 rounded-2xl bg-transparent border border-white/10 focus-within:border-white/30 transition-all">
              <svg
                className="w-5 h-5 text-white/50 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.75}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0"
                />
              </svg>
              <select
                value={levels.length === 1 ? levels[0] : ""}
                onChange={(e) =>
                  setLevels(e.target.value ? [e.target.value] : [])
                }
                className="w-full py-3 bg-transparent outline-none text-white text-[15px] [&>option]:text-slate-900 cursor-pointer"
              >
                <option value="">Experience</option>
                {LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l} level
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-3 px-4 rounded-2xl bg-transparent border border-white/10 focus-within:border-white/30 transition-all">
              <svg
                className="w-5 h-5 text-white/50 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.75}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
                />
              </svg>
              <select
                value={track}
                onChange={(e) => setTrack(e.target.value as "" | TechTrack)}
                className="w-full py-3 bg-transparent outline-none text-white text-[15px] [&>option]:text-slate-900 cursor-pointer"
              >
                <option value="">All tracks</option>
                {TECH_TRACKS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className="px-8 py-3 bg-white text-slate-950 rounded-2xl font-semibold hover:bg-slate-200 transition-all"
            >
              Search
            </button>
          </form>
        </section>

        {user && !user.emailVerified && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 text-sm text-amber-800 flex items-center justify-between gap-3">
            <span>Verify your email to keep your account secure.</span>
            <button
              onClick={resend}
              className="font-semibold underline shrink-0"
            >
              Resend link
            </button>
          </div>
        )}

        {/* ── Body ── */}
        <div className="grid lg:grid-cols-[290px_1fr] gap-5 mt-5 items-start">
          <aside className="space-y-5">
            <div className="relative overflow-hidden rounded-3xl bg-[#0B0F1C] p-6 min-h-64 flex flex-col">
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(300px 200px at 85% 0%, rgba(99,102,241,0.45), transparent), radial-gradient(260px 260px at 10% 100%, rgba(45,212,191,0.25), transparent)",
                }}
                aria-hidden
              />
              <p className="relative text-white text-[26px] leading-tight font-bold">
                Get your best profession with ReerHub
              </p>
              <Link
                href="/profile"
                className="relative mt-auto pt-6 block text-center px-4 py-2.5 bg-sky-300 text-slate-950 rounded-full text-sm font-semibold hover:bg-sky-200 transition-all"
              >
                Complete profile
              </Link>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/70 p-5">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-bold text-slate-900 text-lg">Filters</h2>
                <button
                  onClick={clearSidebarAndFetch}
                  className="text-[13px] font-semibold text-slate-400 hover:text-red-500 underline underline-offset-4"
                >
                  Clear
                </button>
              </div>
              <p className="text-[13px] font-medium text-slate-400 mt-3 mb-1">
                Work mode
              </p>
              {WORK_MODES.map((m) => (
                <Check
                  key={m.value}
                  label={m.label}
                  checked={modes.includes(m.value)}
                  onChange={() => setModes((prev) => toggle(prev, m.value))}
                />
              ))}
              <p className="text-[13px] font-medium text-slate-400 mt-4 mb-1">
                Employment
              </p>
              <Check
                label="Full time"
                checked={fullTime}
                onChange={() => setFullTime((v) => !v)}
              />
              <p className="text-[13px] font-medium text-slate-400 mt-4 mb-1">
                Level
              </p>
              {LEVELS.map((l) => (
                <Check
                  key={l}
                  label={l}
                  checked={levels.includes(l)}
                  onChange={() => setLevels((prev) => toggle(prev, l))}
                />
              ))}
              <button
                onClick={() => fetchJobs(1)}
                className="mt-4 w-full px-4 py-2.5 bg-slate-950 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all"
              >
                Apply filters
              </button>
            </div>
          </aside>

          <section>
            <div className="flex items-center justify-between flex-wrap gap-3 mb-4 px-1">
              <h1 className="text-[28px] font-bold text-slate-900 tracking-tight flex items-center gap-3">
                Recommended jobs
                <span className="px-3 py-1 rounded-full border border-slate-300 text-sm font-semibold text-slate-600">
                  {savedOnly ? visible.length : total}
                </span>
              </h1>
              <div className="flex items-center gap-2 text-sm">
                <button
                  onClick={() => setSavedOnly((v) => !v)}
                  aria-pressed={savedOnly}
                  className={`px-4 py-1.5 rounded-full border text-sm font-semibold transition-all ${
                    savedOnly
                      ? "bg-slate-950 text-white border-slate-950"
                      : "border-slate-300 text-slate-600 hover:border-slate-400"
                  }`}
                >
                  Saved{ids.length > 0 ? ` (${ids.length})` : ""}
                </button>
                <label className="text-slate-400">
                  Sort by:{" "}
                  <select
                    value={sort}
                    onChange={(e) =>
                      setSort(e.target.value as "updated" | "az")
                    }
                    className="text-slate-900 font-semibold bg-transparent outline-none cursor-pointer"
                  >
                    <option value="updated">Last updated</option>
                    <option value="az">Company A–Z</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))
              ) : visible.length > 0 ? (
                visible.map((job, i) => (
                  <DashboardJobCard
                    key={job._id}
                    job={job}
                    index={i}
                    saved={savedSet.has(job._id)}
                    onToggleSave={toggleSave}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-16 px-6 bg-white border border-slate-200/70 rounded-3xl">
                  <h2 className="font-bold text-slate-900 text-lg mb-1.5">
                    {savedOnly
                      ? "No saved roles yet"
                      : "No tech roles match those filters"}
                  </h2>
                  <p className="text-slate-500 text-[15px] mb-6">
                    {savedOnly
                      ? "Tap the bookmark on any role to keep it here."
                      : "Try a shorter keyword, another city, or clear the sidebar."}
                  </p>
                  <button
                    onClick={clearAll}
                    className="px-6 py-2.5 bg-slate-950 text-white rounded-full text-sm font-semibold hover:bg-slate-800"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>

            {!loading && !savedOnly && page < totalPages && (
              <div className="text-center mt-8">
                <button
                  onClick={() => fetchJobs(page + 1, true)}
                  disabled={loadingMore}
                  className="px-8 py-3 bg-white border border-slate-200 rounded-full font-semibold text-slate-900 text-[15px] hover:shadow-card transition-all disabled:opacity-50"
                >
                  {loadingMore
                    ? "Loading…"
                    : `Load more (${total - jobs.length} left)`}
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
