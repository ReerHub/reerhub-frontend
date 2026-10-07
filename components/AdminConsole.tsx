"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  adminLogout,
  adminSession,
  getAdmin,
  writeAdmin,
  type AdminUser,
} from "@/lib/admin";

type Tab =
  | "overview"
  | "companies"
  | "sources"
  | "jobs"
  | "users"
  | "subscriptions"
  | "audit";
type Page<T> = {
  data: T[];
  pagination?: { total: number; page: number; totalPages: number };
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
type Company = {
  _id: string;
  name: string;
  slug: string;
  website: string;
  careersUrl: string;
  industry?: string;
  companyType?: string;
  isActive: boolean;
  country?: string;
};
type Source = {
  _id: string;
  name: string;
  type: string;
  careersUrl: string;
  isActive: boolean;
  companyId?: { name: string; slug: string };
  lastSuccessfulSyncAt?: string;
  isStale: boolean;
  latestRun?: { status: string; startedAt: string; errors?: string[] };
};
type Job = {
  _id: string;
  title: string;
  status: string;
  techTrack?: string;
  techRole?: string;
  remoteType?: string;
  seniority?: string;
  companyId?: { name: string };
  sourceId?: { name: string };
  postedAt?: string;
  locations?: { city?: string }[];
  raw?: unknown;
};
type SyncLog = {
  _id: string;
  status: string;
  startedAt: string;
  errors?: string[];
  companyId?: { name: string };
  sourceId?: { name: string };
};
type Audit = {
  _id: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  adminId?: { name: string; email: string };
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
  plan: string;
  status: string;
  trialEndsAt?: string;
  currentPeriodEndsAt?: string;
  accessEndsAt?: string;
  cancelAtPeriodEnd: boolean;
  userId?: { name: string; email: string };
};
const date = (value?: string) =>
  value
    ? new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "—";
const statusClass = (status?: string) =>
  status === "success" || status === "active" || status === "trialing"
    ? "good"
    : status === "failed" || status === "expired" || status === "closed"
      ? "bad"
      : "warn";

function Status({ value }: { value?: string }) {
  return (
    <span className={`badge ${statusClass(value)}`}>
      {value?.replaceAll("_", " ") || "unknown"}
    </span>
  );
}
function Dialog({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <h2>{title}</h2>
          <button
            className="button"
            aria-label="Close dialog"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

export default function AdminConsole() {
  const router = useRouter();
  const [me, setMe] = useState<AdminUser | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [overview, setOverview] = useState<Overview | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [audit, setAudit] = useState<Audit[]>([]);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState<null | {
    kind: "company" | "source" | "job";
    record?: Company | Source | Job;
  }>(null);
  const [notice, setNotice] = useState("");
  const load = useCallback(async (target: Tab, q = "") => {
    setLoading(true);
    setError("");
    try {
      if (target === "overview")
        setOverview(await getAdmin<Overview>("/admin/overview"));
      if (target === "companies")
        setCompanies(
          (
            await getAdmin<Page<Company>>(
              `/admin/companies?limit=100&q=${encodeURIComponent(q)}`,
            )
          ).data,
        );
      if (target === "sources")
        setSources((await getAdmin<{ data: Source[] }>("/admin/sources")).data);
      if (target === "jobs")
        setJobs(
          (
            await getAdmin<Page<Job>>(
              `/admin/jobs?limit=50&q=${encodeURIComponent(q)}`,
            )
          ).data,
        );
      if (target === "users")
        setUsers(
          (
            await getAdmin<Page<User>>(
              `/admin/users?limit=50&q=${encodeURIComponent(q)}`,
            )
          ).data,
        );
      if (target === "subscriptions")
        setSubscriptions(
          (await getAdmin<Page<Subscription>>("/admin/subscriptions?limit=50"))
            .data,
        );
      if (target === "audit")
        setAudit(
          (await getAdmin<Page<Audit>>("/admin/audit-logs?limit=50")).data,
        );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "This view could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    adminSession()
      .then(setMe)
      .catch(() => {
        router.replace("/auth");
      })
      .finally(() => setLoading(false));
  }, [router]);
  useEffect(() => {
    if (me) void Promise.resolve().then(() => load(tab));
  }, [me, tab, load]);
  const title = useMemo(
    () =>
      ({
        overview: "Operations overview",
        companies: "Companies",
        sources: "Job sources",
        jobs: "Job quality",
        users: "Users",
        subscriptions: "Subscriptions",
        audit: "Audit trail",
      })[tab],
    [tab],
  );
  async function signOut() {
    await adminLogout().catch(() => null);
    router.replace("/auth");
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const kind = modal?.kind;
    if (!kind) return;
    const get = (key: string) => String(form.get(key) || "").trim();
    const checked = (key: string) => form.get(key) === "on";
    let path = "";
    let method: "POST" | "PATCH" = "POST";
    let body: Record<string, unknown> = {};
    if (kind === "company") {
      const current = modal.record as Company | undefined;
      path = current ? `/admin/companies/${current._id}` : "/admin/companies";
      method = current ? "PATCH" : "POST";
      body = {
        name: get("name"),
        slug: get("slug"),
        website: get("website"),
        careersUrl: get("careersUrl"),
        industry: get("industry") || undefined,
        companyType: get("companyType") || undefined,
        country: get("country") || undefined,
        isActive: checked("isActive"),
      };
    }
    if (kind === "source") {
      const current = modal.record as Source | undefined;
      path = current ? `/admin/sources/${current._id}` : "/admin/sources";
      method = current ? "PATCH" : "POST";
      body = {
        companyId: get("companyId"),
        name: get("name"),
        type: get("type"),
        careersUrl: get("careersUrl"),
        isActive: checked("isActive"),
      };
    }
    if (kind === "job") {
      const current = modal.record as Job;
      path = `/admin/jobs/${current._id}`;
      method = "PATCH";
      body = {
        status: get("status"),
        techTrack: get("techTrack") || undefined,
        techRole: get("techRole") || undefined,
        remoteType: get("remoteType"),
        seniority: get("seniority") || undefined,
      };
    }
    try {
      await writeAdmin(path, method, body);
      setModal(null);
      setNotice("Changes saved and added to the audit trail.");
      await load(tab, query);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save changes.");
    }
  }
  async function runSync(source: Source) {
    if (
      !confirm(
        `Sync ${source.name} now? This fetches the official source and may take a moment.`,
      )
    )
      return;
    try {
      setNotice(`Syncing ${source.name}…`);
      await writeAdmin(`/admin/sources/${source._id}/sync`, "POST");
      setNotice(`${source.name} completed. Refreshing source health.`);
      await load("sources");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start the sync.");
    }
  }
  const nav: [Tab, string, string][] = [
    ["overview", "Overview", "◫"],
    ["companies", "Companies", "◉"],
    ["sources", "Sources", "↻"],
    ["jobs", "Jobs", "⌕"],
    ["users", "Users", "◌"],
    ["subscriptions", "Subscriptions", "₹"],
    ["audit", "Audit trail", "◷"],
  ];
  if (!me)
    return (
      <main
        style={{ minHeight: "100dvh", display: "grid", placeItems: "center" }}
      >
        Checking access…
      </main>
    );
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">R</span>ReerHub Admin
        </div>
        <nav className="nav" aria-label="Admin navigation">
          {nav.map(([key, label, icon]) => (
            <button
              key={key}
              aria-current={tab === key ? "page" : undefined}
              onClick={() => {
                setTab(key);
                setQuery("");
                setNotice("");
              }}
            >
              <span className="nav-icon" aria-hidden>
                {icon}
              </span>
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-foot">
          <strong style={{ color: "white", display: "block", marginBottom: 3 }}>
            {me.name}
          </strong>
          {me.email}
          <button
            onClick={signOut}
            style={{
              display: "block",
              marginTop: 12,
              padding: 0,
              border: 0,
              background: "none",
              color: "#a9c5ff",
              fontWeight: 700,
            }}
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">ReerHub operations</p>
            <h1 className="ops-title">{title}</h1>
          </div>
          <div className="user">
            <div style={{ textAlign: "right" }}>
              <strong style={{ display: "block", fontSize: 13 }}>
                {me.name}
              </strong>
              <span className="subtle">Administrator</span>
            </div>
            <div className="avatar">{me.name.slice(0, 1).toUpperCase()}</div>
          </div>
        </header>
        {notice && (
          <div className="notice" role="status">
            {notice}
          </div>
        )}
        {error && (
          <div className="notice error" role="alert">
            {error}{" "}
            <button
              className="button"
              style={{ marginLeft: 10 }}
              onClick={() => load(tab, query)}
            >
              Retry
            </button>
          </div>
        )}
        {tab === "overview" && (
          <OverviewView data={overview} loading={loading} />
        )}{" "}
        {tab !== "overview" && (
          <section className="panel">
            <div className="panel-head">
              <h2>{title}</h2>
              {["companies", "sources"].includes(tab) && (
                <button
                  className="button primary"
                  onClick={() =>
                    setModal({
                      kind: tab === "companies" ? "company" : "source",
                    })
                  }
                >
                  Add {tab === "companies" ? "company" : "source"}
                </button>
              )}
            </div>
            <div className="panel-body">
              {["companies", "jobs", "users"].includes(tab) && (
                <form
                  className="toolbar"
                  onSubmit={(e) => {
                    e.preventDefault();
                    load(tab, query);
                  }}
                >
                  <input
                    className="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={
                      tab === "jobs"
                        ? "Search job title, skill or department"
                        : "Search by name or email"
                    }
                  />
                  <button className="button">Search</button>
                </form>
              )}
              {loading ? (
                <div className="empty">
                  Loading the latest operational data…
                </div>
              ) : (
                <Tables
                  tab={tab}
                  companies={companies}
                  sources={sources}
                  jobs={jobs}
                  users={users}
                  subscriptions={subscriptions}
                  audit={audit}
                  setModal={setModal}
                  runSync={runSync}
                />
              )}
            </div>
          </section>
        )}
        {modal && (
          <Editor
            modal={modal}
            companies={companies}
            onClose={() => setModal(null)}
            onSubmit={submit}
          />
        )}
      </main>
    </div>
  );
}

function OverviewView({
  data,
  loading,
}: {
  data: Overview | null;
  loading: boolean;
}) {
  if (loading || !data)
    return <div className="empty">Loading the operations snapshot…</div>;
  const metrics = [
    [
      "Active jobs",
      data.counts.activeJobs,
      "Official openings currently visible",
    ],
    [
      "Active companies",
      data.counts.activeCompanies,
      `${data.counts.companies} companies in the directory`,
    ],
    ["Members", data.counts.users, "Registered ReerHub accounts"],
    [
      "Source attention",
      data.sourceHealth.staleSources,
      "Sources stale for over 30 hours",
    ],
  ];
  return (
    <div className="grid" style={{ gap: 18 }}>
      <section className="grid metrics">
        {metrics.map(([label, value, copy]) => (
          <article className="metric" key={label as string}>
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{copy}</small>
          </article>
        ))}
      </section>
      <section className="grid two-col">
        <div className="panel">
          <div className="panel-head">
            <h2>Source exceptions</h2>
            <span className="badge neutral">Latest runs</span>
          </div>
          <div className="panel-body">
            {data.failedSyncs.length ? (
              data.failedSyncs.map((run) => (
                <div className="status-row" key={run._id}>
                  <div>
                    <strong>{run.companyId?.name || "Unknown company"}</strong>
                    <div className="subtle">
                      {run.sourceId?.name || "Source"} · {date(run.startedAt)}
                    </div>
                    {run.errors?.[0] && (
                      <div
                        className="subtle"
                        style={{ color: "#a72137", marginTop: 3 }}
                      >
                        {run.errors[0]}
                      </div>
                    )}
                  </div>
                  <Status value={run.status} />
                </div>
              ))
            ) : (
              <div className="empty">
                No failed or partial syncs are waiting for review.
              </div>
            )}
          </div>
        </div>
        <div className="panel">
          <div className="panel-head">
            <h2>Recent operator activity</h2>
          </div>
          <div className="panel-body">
            {data.recentAudit.length ? (
              data.recentAudit.map((item) => (
                <div className="status-row" key={item._id}>
                  <div>
                    <strong>{item.action.replaceAll(".", " · ")}</strong>
                    <div className="subtle">
                      {item.adminId?.name || "Administrator"} ·{" "}
                      {date(item.createdAt)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty">
                Changes made here will appear in this audit trail.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

type ModalState = null | {
  kind: "company" | "source" | "job";
  record?: Company | Source | Job;
};
function Tables({
  tab,
  companies,
  sources,
  jobs,
  users,
  subscriptions,
  audit,
  setModal,
  runSync,
}: {
  tab: Tab;
  companies: Company[];
  sources: Source[];
  jobs: Job[];
  users: User[];
  subscriptions: Subscription[];
  audit: Audit[];
  setModal: React.Dispatch<React.SetStateAction<ModalState>>;
  runSync: (source: Source) => void;
}) {
  if (tab === "companies")
    return (
      <Table
        headers={["Company", "Careers source", "Status", ""]}
        rows={companies.map((c) => (
          <>
            <td>
              <strong>{c.name}</strong>
              <span className="subtle">{c.industry || c.slug}</span>
            </td>
            <td>
              <a href={c.careersUrl} target="_blank" rel="noreferrer">
                Official careers ↗
              </a>
            </td>
            <td>
              <Status value={c.isActive ? "active" : "closed"} />
            </td>
            <td>
              <button
                className="button"
                onClick={() => setModal({ kind: "company", record: c })}
              >
                Edit
              </button>
            </td>
          </>
        ))}
      />
    );
  if (tab === "sources")
    return (
      <Table
        headers={["Source", "Company", "Health", "Last successful sync", ""]}
        rows={sources.map((s) => (
          <>
            <td>
              <strong>{s.name}</strong>
              <span className="subtle">{s.type}</span>
            </td>
            <td>{s.companyId?.name || "—"}</td>
            <td>
              {s.isStale ? (
                <span className="badge warn">Needs review</span>
              ) : (
                <Status value={s.latestRun?.status || "active"} />
              )}
            </td>
            <td>{date(s.lastSuccessfulSyncAt)}</td>
            <td style={{ whiteSpace: "nowrap" }}>
              <button className="button" onClick={() => runSync(s)}>
                Sync
              </button>{" "}
              <button
                className="button"
                onClick={() => setModal({ kind: "source", record: s })}
              >
                Edit
              </button>
            </td>
          </>
        ))}
      />
    );
  if (tab === "jobs")
    return (
      <Table
        headers={["Role", "Company", "Track", "Status", "Seen", ""]}
        rows={jobs.map((j) => (
          <>
            <td>
              <strong>{j.title}</strong>
              <span className="subtle">
                {j.techRole || "Unclassified role"}
              </span>
            </td>
            <td>{j.companyId?.name || "—"}</td>
            <td>{j.techTrack || "—"}</td>
            <td>
              <Status value={j.status} />
            </td>
            <td>{date(j.postedAt)}</td>
            <td>
              <button
                className="button"
                onClick={() => setModal({ kind: "job", record: j })}
              >
                Review
              </button>
            </td>
          </>
        ))}
      />
    );
  if (tab === "users")
    return (
      <Table
        headers={["Member", "Role", "Profile", "Joined"]}
        rows={users.map((u) => (
          <>
            <td>
              <strong>{u.name}</strong>
              <span className="subtle">{u.email}</span>
            </td>
            <td>
              <Status value={u.role} />
            </td>
            <td>
              {u.profile?.currentRole || "Not completed"}
              <span className="subtle">{u.profile?.techTrack || ""}</span>
            </td>
            <td>{date(u.createdAt)}</td>
          </>
        ))}
      />
    );
  if (tab === "subscriptions")
    return (
      <Table
        headers={["Member", "Plan", "Status", "Access ends", "Renewal"]}
        rows={subscriptions.map((s) => (
          <>
            <td>
              <strong>{s.userId?.name || "Unknown user"}</strong>
              <span className="subtle">{s.userId?.email || ""}</span>
            </td>
            <td>{s.plan.replace("pro-", "")}</td>
            <td>
              <Status value={s.status} />
            </td>
            <td>
              {date(s.accessEndsAt || s.currentPeriodEndsAt || s.trialEndsAt)}
            </td>
            <td>
              {s.cancelAtPeriodEnd
                ? "Cancels at period end"
                : "Renews automatically"}
            </td>
          </>
        ))}
      />
    );
  return (
    <Table
      headers={["Action", "Target", "Administrator", "When"]}
      rows={audit.map((a) => (
        <>
          <td>
            <strong>{a.action.replaceAll(".", " · ")}</strong>
            <span className="subtle">{a.entityType}</span>
          </td>
          <td className="subtle">{a.entityId}</td>
          <td>
            {a.adminId?.name || "—"}
            <span className="subtle">{a.adminId?.email || ""}</span>
          </td>
          <td>{date(a.createdAt)}</td>
        </>
      ))}
    />
  );
}
function Table({
  headers,
  rows,
}: {
  headers: string[];
  rows: React.ReactNode[];
}) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row, i) => <tr key={i}>{row}</tr>)
          ) : (
            <tr>
              <td colSpan={headers.length}>
                <div className="empty">Nothing matches this view yet.</div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
function Editor({
  modal,
  companies,
  onClose,
  onSubmit,
}: {
  modal: Exclude<ModalState, null>;
  companies: Company[];
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const r = modal.record as Partial<Company & Source & Job> | undefined;
  const source = modal.kind === "source";
  const job = modal.kind === "job";
  return (
    <Dialog
      title={
        job
          ? `Review ${r?.title || "job"}`
          : r
            ? `Edit ${modal.kind}`
            : `Add ${modal.kind}`
      }
      onClose={onClose}
    >
      <form onSubmit={onSubmit}>
        <div className="form-grid">
          {modal.kind === "company" && (
            <>
              <Field
                label="Company name"
                name="name"
                required
                value={r?.name}
              />
              <Field label="Slug" name="slug" required value={r?.slug} />
              <Field
                label="Website"
                name="website"
                required
                value={r?.website}
              />
              <Field
                label="Careers URL"
                name="careersUrl"
                required
                value={r?.careersUrl}
              />
              <Field label="Industry" name="industry" value={r?.industry} />
              <Field
                label="Company type"
                name="companyType"
                value={r?.companyType}
              />
              <Field
                label="Country"
                name="country"
                value={r?.country || "India"}
              />
            </>
          )}
          {source && (
            <>
              <label className="field">
                <span>Company</span>
                <select
                  name="companyId"
                  required
                  defaultValue={(r?.companyId as { _id?: string })?._id || ""}
                >
                  <option value="">Select company</option>
                  {companies.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <Field label="Source name" name="name" required value={r?.name} />
              <label className="field">
                <span>Adapter</span>
                <select name="type" defaultValue={r?.type || "greenhouse"}>
                  {[
                    "greenhouse",
                    "ashby",
                    "lever",
                    "smartrecruiters",
                    "custom",
                  ].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
              <Field
                label="Careers URL"
                name="careersUrl"
                required
                value={r?.careersUrl}
              />
            </>
          )}
          {job && (
            <>
              <label className="field">
                <span>Status</span>
                <select name="status" defaultValue={r?.status}>
                  <option value="active">active</option>
                  <option value="closed">closed</option>
                </select>
              </label>
              <Field label="Tech track" name="techTrack" value={r?.techTrack} />
              <Field label="Tech role" name="techRole" value={r?.techRole} />
              <label className="field">
                <span>Work mode</span>
                <select
                  name="remoteType"
                  defaultValue={r?.remoteType || "unknown"}
                >
                  {["unknown", "onsite", "hybrid", "remote"].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
              <Field label="Seniority" name="seniority" value={r?.seniority} />
            </>
          )}{" "}
          {!job && (
            <label
              className="field full"
              style={{
                display: "flex",
                gridTemplateColumns: "auto 1fr",
                alignItems: "center",
                gap: 9,
              }}
            >
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={r?.isActive ?? true}
                style={{ width: 18, height: 18 }}
              />
              <span>Active and included in operations</span>
            </label>
          )}
        </div>
        <div className="modal-actions">
          <button type="button" className="button" onClick={onClose}>
            Cancel
          </button>
          <button className="button primary">Save changes</button>
        </div>
      </form>
    </Dialog>
  );
}
function Field({
  label,
  name,
  value,
  required,
}: {
  label: string;
  name: string;
  value?: string;
  required?: boolean;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input name={name} required={required} defaultValue={value || ""} />
    </label>
  );
}
