"use client";

import {
  FormEvent,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Icon from "@/components/ui/Icon";
import {
  adminLogout,
  adminSession,
  adminAuthPath,
  getAdmin,
  getAdminList,
  getAdminPage,
  writeAdmin,
  type AdminUser,
  type AdminPage,
} from "@/lib/admin";

type Tab =
  | "overview"
  | "companies"
  | "sources"
  | "jobs"
  | "users"
  | "subscriptions"
  | "audit";
type Company = {
  _id: string;
  name: string;
  slug: string;
  website: string;
  careersUrl: string;
  logoUrl?: string;
  industry?: string;
  companyType?: string;
  country?: string;
  isActive: boolean;
};
type Source = {
  _id: string;
  name: string;
  type: string;
  careersUrl: string;
  config?: Record<string, unknown>;
  isActive: boolean;
  companyId?: { _id: string; name: string };
  lastSuccessfulSyncAt?: string;
  syncClaimedUntil?: string;
  isStale: boolean;
  latestRun?: { status: string; errors?: string[] };
};
type Job = {
  _id: string;
  title: string;
  status: string;
  techTrack?: string;
  techRole?: string;
  remoteType?: string;
  seniority?: string;
  department?: string;
  experience?: { min?: number; max?: number };
  companyId?: { name: string };
  sourceId?: { name: string };
  postedAt?: string;
  firstSeenAt?: string;
  locations?: { city?: string; state?: string; country?: string }[];
  raw?: unknown;
};
type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  profile?: { currentRole?: string; techTrack?: string };
};
type Subscription = {
  _id: string;
  plan?: string;
  status: string;
  trialEndsAt?: string;
  currentPeriodEndsAt?: string;
  accessEndsAt?: string;
  cancelAtPeriodEnd?: boolean;
  userId?: { name: string; email: string };
};
type Audit = {
  _id: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  adminId?: { name: string; email: string };
  before?: unknown;
  after?: unknown;
};
type SyncLog = {
  _id: string;
  status: string;
  startedAt: string;
  errors?: string[];
  companyId?: { name: string };
  sourceId?: { name: string };
};
type Overview = {
  counts: {
    companies: number;
    activeCompanies: number;
    activeJobs: number;
    users: number;
  };
  sourceHealth: { staleSources: number };
  subscriptions: Record<string, number>;
  failedSyncs: SyncLog[];
  recentAudit: Audit[];
};
type Row = Company | Source | Job | User | Subscription | Audit;
type EditorState =
  | { kind: "company"; record?: Company }
  | { kind: "source"; record?: Source }
  | { kind: "job"; record: Job };
type IconName = React.ComponentProps<typeof Icon>["name"];
const NAV: {
  key: Tab;
  label: string;
  description: string;
  icon: IconName;
  group: string;
}[] = [
  {
    key: "overview",
    label: "Overview",
    description: "A clear view of your platform, and what needs attention.",
    icon: "grid",
    group: "Workspace",
  },
  {
    key: "companies",
    label: "Companies",
    description: "Manage the official companies behind your job directory.",
    icon: "briefcase",
    group: "Operations",
  },
  {
    key: "sources",
    label: "Job sources",
    description: "Keep your job feeds healthy, current, and trustworthy.",
    icon: "sliders",
    group: "Operations",
  },
  {
    key: "jobs",
    label: "Job quality",
    description: "Review classification and safely correct indexed openings.",
    icon: "search",
    group: "Operations",
  },
  {
    key: "users",
    label: "Members",
    description:
      "Find a member and understand their profile. Read-only support view.",
    icon: "user",
    group: "Support",
  },
  {
    key: "subscriptions",
    label: "Subscriptions",
    description:
      "Inspect membership states and renewal dates. Billing is read-only here.",
    icon: "bookmark",
    group: "Support",
  },
  {
    key: "audit",
    label: "Audit trail",
    description:
      "Every privileged change, with its operator and before/after values.",
    icon: "clock",
    group: "Governance",
  },
];
const TRACKS = [
  "software",
  "ai-ml",
  "data",
  "cloud-infra",
  "mobile",
  "security",
  "qa",
  "systems",
  "eng-management",
];
const PAGE_SIZE = 25;
const date = (value?: string) =>
  !value || !Number.isFinite(new Date(value).getTime())
    ? "—"
    : new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value));
const label = (value?: string) =>
  value?.replaceAll("_", " ").replaceAll("-", " ") || "Unknown";
const errorMessage = (e: unknown) =>
  e instanceof Error ? e.message : "Something went wrong. Please try again.";
const emptyPage = (): AdminPage<Row> => ({
  data: [],
  pagination: { page: 1, limit: PAGE_SIZE, total: 0, totalPages: 0 },
});
const sourceState = (s: Source) =>
  !s.isActive
    ? "inactive"
    : s.syncClaimedUntil && new Date(s.syncClaimedUntil).getTime() > Date.now()
      ? "running"
      : s.latestRun?.status === "failed"
        ? "failed"
        : s.isStale
          ? "stale"
          : s.latestRun?.status || "not synced";

function Status({ value = "unknown" }: { value?: string }) {
  const tone = ["success", "active", "trialing"].includes(value)
    ? "good"
    : ["failed", "expired", "past_due"].includes(value)
      ? "bad"
      : [
            "stale",
            "partial",
            "pending",
            "running",
            "not synced",
            "authenticated",
          ].includes(value)
        ? "warn"
        : "neutral";
  return (
    <span className={`badge ${tone}`}>
      <span className="status-dot" />
      {label(value)}
    </span>
  );
}
function Empty({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="empty">
      <span className="empty-icon">
        <Icon name="search" />
      </span>
      <h3>{title}</h3>
      <p>{children}</p>
      {action}
    </div>
  );
}
function Loading() {
  return (
    <div className="loading-state" role="status">
      <span className="sr-only">Loading operational data…</span>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="skeleton-row">
          <span />
          <span />
          <span />
        </div>
      ))}
    </div>
  );
}
function Dialog({
  title,
  description,
  children,
  onClose,
  busy = false,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
  busy?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const focus = document.activeElement as HTMLElement | null;
    dialog?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = previous;
      focus?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="admin-ui modal"
      aria-labelledby="admin-dialog-title"
      aria-describedby={description ? "admin-dialog-description" : undefined}
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onClose();
      }}
    >
      <header className="modal-head">
        <div>
          <p className="eyebrow">ReerHub operations</p>
          <h2 id="admin-dialog-title">{title}</h2>
          {description && <p id="admin-dialog-description">{description}</p>}
        </div>
        <button
          className="icon-button"
          aria-label="Close dialog"
          disabled={busy}
          onClick={onClose}
        >
          <Icon name="close" />
        </button>
      </header>
      {children}
    </dialog>
  );
}

export default function AdminConsole() {
  const router = useRouter();
  const [me, setMe] = useState<AdminUser | null>(null);
  const [sessionError, setSessionError] = useState("");
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [overview, setOverview] = useState<Overview | null>(null);
  const [result, setResult] = useState<AdminPage<Row>>(emptyPage);
  const [sources, setSources] = useState<Source[]>([]);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [updatedAt, setUpdatedAt] = useState<string>();
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [sync, setSync] = useState<Source | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState("");
  const [history, setHistory] = useState<Source | null>(null);
  const [detail, setDetail] = useState<{ title: string; data: unknown } | null>(
    null,
  );
  const [signingOut, setSigningOut] = useState(false);
  const request = useRef(0);
  const item = NAV.find((n) => n.key === tab)!;
  const load = useCallback(
    async (target: Tab, currentPage: number, q: string, state: string) => {
      const id = ++request.current;
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({
          page: String(currentPage),
          limit: String(PAGE_SIZE),
        });
        if (q) params.set("q", q);
        if (state && target === "companies") params.set("active", state);
        if (state && ["jobs", "subscriptions"].includes(target))
          params.set("status", state);
        if (target === "overview") {
          const data = await getAdmin<Overview>("/admin/overview");
          if (
            !data?.counts ||
            !data.sourceHealth ||
            !Array.isArray(data.failedSyncs) ||
            !Array.isArray(data.recentAudit)
          )
            throw new Error(
              "The operations snapshot is incomplete. Please refresh.",
            );
          if (id === request.current) setOverview(data);
        } else if (target === "sources") {
          const data = await getAdminList<Source>("/admin/sources");
          if (id === request.current) setSources(data);
        } else {
          const route = target === "audit" ? "audit-logs" : target;
          const data = await getAdminPage<Row>(`/admin/${route}?${params}`);
          if (id === request.current) setResult(data);
        }
        if (id === request.current) setUpdatedAt(new Date().toISOString());
      } catch (e) {
        if (id === request.current) {
          const status = (e as { status?: number })?.status;
          if (status === 401 || status === 403) router.replace(adminAuthPath());
          else setError(errorMessage(e));
        }
      } finally {
        if (id === request.current) setLoading(false);
      }
    },
    [router],
  );
  useEffect(() => {
    let live = true;
    const activeRequests = request;
    adminSession()
      .then((user) => {
        if (live) setMe(user);
      })
      .catch((e) => {
        if (!live) return;
        const status = (e as { status?: number })?.status;
        if (status === 401 || status === 403) router.replace(adminAuthPath());
        else setSessionError(errorMessage(e));
      });
    const restore = () => {
      const value = window.location.hash.slice(1);
      if (NAV.some((n) => n.key === value)) {
        setTab(value as Tab);
        setPage(1);
        setFilter("");
        setQuery("");
        setSearch("");
        setResult(emptyPage());
      }
    };
    restore();
    window.addEventListener("hashchange", restore);
    return () => {
      live = false;
      activeRequests.current++;
      window.removeEventListener("hashchange", restore);
    };
  }, [router]);
  useEffect(() => {
    let live = true;
    const activeRequests = request;
    if (me)
      void Promise.resolve().then(() => {
        if (live) return load(tab, page, search, filter);
      });
    return () => {
      live = false;
      activeRequests.current++;
    };
  }, [me, tab, page, search, filter, load]);
  const navigate = (next: Tab) => {
    setTab(next);
    setPage(1);
    setQuery("");
    setSearch("");
    setFilter("");
    setNotice("");
    if (next !== tab) setResult(emptyPage());
    window.history.pushState(null, "", `#${next}`);
  };
  const refresh = () => load(tab, page, search, filter);
  async function signOut() {
    setSigningOut(true);
    try {
      await adminLogout();
      router.replace(adminAuthPath());
    } catch (e) {
      setError(`Sign-out failed: ${errorMessage(e)}`);
      setSigningOut(false);
    }
  }
  async function runSync() {
    if (!sync || syncing) return;
    setSyncing(true);
    setSyncError("");
    try {
      const response = await writeAdmin<{ status?: string }>(
        `/admin/sources/${sync._id}/sync`,
        "POST",
      );
      setNotice(
        `${sync.name}: sync finished with ${label(response.status)} status. Review source history for details.`,
      );
      setSync(null);
      await refresh();
    } catch (e) {
      setSyncError(errorMessage(e));
    } finally {
      setSyncing(false);
    }
  }
  const visibleSources = sources.filter(
    (s) =>
      `${s.name} ${s.companyId?.name || ""} ${s.type}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (!filter ||
        (filter === "active"
          ? s.isActive
          : filter === "inactive"
            ? !s.isActive
            : filter === "stale"
              ? s.isActive && s.isStale
              : sourceState(s) === filter)),
  );
  const rows: Row[] = tab === "sources" ? visibleSources : result.data;
  const total =
    tab === "sources" ? visibleSources.length : result.pagination.total;
  const filters =
    tab === "companies"
      ? [
          ["", "All companies"],
          ["true", "Active"],
          ["false", "Inactive"],
        ]
      : tab === "sources"
        ? [
            ["", "All sources"],
            ["active", "Active"],
            ["inactive", "Inactive"],
            ["stale", "Needs attention"],
            ["failed", "Failed"],
            ["running", "Running"],
          ]
        : tab === "jobs"
          ? [
              ["", "All job states"],
              ["active", "Active"],
              ["closed", "Closed"],
            ]
          : tab === "subscriptions"
            ? [
                ["", "All memberships"],
                ...[
                  "trialing",
                  "active",
                  "pending",
                  "past_due",
                  "cancelled",
                  "expired",
                  "completed",
                ].map((s) => [s, label(s)]),
              ]
            : [];
  if (!me)
    return (
      <main className="admin-ui access-check">
        <div className="access-card">
          <Icon name="shield" />
          <h1>
            {sessionError
              ? "Connection needs attention"
              : "Checking administrator access"}
          </h1>
          <p>{sessionError || "Verifying your secure ReerHub session…"}</p>
          {sessionError && (
            <button
              className="button primary"
              onClick={() => window.location.reload()}
            >
              Try again
            </button>
          )}
        </div>
      </main>
    );
  return (
    <div className="admin-ui shell">
      <a className="admin-skip" href="#admin-content">
        Skip to workspace
      </a>
      <aside className="sidebar">
        <a
          className="brand"
          href="#overview"
          onClick={(e) => {
            e.preventDefault();
            navigate("overview");
          }}
        >
          <Image src="/reerhub-icon-logo.png" width={34} height={34} alt="" />
          <span>
            ReerHub<small>OPERATIONS CONSOLE</small>
          </span>
        </a>
        <nav className="nav" aria-label="Admin navigation">
          {NAV.map((n, i) => (
            <div key={n.key}>
              {(i === 0 || NAV[i - 1].group !== n.group) && (
                <p className="nav-group">{n.group}</p>
              )}
              <button
                aria-current={tab === n.key ? "page" : undefined}
                onClick={() => navigate(n.key)}
              >
                <Icon name={n.icon} />
                <span>{n.label}</span>
                {tab === n.key && <span className="nav-active-dot" />}
              </button>
            </div>
          ))}
        </nav>
        <div className="sidebar-note">
          <Icon name="shield" />
          <div>
            <strong>Protected workspace</strong>
            <p>
              Changes are recorded.
              <br />
              Historical records stay intact.
            </p>
          </div>
        </div>
        <div className="sidebar-foot">
          <div className="avatar">
            {me.name?.slice(0, 1).toUpperCase() || "A"}
          </div>
          <div>
            <strong>{me.name || "Administrator"}</strong>
            <span>{me.email}</span>
          </div>
        </div>
      </aside>
      <div className="workspace">
        <div className="workspace-bar">
          <span>
            <Icon name="shield" /> Administrator workspace
          </span>
          <button
            className="button compact"
            disabled={signingOut}
            onClick={signOut}
          >
            <Icon name="logout" />
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
        <main id="admin-content" className="content" tabIndex={-1}>
          <header className="topbar">
            <div>
              <p className="eyebrow">ReerHub / {item.group}</p>
              <h1>{item.label}</h1>
              <p className="page-description">{item.description}</p>
            </div>
            <div className="header-actions">
              <button className="button" disabled={loading} onClick={refresh}>
                <Icon name="clock" />
                {loading ? "Refreshing…" : "Refresh data"}
              </button>
              {["companies", "sources"].includes(tab) && (
                <button
                  className="button primary"
                  onClick={() =>
                    setEditor(
                      tab === "companies"
                        ? { kind: "company" }
                        : { kind: "source" },
                    )
                  }
                >
                  <span aria-hidden>＋</span>Add{" "}
                  {tab === "companies" ? "company" : "source"}
                </button>
              )}
            </div>
          </header>
          {notice && (
            <div className="notice" role="status">
              <Icon name="check" />
              <span>{notice}</span>
              <button
                className="icon-button"
                aria-label="Dismiss message"
                onClick={() => setNotice("")}
              >
                <Icon name="close" />
              </button>
            </div>
          )}
          {error && (
            <div className="notice error" role="alert">
              <Icon name="shield" />
              <span>{error} Previously loaded data may be out of date.</span>
              <button className="button compact" onClick={refresh}>
                Retry
              </button>
            </div>
          )}
          {tab === "overview" ? (
            loading ? (
              <Loading />
            ) : overview ? (
              <OverviewView data={overview} navigate={navigate} />
            ) : (
              <Empty
                title="Snapshot unavailable"
                action={
                  <button className="button" onClick={refresh}>
                    Try again
                  </button>
                }
              >
                Refresh to load the operations overview.
              </Empty>
            )
          ) : (
            <section className="panel data-panel" aria-busy={loading}>
              <div className="panel-head">
                <div>
                  <h2>
                    {item.label} directory{" "}
                    <span className="count-pill">
                      {loading ? "…" : total.toLocaleString("en-IN")}
                    </span>
                  </h2>
                  <p>
                    {["users", "subscriptions"].includes(tab)
                      ? "Read-only · no account or payment changes"
                      : tab === "audit"
                        ? "Immutable history · newest first"
                        : "Official data · safe edits · no hard deletion"}
                  </p>
                </div>
                {updatedAt && (
                  <span className="subtle updated">
                    Updated {date(updatedAt)}
                  </span>
                )}
              </div>
              <div className="toolbar">
                {["companies", "jobs", "users", "sources"].includes(tab) && (
                  <form
                    className="search-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      setSearch(query.trim());
                      setPage(1);
                    }}
                  >
                    <label className="search-box">
                      <Icon name="search" />
                      <input
                        aria-label={`Search ${item.label.toLowerCase()}`}
                        value={query}
                        maxLength={100}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={
                          tab === "users"
                            ? "Search member name or email"
                            : tab === "jobs"
                              ? "Search title, skill or department"
                              : `Search ${item.label.toLowerCase()}…`
                        }
                      />
                    </label>
                    {tab !== "sources" && (
                      <button className="button">Search</button>
                    )}
                  </form>
                )}
                {filters.length > 0 && (
                  <select
                    className="filter-select"
                    aria-label={`Filter ${item.label}`}
                    value={filter}
                    onChange={(e) => {
                      setFilter(e.target.value);
                      setPage(1);
                    }}
                  >
                    {filters.map(([v, t]) => (
                      <option key={v} value={v}>
                        {t}
                      </option>
                    ))}
                  </select>
                )}
                {(search || query || filter) && (
                  <button
                    className="text-button"
                    onClick={() => {
                      setSearch("");
                      setQuery("");
                      setFilter("");
                      setPage(1);
                    }}
                  >
                    Clear filters
                  </button>
                )}
              </div>
              {loading ? (
                <Loading />
              ) : (
                <Tables
                  tab={tab}
                  rows={rows}
                  edit={setEditor}
                  sync={(s) => {
                    setSync(s);
                    setSyncError("");
                  }}
                  history={setHistory}
                  detail={setDetail}
                />
              )}
              {tab !== "sources" && (
                <footer className="pagination">
                  <span>
                    {total
                      ? `${(result.pagination.page - 1) * PAGE_SIZE + 1}–${Math.min(result.pagination.page * PAGE_SIZE, total)} of ${total.toLocaleString("en-IN")}`
                      : "0 records"}
                  </span>
                  <div>
                    <button
                      className="button compact"
                      disabled={loading || page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Previous
                    </button>
                    <span>
                      Page {page} of {Math.max(1, result.pagination.totalPages)}
                    </span>
                    <button
                      className="button compact"
                      disabled={loading || page >= result.pagination.totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </button>
                  </div>
                </footer>
              )}
            </section>
          )}
          <footer className="workspace-footer">
            <span>ReerHub · Operations</span>
            <span>
              <Icon name="shield" /> Authorized operators only
            </span>
          </footer>
        </main>
      </div>
      {editor && (
        <Editor
          key={`${editor.kind}-${editor.record?._id || "new"}`}
          editor={editor}
          onClose={() => setEditor(null)}
          onSaved={async () => {
            setEditor(null);
            setNotice(
              "Changes saved. Before and after values are recorded in the audit trail.",
            );
            await refresh();
          }}
        />
      )}
      {sync && (
        <Dialog
          title={`Sync ${sync.name}?`}
          description="Fetch current openings from the official source. A failed sync preserves existing jobs. This action is recorded in the audit trail."
          onClose={() => setSync(null)}
          busy={syncing}
        >
          <div className="modal-body">
            <div className="detail-summary">
              <Status value={sourceState(sync)} />
              <p>
                {sync.companyId?.name} · {label(sync.type)}
              </p>
              <p className="subtle">
                Last successful sync: {date(sync.lastSuccessfulSyncAt)}
              </p>
            </div>
            {syncError && (
              <p className="notice error" role="alert">
                {syncError}
              </p>
            )}
            {syncing && (
              <p role="status">
                Sync is running. Please keep this dialog open until the request
                finishes.
              </p>
            )}
          </div>
          <footer className="modal-actions">
            <button
              className="button"
              disabled={syncing}
              onClick={() => setSync(null)}
            >
              Cancel
            </button>
            <button
              className="button primary"
              disabled={syncing}
              onClick={runSync}
            >
              {syncing ? "Syncing source…" : "Confirm & sync"}
            </button>
          </footer>
        </Dialog>
      )}
      {history && (
        <SourceHistory source={history} onClose={() => setHistory(null)} />
      )}
      {detail && (
        <Dialog
          title={detail.title}
          description="Read-only detail. No data is modified from this view."
          onClose={() => setDetail(null)}
        >
          <div className="modal-body">
            {detail.title === "Member profile" ? (
              <MemberDetails member={detail.data as User} />
            ) : (
              <pre className="json-preview">
                {JSON.stringify(detail.data, null, 2)}
              </pre>
            )}
          </div>
        </Dialog>
      )}
    </div>
  );
}

function OverviewView({
  data,
  navigate,
}: {
  data: Overview;
  navigate: (tab: Tab) => void;
}) {
  const pro =
    (data.subscriptions?.active || 0) + (data.subscriptions?.trialing || 0);
  const metrics: [string, number, string, Tab, IconName][] = [
    [
      "Active openings",
      data.counts.activeJobs,
      "Official roles in the directory",
      "jobs",
      "briefcase",
    ],
    [
      "Active companies",
      data.counts.activeCompanies,
      `${data.counts.companies} total companies`,
      "companies",
      "grid",
    ],
    [
      "Registered members",
      data.counts.users,
      "Profiles in your community",
      "users",
      "user",
    ],
    [
      "Source attention",
      data.sourceHealth.staleSources,
      "Active feeds not synced in 30+ hours",
      "sources",
      "sliders",
    ],
  ];
  return (
    <div className="overview-grid">
      <section
        className={`health-banner ${data.sourceHealth.staleSources ? "attention" : ""}`}
      >
        <div className="health-icon">
          <Icon name={data.sourceHealth.staleSources ? "clock" : "shield"} />
        </div>
        <div>
          <p className="eyebrow">Source freshness</p>
          <h2>
            {data.sourceHealth.staleSources
              ? `${data.sourceHealth.staleSources} source${data.sourceHealth.staleSources === 1 ? " needs" : "s need"} a closer look`
              : "No stale active sources detected"}
          </h2>
          <p>
            {data.sourceHealth.staleSources
              ? "Inspect feed health and recent runs before triggering a fresh sync."
              : "Your active feeds have a successful sync within the freshness window."}
          </p>
        </div>
        <button className="button" onClick={() => navigate("sources")}>
          Review sources <Icon name="arrow" />
        </button>
      </section>
      <section className="metrics">
        {metrics.map(([name, value, copy, target, icon]) => (
          <button
            key={name}
            className="metric"
            onClick={() => navigate(target)}
          >
            <span className="metric-top">
              {name}
              <Icon name={icon} />
            </span>
            <strong>{Number(value || 0).toLocaleString("en-IN")}</strong>
            <span className="metric-foot">
              {copy}
              <Icon name="arrow" />
            </span>
          </button>
        ))}
      </section>
      <section className="two-col">
        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>Recent sync exceptions</h2>
              <p>
                Historical failed or partial runs · not necessarily unresolved
              </p>
            </div>
            <button className="text-button" onClick={() => navigate("sources")}>
              View sources <Icon name="arrow" />
            </button>
          </div>
          <div className="panel-body">
            {data.failedSyncs.length ? (
              data.failedSyncs.map((run) => (
                <article className="status-row" key={run._id}>
                  <div className="row-icon">
                    <Icon name="sliders" />
                  </div>
                  <div className="row-copy">
                    <strong>{run.companyId?.name || "Unknown company"}</strong>
                    <p>
                      {run.sourceId?.name || "Source"} · {date(run.startedAt)}
                    </p>
                    {run.errors?.[0] && (
                      <p className="exception-copy">{run.errors[0]}</p>
                    )}
                  </div>
                  <Status value={run.status} />
                </article>
              ))
            ) : (
              <Empty title="No recent sync exceptions">
                Failed and partial runs will appear here for review.
              </Empty>
            )}
          </div>
        </div>
        <div className="panel membership-panel">
          <div className="panel-head">
            <div>
              <h2>Membership snapshot</h2>
              <p>Stored subscription states · read-only</p>
            </div>
            <Icon name="bookmark" />
          </div>
          <div className="panel-body">
            <div className="membership-total">
              <span>Active + trial subscriptions</span>
              <strong>{pro.toLocaleString("en-IN")}</strong>
            </div>
            {Object.entries(data.subscriptions || {}).length ? (
              Object.entries(data.subscriptions).map(([state, count]) => (
                <div className="status-row" key={state}>
                  <Status value={state} />
                  <strong>{count.toLocaleString("en-IN")}</strong>
                </div>
              ))
            ) : (
              <p className="subtle">No subscriptions recorded yet.</p>
            )}
            <button
              className="button full-width"
              onClick={() => navigate("subscriptions")}
            >
              Open subscriptions <Icon name="arrow" />
            </button>
          </div>
        </div>
      </section>
      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>Operator activity</h2>
            <p>A traceable record of changes across your platform</p>
          </div>
          <button className="text-button" onClick={() => navigate("audit")}>
            Full audit trail <Icon name="arrow" />
          </button>
        </div>
        <div className="activity-list">
          {data.recentAudit.length ? (
            data.recentAudit.map((a) => (
              <article className="activity" key={a._id}>
                <span className="activity-dot" />
                <div>
                  <strong>{a.action.replaceAll(".", " · ")}</strong>
                  <p>
                    {a.adminId?.name || "Administrator"} · {a.entityType}
                  </p>
                </div>
                <time>{date(a.createdAt)}</time>
              </article>
            ))
          ) : (
            <Empty title="Your audit trail starts here">
              Company, source, and job changes will be recorded automatically.
            </Empty>
          )}
        </div>
      </section>
    </div>
  );
}

function Tables({
  tab,
  rows,
  edit,
  sync,
  history,
  detail,
}: {
  tab: Tab;
  rows: Row[];
  edit: (s: EditorState) => void;
  sync: (s: Source) => void;
  history: (s: Source) => void;
  detail: (s: { title: string; data: unknown }) => void;
}) {
  const headers =
    tab === "companies"
      ? ["Company", "Official source", "Availability", "Actions"]
      : tab === "sources"
        ? [
            "Source / company",
            "Adapter",
            "Health",
            "Last successful sync",
            "Actions",
          ]
        : tab === "jobs"
          ? [
              "Opening",
              "Company / location",
              "Classification",
              "Status",
              "Published / first seen",
              "Actions",
            ]
          : tab === "users"
            ? ["Member", "Role", "Profile", "Joined", "Actions"]
            : tab === "subscriptions"
              ? ["Member", "Plan", "Status", "Access / period end", "Renewal"]
              : ["Action", "Target", "Operator", "Recorded", "Actions"];
  return (
    <div
      className="table-wrap"
      tabIndex={0}
      role="region"
      aria-label={`${label(tab)} records; scroll horizontally on small screens`}
    >
      <table className="table">
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h} scope="col">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {!rows.length ? (
            <tr>
              <td colSpan={headers.length}>
                <Empty title="No records to show">
                  {tab === "companies"
                    ? "Clear your filters or add the first official company."
                    : tab === "sources"
                      ? "Add an official feed or clear the source filters."
                      : tab === "jobs"
                        ? "Clear your search and filters, or check whether your sources have synced."
                        : tab === "users"
                          ? "No members match this search. Accounts appear here after registration."
                          : tab === "subscriptions"
                            ? "No subscriptions match this state. Records appear when members start checkout."
                            : "Privileged changes will appear here automatically with their before and after values."}
                </Empty>
              </td>
            </tr>
          ) : (
            rows.map((record) => {
              let cells: ReactNode;
              if (tab === "companies") {
                const c = record as Company;
                cells = (
                  <>
                    <td>
                      <div className="identity">
                        <span className="company-initial">
                          {c.name?.slice(0, 1).toUpperCase()}
                        </span>
                        <div>
                          <strong>{c.name}</strong>
                          <span className="subtle">{c.industry || c.slug}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <a
                        className="source-link"
                        href={c.careersUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Careers page <Icon name="external" />
                      </a>
                      <span className="subtle">
                        {c.country || "Country not specified"}
                      </span>
                    </td>
                    <td>
                      <Status value={c.isActive ? "active" : "inactive"} />
                    </td>
                    <td>
                      <button
                        className="button compact"
                        aria-label={`Edit ${c.name}`}
                        onClick={() => edit({ kind: "company", record: c })}
                      >
                        Edit company
                      </button>
                    </td>
                  </>
                );
              } else if (tab === "sources") {
                const s = record as Source;
                const state = sourceState(s);
                cells = (
                  <>
                    <td>
                      <strong>{s.name}</strong>
                      <span className="subtle">
                        {s.companyId?.name || "Company unavailable"}
                      </span>
                    </td>
                    <td>
                      <span className="adapter-label">{label(s.type)}</span>
                    </td>
                    <td>
                      <Status value={state} />
                      {s.latestRun?.errors?.[0] && (
                        <span className="subtle exception-copy">
                          {s.latestRun.errors[0]}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="date-cell">
                        {date(s.lastSuccessfulSyncAt)}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="button compact"
                          disabled={!s.isActive || state === "running"}
                          onClick={() => sync(s)}
                        >
                          {state === "running" ? "Running…" : "Sync now"}
                        </button>
                        <button
                          className="button compact"
                          onClick={() => history(s)}
                        >
                          History
                        </button>
                        <button
                          className="text-button"
                          aria-label={`Edit ${s.name}`}
                          onClick={() => edit({ kind: "source", record: s })}
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </>
                );
              } else if (tab === "jobs") {
                const j = record as Job;
                cells = (
                  <>
                    <td>
                      <strong>{j.title}</strong>
                      <span className="subtle">
                        {j.sourceId?.name || "Official source"}
                      </span>
                    </td>
                    <td>
                      <strong>
                        {j.companyId?.name || "Company unavailable"}
                      </strong>
                      <span className="subtle">
                        {j.locations
                          ?.map((l) => l.city)
                          .filter(Boolean)
                          .join(", ") || "Location not specified"}{" "}
                        · {label(j.remoteType)}
                      </span>
                    </td>
                    <td>
                      <span className="adapter-label">
                        {label(j.techTrack)}
                      </span>
                      <span className="subtle">
                        {j.techRole || "Role not classified"}
                      </span>
                    </td>
                    <td>
                      <Status value={j.status} />
                    </td>
                    <td className="date-cell">
                      {date(j.postedAt || j.firstSeenAt)}
                    </td>
                    <td>
                      <button
                        className="button compact"
                        aria-label={`Review ${j.title}`}
                        onClick={() => edit({ kind: "job", record: j })}
                      >
                        Review role
                      </button>
                    </td>
                  </>
                );
              } else if (tab === "users") {
                const u = record as User;
                cells = (
                  <>
                    <td>
                      <div className="identity">
                        <span className="avatar">
                          {u.name?.slice(0, 1).toUpperCase() || "M"}
                        </span>
                        <div>
                          <strong>{u.name || "Unnamed member"}</strong>
                          <span className="subtle">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <Status value={u.role} />
                    </td>
                    <td>
                      <strong>
                        {u.profile?.currentRole || "Not completed"}
                      </strong>
                      <span className="subtle">
                        {u.profile?.techTrack
                          ? label(u.profile.techTrack)
                          : "No tech track"}
                      </span>
                    </td>
                    <td className="date-cell">{date(u.createdAt)}</td>
                    <td>
                      <button
                        className="button compact"
                        onClick={() =>
                          detail({ title: "Member profile", data: u })
                        }
                      >
                        View profile
                      </button>
                    </td>
                  </>
                );
              } else if (tab === "subscriptions") {
                const s = record as Subscription;
                cells = (
                  <>
                    <td>
                      <strong>{s.userId?.name || "Member unavailable"}</strong>
                      <span className="subtle">{s.userId?.email || s._id}</span>
                    </td>
                    <td>
                      <span className="adapter-label">
                        {label(s.plan?.replace("pro-", ""))}
                      </span>
                    </td>
                    <td>
                      <Status value={s.status} />
                    </td>
                    <td className="date-cell">
                      {date(
                        s.accessEndsAt ||
                          s.currentPeriodEndsAt ||
                          s.trialEndsAt,
                      )}
                    </td>
                    <td>
                      <span className="subtle">
                        {s.cancelAtPeriodEnd
                          ? "Cancels at period end"
                          : ["active", "trialing"].includes(s.status)
                            ? "Automatic renewal"
                            : "See subscription status"}
                      </span>
                    </td>
                  </>
                );
              } else {
                const a = record as Audit;
                cells = (
                  <>
                    <td>
                      <strong>{a.action.replaceAll(".", " · ")}</strong>
                      <span className="subtle">{a.entityType}</span>
                    </td>
                    <td>
                      <code className="record-id">{a.entityId}</code>
                    </td>
                    <td>
                      <strong>
                        {a.adminId?.name || "Operator unavailable"}
                      </strong>
                      <span className="subtle">{a.adminId?.email || ""}</span>
                    </td>
                    <td className="date-cell">{date(a.createdAt)}</td>
                    <td>
                      <button
                        className="button compact"
                        onClick={() =>
                          detail({
                            title: "Audit event",
                            data: {
                              action: a.action,
                              target: a.entityId,
                              recordedAt: a.createdAt,
                              before: a.before ?? null,
                              after: a.after ?? null,
                            },
                          })
                        }
                      >
                        View changes
                      </button>
                    </td>
                  </>
                );
              }
              return <tr key={record._id}>{cells}</tr>;
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

function MemberDetails({ member }: { member: User }) {
  const profile = member.profile as User["profile"] & {
    skills?: string[];
    experienceYears?: number;
    city?: string;
    remoteType?: string;
    headline?: string;
  };
  const fields = [
    ["Email address", member.email],
    ["Account role", label(member.role)],
    ["Joined", date(member.createdAt)],
    ["Current role", profile?.currentRole || "Not provided"],
    [
      "Tech track",
      profile?.techTrack ? label(profile.techTrack) : "Not provided",
    ],
    [
      "Experience",
      profile?.experienceYears === undefined
        ? "Not provided"
        : `${profile.experienceYears} years`,
    ],
    ["Preferred city", profile?.city || "Not provided"],
    [
      "Work preference",
      profile?.remoteType ? label(profile.remoteType) : "Not provided",
    ],
  ];
  return (
    <div className="member-details">
      <div className="identity">
        <span className="avatar">
          {member.name?.slice(0, 1).toUpperCase() || "M"}
        </span>
        <div>
          <h3>{member.name || "Unnamed member"}</h3>
          <p className="subtle">{profile?.headline || "ReerHub member"}</p>
        </div>
      </div>
      <dl className="detail-fields">
        {fields.map(([key, value]) => (
          <div key={key}>
            <dt>{key}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <h3>Profile skills</h3>
      <div className="skill-list">
        {profile?.skills?.length ? (
          profile.skills.map((skill) => (
            <span className="adapter-label" key={skill}>
              {skill}
            </span>
          ))
        ) : (
          <p className="subtle">No skills recorded yet.</p>
        )}
      </div>
      <p className="subtle">
        Member accounts and roles cannot be modified in this console.
      </p>
    </div>
  );
}
function SourceHistory({
  source,
  onClose,
}: {
  source: Source;
  onClose: () => void;
}) {
  const [runs, setRuns] = useState<SyncLog[] | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let live = true;
    getAdminList<SyncLog>(`/admin/sync-logs?sourceId=${source._id}&limit=25`)
      .then((data) => {
        if (live) {
          setRuns(data);
          setError("");
        }
      })
      .catch((e) => {
        if (live) setError(errorMessage(e));
      });
    return () => {
      live = false;
    };
  }, [source._id, attempt]);
  return (
    <Dialog
      title={`${source.name} · sync history`}
      description="The latest 25 runs. Errors are retained so you can diagnose an unhealthy source."
      onClose={onClose}
    >
      <div className="modal-body">
        {error ? (
          <div className="notice error" role="alert">
            {error}
            <button
              className="button compact"
              onClick={() => setAttempt((a) => a + 1)}
            >
              Retry
            </button>
          </div>
        ) : !runs ? (
          <Loading />
        ) : runs.length ? (
          runs.map((run) => (
            <article className="history-run" key={run._id}>
              <div className="status-row">
                <strong>{date(run.startedAt)}</strong>
                <Status value={run.status} />
              </div>
              {run.errors?.length ? (
                <ul className="run-errors">
                  {run.errors.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              ) : (
                <p className="subtle">No errors recorded for this run.</p>
              )}
            </article>
          ))
        ) : (
          <Empty title="This source has not run yet">
            An active source will be picked up by the scheduler, or you can
            trigger a manual sync.
          </Empty>
        )}
      </div>
    </Dialog>
  );
}

function Editor({
  editor,
  onClose,
  onSaved,
}: {
  editor: EditorState;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [job, setJob] = useState<Job | null>(
    editor.kind === "job" ? editor.record : null,
  );
  const [ready, setReady] = useState(editor.kind === "company");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const submitting = useRef(false);
  useEffect(() => {
    let live = true;
    async function prepare() {
      if (editor.kind === "source") {
        const all: Company[] = [];
        let page = 1;
        let pages = 1;
        do {
          const response = await getAdminPage<Company>(
            `/admin/companies?limit=100&page=${page}`,
          );
          all.push(...response.data);
          pages = response.pagination.totalPages;
          page++;
        } while (page <= pages);
        if (live) setCompanies(all);
      }
      if (editor.kind === "job") {
        const detail = await getAdmin<Job>(`/admin/jobs/${editor.record._id}`);
        if (live) setJob(detail);
      }
      if (live) {
        setReady(true);
        setError("");
      }
    }
    prepare().catch((e) => {
      if (live) setError(errorMessage(e));
    });
    return () => {
      live = false;
    };
  }, [editor, attempt]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const form = new FormData(event.currentTarget);
    const get = (name: string) => String(form.get(name) || "").trim();
    let body: Record<string, unknown>;
    try {
      if (editor.kind === "company")
        body = {
          name: get("name"),
          slug: get("slug"),
          website: get("website"),
          careersUrl: get("careersUrl"),
          industry: get("industry"),
          companyType: get("companyType"),
          country: get("country"),
          ...(get("logoUrl") ? { logoUrl: get("logoUrl") } : {}),
          isActive: form.get("isActive") === "on",
        };
      else if (editor.kind === "source") {
        if (get("type") === "custom" && form.get("isActive") === "on") {
          throw new Error(
            "The custom adapter is not implemented. Save this source as inactive until a fetcher is available.",
          );
        }
        const config = JSON.parse(get("config") || "{}");
        if (!config || typeof config !== "object" || Array.isArray(config))
          throw new Error("Adapter configuration must be a JSON object.");
        const requiredKey: Record<string, string> = {
          greenhouse: "boardToken",
          ashby: "boardName",
          lever: "leverOrg",
          smartrecruiters: "company",
        };
        const key = requiredKey[get("type")];
        if (key && (typeof config[key] !== "string" || !config[key].trim()))
          throw new Error(
            `This adapter requires a non-empty ${key} in its JSON configuration.`,
          );
        body = {
          name: get("name"),
          companyId: get("companyId"),
          type: get("type"),
          careersUrl: get("careersUrl"),
          config,
          isActive: form.get("isActive") === "on",
        };
      } else {
        const experience: { min?: number; max?: number } = {};
        if (get("experienceMin")) experience.min = Number(get("experienceMin"));
        if (get("experienceMax")) experience.max = Number(get("experienceMax"));
        if (
          experience.min !== undefined &&
          experience.max !== undefined &&
          experience.min > experience.max
        )
          throw new Error(
            "Minimum experience cannot exceed maximum experience.",
          );
        const cities = form.getAll("locationCity");
        const states = form.getAll("locationState");
        const countries = form.getAll("locationCountry");
        const locations = cities
          .map((city, i) => ({
            city: String(city).trim(),
            state: String(states[i] || "").trim(),
            country: String(countries[i] || "").trim(),
          }))
          .filter(
            (location) => location.city || location.state || location.country,
          );
        body = {
          status: get("status"),
          ...(get("techTrack") ? { techTrack: get("techTrack") } : {}),
          techRole: get("techRole"),
          remoteType: get("remoteType"),
          seniority: get("seniority"),
          department: get("department"),
          experience,
          locations,
        };
      }
    } catch (e) {
      setError(errorMessage(e));
      return;
    }
    submitting.current = true;
    setSaving(true);
    setError("");
    try {
      const plural =
        editor.kind === "company"
          ? "companies"
          : editor.kind === "source"
            ? "sources"
            : "jobs";
      await writeAdmin(
        `/admin/${plural}${editor.record ? `/${editor.record._id}` : ""}`,
        editor.record ? "PATCH" : "POST",
        body,
      );
      await onSaved();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  }
  const c = editor.record as Company | undefined;
  const s = editor.record as Source | undefined;
  const title =
    editor.kind === "job"
      ? "Review job quality"
      : `${editor.record ? "Edit" : "Add"} ${editor.kind}`;
  return (
    <Dialog
      title={title}
      description={
        editor.kind === "job"
          ? job?.title
          : "Edits are validated and recorded. Deactivation preserves historical data."
      }
      onClose={onClose}
      busy={saving}
    >
      {!ready ? (
        <div className="modal-body">
          {error ? (
            <div className="notice error" role="alert">
              {error}
              <button
                className="button"
                onClick={() => setAttempt((a) => a + 1)}
              >
                Retry
              </button>
            </div>
          ) : (
            <Loading />
          )}
        </div>
      ) : (
        <form onSubmit={submit}>
          <div className="modal-body">
            <fieldset disabled={saving} className="form-grid">
              {editor.kind === "company" && (
                <>
                  <Field
                    label="Company name"
                    name="name"
                    value={c?.name}
                    required
                    maxLength={160}
                  />
                  <Field
                    label="URL slug"
                    name="slug"
                    value={c?.slug}
                    required
                    pattern="[a-z0-9]+(-[a-z0-9]+)*"
                    hint="Lowercase words separated by hyphens."
                  />
                  <Field
                    label="Website"
                    name="website"
                    value={c?.website}
                    required
                    type="url"
                  />
                  <Field
                    label="Official careers URL"
                    name="careersUrl"
                    value={c?.careersUrl}
                    required
                    type="url"
                  />
                  <Field label="Industry" name="industry" value={c?.industry} />
                  <Field
                    label="Company type"
                    name="companyType"
                    value={c?.companyType}
                  />
                  <Field
                    label="Country"
                    name="country"
                    value={c?.country || "India"}
                  />
                  <Field
                    label="Logo URL (optional)"
                    name="logoUrl"
                    value={c?.logoUrl}
                    type="url"
                  />
                </>
              )}
              {editor.kind === "source" && (
                <>
                  <Select
                    label="Company"
                    name="companyId"
                    value={s?.companyId?._id || ""}
                    required
                    options={[
                      ["", "Select a company"],
                      ...companies.map((c) => [c._id, c.name]),
                    ]}
                  />
                  {!companies.length && (
                    <p className="notice error field-full">
                      Create a company first before adding a source.
                    </p>
                  )}
                  <Field
                    label="Source name"
                    name="name"
                    value={s?.name}
                    required
                  />
                  <Select
                    label="Adapter"
                    name="type"
                    value={s?.type || "greenhouse"}
                    options={[
                      "greenhouse",
                      "ashby",
                      "lever",
                      "smartrecruiters",
                      "custom",
                    ].map((t) => [t, label(t)])}
                  />
                  <Field
                    label="Official careers URL"
                    name="careersUrl"
                    value={s?.careersUrl}
                    required
                    type="url"
                  />
                  <label className="field field-full">
                    <span>Adapter configuration (JSON)</span>
                    <textarea
                      className="code-input"
                      name="config"
                      rows={5}
                      defaultValue={JSON.stringify(s?.config || {}, null, 2)}
                      required
                      spellCheck={false}
                    />
                    <small>
                      Greenhouse: boardToken · Ashby: boardName · Lever:
                      leverOrg · SmartRecruiters: company. Custom adapter is not
                      implemented; keep custom sources inactive.
                    </small>
                  </label>
                </>
              )}
              {editor.kind === "job" && (
                <>
                  <Select
                    label="Job status"
                    name="status"
                    value={job?.status || "active"}
                    options={[
                      ["active", "Active"],
                      ["closed", "Closed"],
                    ]}
                  />
                  <Select
                    label="Tech track"
                    name="techTrack"
                    value={job?.techTrack || ""}
                    options={[
                      ...(!job?.techTrack ? [["", "Not classified"]] : []),
                      ...TRACKS.map((t) => [t, label(t)]),
                    ]}
                  />
                  <Field
                    label="Technical role"
                    name="techRole"
                    value={job?.techRole}
                  />
                  <Select
                    label="Work mode"
                    name="remoteType"
                    value={job?.remoteType || "unknown"}
                    options={["unknown", "onsite", "hybrid", "remote"].map(
                      (t) => [t, label(t)],
                    )}
                  />
                  <Field
                    label="Seniority"
                    name="seniority"
                    value={job?.seniority}
                  />
                  <Field
                    label="Department"
                    name="department"
                    value={job?.department}
                  />
                  <Field
                    label="Minimum experience (years)"
                    name="experienceMin"
                    value={job?.experience?.min}
                    type="number"
                    min={0}
                    max={60}
                  />
                  <Field
                    label="Maximum experience (years)"
                    name="experienceMax"
                    value={job?.experience?.max}
                    type="number"
                    min={0}
                    max={60}
                  />
                  <LocationFields locations={job?.locations || []} />
                  <details className="raw-detail field-full">
                    <summary>Inspect raw source data · read-only</summary>
                    <pre className="json-preview">
                      {JSON.stringify(job?.raw ?? {}, null, 2)}
                    </pre>
                  </details>
                </>
              )}
              {editor.kind !== "job" && (
                <label className="check-field field-full">
                  <input
                    type="checkbox"
                    name="isActive"
                    defaultChecked={c?.isActive ?? true}
                  />
                  <span>
                    <strong>Active in operations</strong>
                    <small>
                      Inactive records stay in history and can be reactivated.
                    </small>
                  </span>
                </label>
              )}
              <label className="check-field field-full confirmation">
                <input type="checkbox" required />
                <span>
                  I have reviewed these changes and confirm they should be
                  saved.
                </span>
              </label>
            </fieldset>
            {error && (
              <p className="notice error" role="alert">
                {error}
              </p>
            )}
          </div>
          <footer className="modal-actions">
            <span className="subtle">
              <Icon name="shield" /> Audited change
            </span>
            <button
              className="button"
              type="button"
              disabled={saving}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="button primary"
              disabled={
                saving || (editor.kind === "source" && !companies.length)
              }
            >
              {saving ? "Saving…" : "Confirm & save"}
            </button>
          </footer>
        </form>
      )}
    </Dialog>
  );
}
function LocationFields({
  locations,
}: {
  locations: NonNullable<Job["locations"]>;
}) {
  const [entries, setEntries] = useState(() =>
    locations.map((location, i) => ({ ...location, key: i })),
  );
  const nextKey = useRef(locations.length);
  return (
    <section className="location-fields field-full">
      <div className="location-heading">
        <strong>Job locations</strong>
        <button
          type="button"
          className="text-button"
          disabled={entries.length >= 20}
          onClick={() => {
            const key = nextKey.current++;
            setEntries((previous) => [
              ...previous,
              { key, city: "", state: "", country: "India" },
            ]);
          }}
        >
          ＋ Add location
        </button>
      </div>
      {entries.length ? (
        entries.map((entry, i) => (
          <div className="location-row" key={entry.key}>
            <Field
              label={`City ${i + 1}`}
              name="locationCity"
              value={entry.city}
              maxLength={120}
            />
            <Field
              label={`State ${i + 1}`}
              name="locationState"
              value={entry.state}
              maxLength={120}
            />
            <Field
              label={`Country ${i + 1}`}
              name="locationCountry"
              value={entry.country}
              maxLength={120}
            />
            <button
              type="button"
              className="icon-button"
              aria-label={`Remove location ${i + 1}`}
              onClick={() =>
                setEntries((previous) =>
                  previous.filter((item) => item.key !== entry.key),
                )
              }
            >
              <Icon name="close" />
            </button>
          </div>
        ))
      ) : (
        <p className="subtle">
          No specific locations recorded. Add a city, state, or country if the
          official posting provides one.
        </p>
      )}
    </section>
  );
}
function Field({
  label: text,
  name,
  value,
  hint,
  ...props
}: {
  label: string;
  name: string;
  value?: string | number;
  hint?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "name">) {
  return (
    <label className="field">
      <span>
        {text}
        {props.required && <span className="required-marker"> *</span>}
      </span>
      <input name={name} defaultValue={value ?? ""} {...props} />
      {hint && <small>{hint}</small>}
    </label>
  );
}
function Select({
  label: text,
  name,
  value,
  options,
  required,
}: {
  label: string;
  name: string;
  value: string;
  options: string[][];
  required?: boolean;
}) {
  return (
    <label className="field">
      <span>
        {text}
        {required && <span className="required-marker"> *</span>}
      </span>
      <select name={name} defaultValue={value} required={required}>
        {options.map(([v, t]) => (
          <option key={v} value={v}>
            {t}
          </option>
        ))}
      </select>
    </label>
  );
}
