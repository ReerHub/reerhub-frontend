"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
          checked ? "bg-electric border-electric" : "border-slate-300 bg-white"
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
  return (
    <Suspense>
      <DashboardBoard key={user?.id ?? "guest"} user={user} />
    </Suspense>
  );
}

type DashFilters = {
  q: string;
  city: string;
  seniority: string[];
  techTrack: "" | TechTrack;
  remoteType: string[];
  fullTime: boolean;
  skillsOn: boolean;
};

const EMPTY: DashFilters = {
  q: "",
  city: "",
  seniority: [],
  techTrack: "",
  remoteType: [],
  fullTime: false,
  skillsOn: true,
};

function filtersFromParams(
  sp: URLSearchParams,
  user: AuthUser | null,
): DashFilters {
  const csv = (k: string) =>
    (sp.get(k) || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  const has = (k: string) => sp.has(k);
  return {
    // Profile prefill fills only slots the URL leaves empty.
    q: sp.get("q") ?? user?.profile.currentRole ?? "",
    city: sp.get("city") ?? user?.profile.city ?? "",
    seniority: has("seniority") ? csv("seniority") : [],
    techTrack:
      (sp.get("techTrack") as TechTrack) || user?.profile.techTrack || "",
    remoteType: csv("remoteType"),
    fullTime: sp.get("employment") === "fulltime",
    skillsOn: sp.get("ps") !== "0",
  };
}

function filtersToParams(f: DashFilters, view: string, sort: string) {
  const sp = new URLSearchParams();
  if (f.q) sp.set("q", f.q);
  if (f.city) sp.set("city", f.city);
  if (f.seniority.length > 0) sp.set("seniority", f.seniority.join(","));
  if (f.techTrack) sp.set("techTrack", f.techTrack);
  if (f.remoteType.length > 0) sp.set("remoteType", f.remoteType.join(","));
  if (f.fullTime) sp.set("employment", "fulltime");
  if (!f.skillsOn) sp.set("ps", "0");
  if (view === "saved") sp.set("view", "saved");
  if (sort !== "updated") sp.set("sort", sort);
  return sp;
}

function DashboardBoard({ user }: { user: AuthUser | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const spKey = searchParams.toString();

  const initial = useMemo(
    () => filtersFromParams(new URLSearchParams(spKey), user),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const [filters, setFilters] = useState<DashFilters>(initial);
  const [prevInitial, setPrevInitial] = useState(initial);
  const [view, setView] = useState(
    new URLSearchParams(spKey).get("view") === "saved" ? "saved" : "all",
  );
  const [sort, setSort] = useState(
    new URLSearchParams(spKey).get("sort") === "az" ? "az" : "updated",
  );

  // Back/forward navigation re-syncs state from the URL (single source).
  const live = useMemo(
    () => filtersFromParams(new URLSearchParams(spKey), user),
    [spKey],
  );
  if (
    JSON.stringify(live) !== JSON.stringify(filters) &&
    JSON.stringify(live) !== JSON.stringify(prevInitial)
  ) {
    setPrevInitial(live);
    setFilters(live);
    const params = new URLSearchParams(spKey);
    setView(params.get("view") === "saved" ? "saved" : "all");
    setSort(params.get("sort") === "az" ? "az" : "updated");
  }

  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [ids, setIds] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const savedOnly = view === "saved";

  const currentParams = useCallback(
    (): Record<string, string> => ({
      q: filters.q,
      city: filters.city,
      seniority: filters.seniority.join(","),
      techTrack: filters.techTrack,
      remoteType: filters.remoteType.join(","),
      employmentType: filters.fullTime ? FULL_TIME_VALUES.join(",") : "",
      skills: filters.skillsOn ? (user?.profile.skills || []).join(",") : "",
      sort,
    }),
    [filters, sort, user],
  );

  const pushState = useCallback(
    (next: DashFilters, nextView: string, nextSort: string) => {
      const sp = filtersToParams(next, nextView, nextSort);
      const qs = sp.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router, pathname],
  );

  // Every committed change writes the URL; the fetch effect below reacts.
  // Plain function over render-scope state (no refs): each render creates
  // fresh handlers, so rapid successive commits always see latest values.
  const commit = (
    patch: Partial<DashFilters>,
    opts?: { view?: string; sort?: string },
  ) => {
    const next = { ...filters, ...patch };
    const nextView = opts?.view ?? view;
    const nextSort = opts?.sort ?? sort;
    setFilters(next);
    setView(nextView);
    setSort(nextSort as "updated" | "az");
    setLoading(true);
    pushState(next, nextView, nextSort);
  };

  // Header text inputs edit local state; Search commits to the URL.
  const setDraft = (patch: Partial<DashFilters>) => {
    setFilters((f) => ({ ...f, ...patch }));
  };

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    commit({});
  };

  // First-load params, snapshotted once via lazy initializer (no refs).
  const [firstParams] = useState<Record<string, string | number>>(() => {
    const params: Record<string, string | number> = {
      page: 1,
      limit: PAGE_SIZE,
    };
    const first: Record<string, string> = {
      q: initial.q,
      city: initial.city,
      seniority: initial.seniority.join(","),
      techTrack: initial.techTrack,
      remoteType: initial.remoteType.join(","),
      employmentType: initial.fullTime ? FULL_TIME_VALUES.join(",") : "",
      skills: initial.skillsOn ? (user?.profile.skills || []).join(",") : "",
      sort: "updated",
    };
    for (const [k, v] of Object.entries(first)) {
      if (v) params[k] = v;
    }
    return params;
  });

  const loadPage = useCallback(
    async (
      pageToLoad: number,
      activeQuery: Record<string, string>,
      append = false,
    ) => {
      if (append) setLoadingMore(true);
      else setLoading(true);
      try {
        const params: Record<string, string | number> = {
          page: pageToLoad,
          limit: PAGE_SIZE,
        };
        for (const [k, v] of Object.entries(activeQuery)) {
          if (v) params[k] = v;
        }
        const result = await listJobsWithMeta(params);
        if (append) {
          setJobs((prev) => {
            const seen = new Set(prev.map((j) => j._id));
            return [...prev, ...result.jobs.filter((j) => !seen.has(j._id))];
          });
        } else {
          setJobs(result.jobs);
        }
        setTotal(result.total);
        setTotalPages(result.totalPages);
        setPage(pageToLoad);
      } catch {
        toast.error(
          "Couldn't load roles. Check your connection and try again.",
        );
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [],
  );

  // Saved ids load once per account (key-remount above resets per user).
  useEffect(() => {
    let cancelled = false;
    savedIds()
      .then((list) => {
        if (!cancelled) setIds(list);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Initial load.
  useEffect(() => {
    let cancelled = false;
    listJobsWithMeta(firstParams)
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
        toast.error(
          "Couldn't load roles. Check your connection and try again.",
        );
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Committed URL changes (commit() above) push a new spKey, which lands
  // here and refetches page 1. Back/forward works the same way.
  const lastFetchedKey = useRef<string | null>(null);
  useEffect(() => {
    if (lastFetchedKey.current === null) {
      lastFetchedKey.current = spKey;
      return;
    }
    if (lastFetchedKey.current === spKey) return;
    lastFetchedKey.current = spKey;
    const q = filtersFromParams(new URLSearchParams(spKey), user);
    const params: Record<string, string> = {
      q: q.q,
      city: q.city,
      seniority: q.seniority.join(","),
      techTrack: q.techTrack,
      remoteType: q.remoteType.join(","),
      employmentType: q.fullTime ? FULL_TIME_VALUES.join(",") : "",
      skills: q.skillsOn ? (user?.profile.skills || []).join(",") : "",
      sort: new URLSearchParams(spKey).get("sort") === "az" ? "az" : "updated",
    };
    loadPage(1, params);
  });

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
  // Server sorts globally (sort=az); saved view filters accumulated pages.
  const visible = useMemo(
    () => (savedOnly ? jobs.filter((j) => savedSet.has(j._id)) : jobs),
    [jobs, savedOnly, savedSet],
  );

  const clearAll = () => {
    commit({ ...EMPTY, skillsOn: true }, { view: "all", sort: "updated" });
  };

  // Active-filter chips (profile prefill included) — each clears its slot.
  const chips: { label: string; clear: () => void }[] = [];
  if (filters.q)
    chips.push({ label: `Role: ${filters.q}`, clear: () => commit({ q: "" }) });
  if (filters.city)
    chips.push({
      label: `Location: ${filters.city}`,
      clear: () => commit({ city: "" }),
    });
  if (filters.techTrack) {
    const label =
      TECH_TRACKS.find((t) => t.value === filters.techTrack)?.label ??
      filters.techTrack;
    chips.push({
      label: `Track: ${label}`,
      clear: () => commit({ techTrack: "" }),
    });
  }
  if (filters.seniority.length > 0)
    chips.push({
      label: `Level: ${filters.seniority.join(", ")}`,
      clear: () => commit({ seniority: [] }),
    });
  if (filters.remoteType.length > 0)
    chips.push({
      label: `Mode: ${filters.remoteType.join(", ")}`,
      clear: () => commit({ remoteType: [] }),
    });
  if (filters.fullTime)
    chips.push({
      label: "Full time",
      clear: () => commit({ fullTime: false }),
    });
  const profileSkills = (user?.profile.skills || []).join(", ");
  if (filters.skillsOn && profileSkills)
    chips.push({
      label: `Your skills: ${profileSkills}`,
      clear: () => commit({ skillsOn: false }),
    });
  if (!filters.skillsOn && profileSkills)
    chips.push({
      label: "Profile skills off",
      clear: () => commit({ skillsOn: true }),
    });

  return (
    <div className="bg-[#E5E8EF] -mt-16 pt-16 pb-10 min-h-screen">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-6 pt-4">
        {/* ── Dark shell: search filters (site nav lives in Navbar) ── */}
        <section className="bg-ink rounded-3xl px-5 sm:px-8 py-7">
          <div className="mb-5">
            <h1 className="font-display text-white text-xl sm:text-2xl font-bold tracking-tight">
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
                value={filters.q}
                onChange={(e) => setDraft({ q: e.target.value })}
                placeholder="Role — Backend, SDE-2, ML"
                aria-label="Role or keyword"
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
                value={filters.city}
                onChange={(e) => setDraft({ city: e.target.value })}
                placeholder="Work location"
                aria-label="Work location"
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
                value={
                  filters.seniority.length === 1 ? filters.seniority[0] : ""
                }
                onChange={(e) =>
                  commit({ seniority: e.target.value ? [e.target.value] : [] })
                }
                aria-label="Experience level"
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
                value={filters.techTrack}
                onChange={(e) =>
                  commit({ techTrack: e.target.value as "" | TechTrack })
                }
                aria-label="Tech track"
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
          <aside className="space-y-5 order-2 lg:order-none">
            <div className="relative overflow-hidden rounded-3xl bg-ink p-6 min-h-64 hidden lg:flex flex-col">
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(300px 200px at 85% 0%, rgba(47,111,237,0.35), transparent)",
                }}
                aria-hidden
              />
              <p className="relative text-white text-[26px] leading-tight font-bold">
                Get your best profession with ReerHub
              </p>
              <Link
                href="/profile"
                className="relative mt-auto pt-6 block text-center px-4 py-2.5 bg-electric text-white rounded-full text-sm font-semibold hover:bg-electric-dark transition-all"
              >
                Complete profile
              </Link>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/70 p-5">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-bold text-slate-900 text-lg">Filters</h2>
                <span className="flex items-center gap-3">
                  <button
                    onClick={() => commit(EMPTY)}
                    className="text-[13px] font-semibold text-slate-400 hover:text-red-500 underline underline-offset-4"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => setFiltersOpen((v) => !v)}
                    aria-expanded={filtersOpen}
                    aria-label={
                      filtersOpen ? "Collapse filters" : "Expand filters"
                    }
                    className="lg:hidden w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500"
                  >
                    <svg
                      className={`w-4 h-4 transition-transform ${filtersOpen ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  </button>
                </span>
              </div>
              <div className={filtersOpen ? "block" : "hidden lg:block"}>
                <p className="text-xs text-slate-400 mb-1">
                  Changes apply instantly.
                </p>
                <p className="text-[13px] font-medium text-slate-400 mt-3 mb-1">
                  Work mode
                </p>
                {WORK_MODES.map((m) => (
                  <Check
                    key={m.value}
                    label={m.label}
                    checked={filters.remoteType.includes(m.value)}
                    onChange={() =>
                      commit({
                        remoteType: toggle(filters.remoteType, m.value),
                      })
                    }
                  />
                ))}
                <p className="text-[13px] font-medium text-slate-400 mt-4 mb-1">
                  Employment
                </p>
                <Check
                  label="Full time"
                  checked={filters.fullTime}
                  onChange={() => commit({ fullTime: !filters.fullTime })}
                />
                <p className="text-[13px] font-medium text-slate-400 mt-4 mb-1">
                  Level
                </p>
                {LEVELS.map((l) => (
                  <Check
                    key={l}
                    label={l}
                    checked={filters.seniority.includes(l)}
                    onChange={() =>
                      commit({ seniority: toggle(filters.seniority, l) })
                    }
                  />
                ))}
              </div>
            </div>
          </aside>

          <section className="order-1 lg:order-none">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-4 px-1">
              <h1 className="text-[28px] font-bold text-slate-900 tracking-tight flex items-center gap-3">
                {savedOnly ? "Saved roles" : "Recommended jobs"}
                <span className="px-3 py-1 rounded-full border border-slate-300 text-sm font-semibold text-slate-600">
                  {savedOnly ? `${visible.length} of ${ids.length}` : total}
                </span>
              </h1>
              <div className="flex items-center gap-2 text-sm">
                <button
                  onClick={() =>
                    commit({}, { view: savedOnly ? "all" : "saved" })
                  }
                  aria-pressed={savedOnly}
                  className={`px-4 py-1.5 rounded-full border text-sm font-semibold transition-all ${
                    savedOnly
                      ? "bg-electric text-white border-electric"
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
                      commit({}, { sort: e.target.value as "updated" | "az" })
                    }
                    className="text-slate-900 font-semibold bg-transparent outline-none cursor-pointer"
                  >
                    <option value="updated">Last updated</option>
                    <option value="az">Title A–Z</option>
                  </select>
                </label>
              </div>
            </div>

            {chips.length > 0 && (
              <div
                className="flex flex-wrap gap-1.5 mb-4 px-1"
                aria-label="Active filters"
              >
                {chips.map((chip) => (
                  <button
                    key={chip.label}
                    onClick={chip.clear}
                    title={`Remove ${chip.label}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-electric-soft text-electric-deep text-[13px] font-semibold hover:opacity-80 transition-all"
                  >
                    {chip.label}
                    <span aria-hidden>×</span>
                  </button>
                ))}
              </div>
            )}

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
                    className="px-6 py-2.5 bg-electric text-white rounded-full text-sm font-semibold hover:bg-electric-dark"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>

            {!loading && page < totalPages && (
              <div className="text-center mt-8">
                <button
                  onClick={() => loadPage(page + 1, currentParams(), true)}
                  disabled={loadingMore}
                  className="px-8 py-3 bg-white border border-slate-200 rounded-full font-semibold text-slate-900 text-[15px] hover:shadow-card transition-all disabled:opacity-50"
                >
                  {loadingMore
                    ? "Loading…"
                    : savedOnly
                      ? `Load more saved (${ids.length - visible.length} left)`
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
