"use client";
import ReviewPanel from "./ReviewPanel";
import { useConfirm } from "./ConfirmationProvider";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowLeft,
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  FileText,
  History,
  LayoutTemplate,
  Plus,
  Save,
  Sparkles,
  Trash2,
  Undo2,
  X,
  LogOut,
} from "lucide-react";
import Brand from "./Brand";
import {
  api as requestResume,
  ApiError,
  json,
  type User,
} from "@/lib/resume/api";
import {
  blankDocument,
  exampleDocument,
  GUEST_KEY,
  newEntry,
  resumeFacts,
  type Resume,
  type ResumeDocument,
  type Section,
  type Entry,
} from "@/lib/resume/document";

import { recordMetric } from "@/lib/resume/metrics";
import { parseDraft } from "@/lib/resume/validation";
const PdfWorkspace = dynamic(() => import("./PdfWorkspace"), {
  ssr: false,
  loading: () => (
    <div className="preview-pane loading-preview">
      Preparing your workspace…
    </div>
  ),
});
type Draft = { title: string; document: ResumeDocument; example: boolean };
type Usage = {
  provider: { name: string; model: string; privacyUrl: string } | null;
  enabled: boolean;
  eligible: boolean;
  used: number;
  remaining: number;
  limit: number;
  resetsAt: string;
};
type Revision = { id: string; name: string; createdAt: string };
export default function Editor({
  jobsUrl,
  user,
  onSignOut,
}: {
  jobsUrl: string;
  user: User | null;
  onSignOut: () => Promise<void>;
}) {
  const api = useCallback(
    <T,>(path: string, init?: RequestInit) =>
      requestResume<T>(path, init, user?.id),
    [user?.id],
  );
  const [initialUser] = useState(user);
  const ask = useConfirm();
  const reviewFocus = useRef(false);
  const [draft, setDraft] = useState<Draft>({
    title: "Untitled resume",
    document: blankDocument(),
    example: false,
  });
  const [ready, setReady] = useState(false);
  const [sessionState, setSessionState] = useState(
    user?.name || "Guest workspace",
  );
  const [active, setActive] = useState("contact");
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [panel, setPanel] = useState<
    "content" | "design" | "versions" | "ai" | "review"
  >("content");
  const [cloud, setCloud] = useState<{ id: string; version: number } | null>(
    null,
  );
  const [status, setStatus] = useState("Saved on this device");
  const [error, setError] = useState("");
  const [conflict, setConflict] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [revisionName, setRevisionName] = useState("");
  const [usage, setUsage] = useState<Usage | null>(null);
  const [aiAction, setAiAction] = useState<"rewrite" | "summary" | "tailor">(
    "rewrite",
  );
  const [aiText, setAiText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [consent, setConsent] = useState(false);
  const [suggestion, setSuggestion] = useState<{
    suggestion: string;
    warnings: string[];
  } | null>(null);
  const [undo, setUndo] = useState<Draft | null>(null);
  const [aiTarget, setAiTarget] = useState("");
  const saveLock = useRef(false);
  const epoch = useRef(0);
  const latest = useRef(draft);
  const owner = useRef<string | null>(null);
  const currentCloud = useRef(cloud);
  const touched = useRef(false);
  const guestStorageEnabled = useRef(true);
  const storageBlocked = useRef(false);
  const leaveAllowed = useRef(false);
  useEffect(() => {
    latest.current = draft;
    currentCloud.current = cloud;
  }, [draft, cloud]);
  const edit = useCallback((change: (d: Draft) => Draft) => {
    touched.current = true;
    if (!currentCloud.current) guestStorageEnabled.current = true;
    setDraft((d) => change(d));
    setDirty(true);
    setStatus("Unsaved changes");
  }, []);
  const loadCloud = useCallback(
    async (id: string, preserveEdits = false) => {
      const ticket = epoch.current;
      const row = await api<Resume>(`/resumes/${id}`);
      if (ticket !== epoch.current) return;
      if (preserveEdits && touched.current) {
        setError(
          "Your edits were kept. Open the cloud resume from My resumes after saving or downloading them.",
        );
        return;
      }
      guestStorageEnabled.current = false;
      setDraft({
        title: row.title,
        document: row.document,
        example: row.document.example,
      });
      setCloud({ id: row.id, version: row.version });
      setConflict(false);
      setError("");
      setDirty(false);
      touched.current = false;
      setStatus("Saved to your account");
    },
    [api],
  );
  useEffect(() => {
    const ticket = epoch.current;
    let cancelled = false;
    Promise.resolve().then(() => {
      try {
        const saved = localStorage.getItem(GUEST_KEY);
        if (saved) {
          const parsed = parseDraft(JSON.parse(saved));
          if (parsed) setDraft(parsed);
          else {
            storageBlocked.current = true;
            setError(
              "Your device draft could not be read. It has not been overwritten. Clear it to start again.",
            );
          }
        }
        const template = new URL(window.location.href).searchParams.get(
          "template",
        );
        if (["classic", "modern", "technical"].includes(template || ""))
          setDraft((d) => ({
            ...d,
            document: {
              ...d.document,
              presentation: {
                ...d.document.presentation,
                template:
                  template as ResumeDocument["presentation"]["template"],
              },
            },
          }));
      } catch {
        storageBlocked.current = true;
        setError(
          "Device storage is unavailable. Keep this tab open and download your work.",
        );
      }
      setReady(true);
      recordMetric("builder_started");
    });
    async function session() {
      try {
        const account = initialUser;
        if (cancelled) return;
        owner.current = account?.id || null;
        setSessionState(account ? account.name : "Guest workspace");
        const id = new URL(window.location.href).searchParams.get("id");
        if (account && id) {
          if (!touched.current) await loadCloud(id, true);
          else
            setError(
              "Your local edits were kept. Use Reload cloud copy to open the saved resume.",
            );
        }
        if (account)
          api<Usage>("/resumes/usage")
            .then((v) => {
              if (!cancelled) setUsage(v);
            })
            .catch(() => {});
      } catch (e) {
        if (!cancelled) {
          if (e instanceof ApiError && e.status === 404) {
            window.history.replaceState(null, "", "/resume/editor");
          }
          setError(
            e instanceof ApiError && e.status === 404
              ? "This resume is unavailable for this account. Open My resumes or start a new resume."
              : e instanceof Error
                ? e.message
                : "Could not load your resume.",
          );
        }
      }
    }
    void session();
    return () => {
      cancelled = true;
      epoch.current = ticket + 1;
    };
  }, [loadCloud, initialUser, api]);
  useEffect(() => {
    if (
      !ready ||
      cloud ||
      !guestStorageEnabled.current ||
      storageBlocked.current
    )
      return;
    Promise.resolve().then(() => {
      try {
        localStorage.setItem(GUEST_KEY, JSON.stringify(draft));
        setDirty(false);
        setStatus("Saved on this device");
      } catch {
        setStatus("Device save failed — download your work");
      }
    });
  }, [draft, ready, cloud, dirty]);
  useEffect(() => {
    if (!dirty) return;
    function warn(event: BeforeUnloadEvent) {
      if (!leaveAllowed.current) event.preventDefault();
    }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  const save = useCallback(
    async (asNew = false) => {
      if (!owner.current || saveLock.current) return;
      saveLock.current = true;
      setBusy(true);
      setStatus("Saving…");
      const snapshot = latest.current;
      const wasGuest = guestStorageEnabled.current;
      const ticket = epoch.current;
      const existing = asNew ? null : currentCloud.current;
      try {
        const row = await api<Resume>(
          existing ? `/resumes/${existing.id}` : "/resumes",
          json(existing ? "PUT" : "POST", {
            title: snapshot.title.trim() || "Untitled resume",
            document: { ...snapshot.document, example: snapshot.example },
            ...(existing ? { version: existing.version } : {}),
          }),
        );
        if (ticket !== epoch.current) return;
        recordMetric("resume_saved");
        guestStorageEnabled.current = false;
        setCloud({ id: row.id, version: row.version });
        if (!existing && wasGuest && !storageBlocked.current) {
          try {
            localStorage.removeItem(GUEST_KEY);
          } catch {}
        }
        window.history.replaceState(null, "", `/resume/editor?id=${row.id}`);
        setConflict(false);
        setError("");
        if (latest.current === snapshot) {
          setDirty(false);
          touched.current = false;
          setStatus("Saved to your account");
        } else setStatus("Unsaved changes");
      } catch (e) {
        if (ticket !== epoch.current) return;
        if (e instanceof ApiError && e.status === 409) {
          setConflict(true);
          setStatus("Cloud conflict — your edits are safe in this tab");
        } else
          setStatus(
            navigator.onLine
              ? "Save failed — your edits are in this tab"
              : "Offline — your edits are in this tab",
          );
        setError(e instanceof Error ? e.message : "Save failed");
      } finally {
        saveLock.current = false;
        setBusy(false);
      }
    },
    [api],
  );
  useEffect(() => {
    if (!ready || !cloud || !dirty || conflict || !user) return;
    const timer = setTimeout(() => void save(), 1200);
    return () => clearTimeout(timer);
  }, [draft, cloud, dirty, conflict, ready, user, save]);
  function updateDoc(change: (d: ResumeDocument) => ResumeDocument) {
    edit((d) => ({ ...d, document: change(d.document) }));
  }
  function updateSection(id: string, change: (s: Section) => Section) {
    updateDoc((d) => ({
      ...d,
      sections: d.sections.map((s) => (s.id === id ? change(s) : s)),
    }));
  }
  function updateEntry(sectionId: string, id: string, change: Partial<Entry>) {
    updateSection(sectionId, (s) => ({
      ...s,
      items: s.items.map((i) => (i.id === id ? { ...i, ...change } : i)),
    }));
  }
  function move(id: string, direction: number) {
    updateDoc((d) => {
      const sections = [...d.sections];
      const index = sections.findIndex((s) => s.id === id);
      const destination = index + direction;
      if (destination < 0 || destination >= sections.length) return d;
      [sections[index], sections[destination]] = [
        sections[destination],
        sections[index],
      ];
      return { ...d, sections };
    });
  }
  async function versions() {
    setPanel("versions");
    if (!cloud) return;
    const ticket = epoch.current;
    try {
      const rows = await api<Revision[]>(`/resumes/${cloud.id}/revisions`);
      if (ticket === epoch.current) setRevisions(rows);
    } catch (e) {
      if (ticket === epoch.current) setError((e as Error).message);
    }
  }
  async function snapshot() {
    if (!cloud || dirty || !revisionName.trim()) return;
    const ticket = epoch.current;
    setBusy(true);
    try {
      const row = await api<Resume>(
        `/resumes/${cloud.id}/revisions`,
        json("POST", { name: revisionName.trim(), version: cloud.version }),
      );
      if (ticket !== epoch.current) return;
      setCloud({ id: row.id, version: row.version });
      setRevisionName("");
      const rows = await api<Revision[]>(`/resumes/${cloud.id}/revisions`);
      if (ticket !== epoch.current) return;
      setRevisions(rows);
      setStatus("Version saved");
    } catch (e) {
      if (ticket === epoch.current) setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function restore(id: string) {
    if (
      !cloud ||
      busy ||
      !(await ask(
        "Restore this version? Your current cloud version will be kept as “Before restoration”.",
      ))
    )
      return;
    const ticket = epoch.current;
    const original = latest.current;
    setBusy(true);
    try {
      const row = await api<Resume>(
        `/resumes/${cloud.id}/revisions/${id}/restore`,
        json("POST", { version: cloud.version }),
      );
      if (ticket !== epoch.current) return;
      setCloud({ id: row.id, version: row.version });
      if (latest.current !== original) {
        setConflict(true);
        setStatus(
          "Cloud version restored. Your newer local edits are still here.",
        );
        return;
      }
      setDraft({
        title: row.title,
        document: row.document,
        example: row.document.example,
      });
      setDirty(false);
      setStatus("Version restored");
      const rows = await api<Revision[]>(`/resumes/${cloud.id}/revisions`);
      if (ticket === epoch.current) setRevisions(rows);
    } catch (e) {
      if (ticket === epoch.current) setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function runAi() {
    const ticket = epoch.current;
    setBusy(true);
    setSuggestion(null);
    try {
      const output = await api<{ suggestion: string; warnings: string[] }>(
        "/resumes/assist",
        json("POST", {
          action: aiAction,
          text: aiText,
          jobDescription,
          consent,
        }),
      );
      if (ticket !== epoch.current) return;
      setSuggestion(output);
      recordMetric("ai_suggestion_received");
      const nextUsage = await api<Usage>("/resumes/usage");
      if (ticket === epoch.current) setUsage(nextUsage);
    } catch (e) {
      if (ticket === epoch.current) setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function applyBullet() {
    if (!suggestion || !aiTarget) return;
    const [sectionId, itemId, index] = JSON.parse(aiTarget) as [
      string,
      string,
      number,
    ];
    const original = draft.document.sections
      .find((s) => s.id === sectionId)
      ?.items.find((i) => i.id === itemId)?.bullets[index];
    if (original !== aiText) {
      setError(
        "The target bullet changed. Select its current text and request a new suggestion.",
      );
      return;
    }
    setUndo(draft);
    updateSection(sectionId, (s) => ({
      ...s,
      items: s.items.map((i) =>
        i.id === itemId
          ? {
              ...i,
              bullets: i.bullets.map((b, n) =>
                n === index ? suggestion.suggestion : b,
              ),
            }
          : i,
      ),
    }));
    setSuggestion(null);
  }
  function applySummary() {
    if (!suggestion) return;
    setUndo(draft);
    updateDoc((d) => ({
      ...d,
      sections: d.sections.map((s) =>
        s.type === "summary" ? { ...s, text: suggestion.suggestion } : s,
      ),
    }));
    setSuggestion(null);
    setStatus("Summary applied — Undo is available");
  }
  async function logout() {
    if (
      dirty &&
      !(await ask(
        "You have unsaved changes. Download or save them before signing out. Sign out anyway?",
      ))
    )
      return;
    setBusy(true);
    try {
      await onSignOut();
      epoch.current++;
      owner.current = null;
      guestStorageEnabled.current = false;
      setCloud(null);
      setDraft({
        title: "Untitled resume",
        document: blankDocument(),
        example: false,
      });
      setDirty(false);
      setSuggestion(null);
      setUndo(null);
      setUsage(null);
      setRevisions([]);
      setSessionState("Guest workspace");
      setStatus("Signed out");
      window.history.replaceState(null, "", "/resume/editor");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    if (!dirty) return;
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as Element)?.closest("a");
      if (
        !anchor ||
        anchor.target === "_blank" ||
        anchor.href === window.location.href ||
        event.metaKey ||
        event.ctrlKey
      )
        return;
      event.preventDefault();
      event.stopPropagation();
      void ask(
        "You have unsaved changes. Leave this page and discard them?",
      ).then((leave) => {
        if (leave) {
          leaveAllowed.current = true;
          setDirty(false);
          window.location.assign(anchor.href);
        }
      });
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [dirty, ask]);
  useEffect(() => {
    if (panel === "content" && reviewFocus.current) {
      reviewFocus.current = false;
      document
        .querySelector<HTMLElement>(
          ".section-fields input, .section-fields textarea, .section-fields button",
        )
        ?.focus();
    }
  }, [active, panel]);
  const selected = draft.document.sections.find((s) => s.id === active);
  return (
    <div className="builder">
      <header className="builder-header">
        <Brand />
        <div className="document-title">
          <input
            aria-label="Resume title"
            value={draft.title}
            maxLength={120}
            onChange={(e) => edit((d) => ({ ...d, title: e.target.value }))}
          />
          <span role="status">{status}</span>
        </div>
        <nav aria-label="Workspace">
          <Link href="/resume/library">My resumes</Link>
          {user ? (
            <button
              className="icon-button"
              aria-label="Sign out"
              disabled={busy}
              onClick={logout}
            >
              <LogOut size={17} />
            </button>
          ) : (
            <a
              className="button outline small"
              href={`${jobsUrl}/login?next=%2Fresume%2Feditor`}
            >
              Sign in
            </a>
          )}
        </nav>
      </header>
      <main id="main-content" className="builder-main">
        <div className="mobile-switch" role="group" aria-label="Workspace view">
          <button aria-pressed={tab === "edit"} onClick={() => setTab("edit")}>
            Edit resume
          </button>
          <button
            aria-pressed={tab === "preview"}
            onClick={() => setTab("preview")}
          >
            Preview & download
          </button>
        </div>
        <div
          className={`editing-pane ${tab === "preview" ? "mobile-hidden" : ""}`}
        >
          <div className="editor-top">
            <Link className="back-link" href="/resume">
              <ArrowLeft size={14} /> Resume Builder
            </Link>
            <span className="account-pill">
              <span className="dot" />
              {sessionState}
            </span>
          </div>
          <label className="mobile-title-label">
            Resume title
            <input
              value={draft.title}
              maxLength={120}
              onChange={(e) => edit((d) => ({ ...d, title: e.target.value }))}
            />
            <small role="status">{status}</small>
          </label>
          <div className="editor-heading">
            <h1>
              Make it yours<span>.</span>
            </h1>
            <p>One section at a time. Your next chapter starts here.</p>
          </div>
          <div className="editor-tabs" role="group" aria-label="Editor tools">
            <button
              aria-pressed={panel === "content"}
              onClick={() => setPanel("content")}
            >
              <FileText size={16} /> Content
            </button>
            <button
              aria-pressed={panel === "design"}
              onClick={() => setPanel("design")}
            >
              <LayoutTemplate size={16} /> Design
            </button>
            <button
              aria-pressed={panel === "review"}
              onClick={() => setPanel("review")}
            >
              <Check size={16} /> Review
            </button>
            <button aria-pressed={panel === "versions"} onClick={versions}>
              <History size={16} /> Versions
            </button>
            <button
              aria-pressed={panel === "ai"}
              onClick={() => setPanel("ai")}
            >
              <Sparkles size={16} /> Write
            </button>
          </div>
          {error && (
            <div className="notice error" role="alert">
              <span>{error}</span>
              <button aria-label="Dismiss message" onClick={() => setError("")}>
                <X size={15} />
              </button>
            </div>
          )}
          {conflict && (
            <div className="notice">
              <p>The cloud copy changed. Your current edits are still here.</p>
              <button
                className="button small outline"
                onClick={async () => {
                  if (
                    await ask("Replace this tab’s edits with the cloud copy?")
                  )
                    void loadCloud(cloud!.id);
                }}
              >
                Reload cloud copy
              </button>
              <button
                className="button small dark"
                onClick={() => void save(true)}
                disabled={busy}
              >
                Save edits as new resume
              </button>
            </div>
          )}
          {!cloud && (
            <div className="device-notice">
              <span>
                <strong>Your draft stays on this device.</strong> On a shared
                computer? Clear it when you finish.
              </span>
              <button
                aria-label="Clear device draft"
                onClick={async () => {
                  if (
                    await ask(
                      "Delete the guest draft from this device? Download it first if you need a copy.",
                    )
                  ) {
                    localStorage.removeItem(GUEST_KEY);
                    storageBlocked.current = false;
                    guestStorageEnabled.current = true;
                    setDraft({
                      title: "Untitled resume",
                      document: blankDocument(),
                      example: false,
                    });
                    setDirty(false);
                  }
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
          {panel === "content" && (
            <>
              <div className="example-picker">
                <span>Need a starting point?</span>
                <select
                  aria-label="Load an illustrative example"
                  value=""
                  onChange={async (e) => {
                    const kind = e.target.value;
                    if (!kind) return;
                    if (
                      await ask(
                        "Replace this draft with an illustrative example?",
                      )
                    ) {
                      edit(() => ({
                        title: "Example resume",
                        document: exampleDocument(
                          kind as "student" | "career-change" | "experienced",
                        ),
                        example: true,
                      }));
                      setCloud(null);
                      guestStorageEnabled.current = true;
                      window.history.replaceState(null, "", "/resume/editor");
                      setActive("contact");
                    }
                  }}
                >
                  <option value="">Try an example</option>
                  <option value="student">Student</option>
                  <option value="career-change">Career changer</option>
                  <option value="experienced">Experienced professional</option>
                </select>
              </div>
              {draft.example && (
                <div className="notice">
                  <p>
                    This is an illustrative example. Replace every sample fact.
                  </p>
                  <button
                    className="text-link"
                    onClick={async () => {
                      if (
                        await ask(
                          "Have you replaced all sample names, employers, qualifications and achievements with your own facts?",
                        )
                      )
                        edit((d) => ({
                          ...d,
                          example: false,
                          document: { ...d.document, example: false },
                        }));
                    }}
                  >
                    I’ve replaced all example facts <Check size={14} />
                  </button>
                </div>
              )}
              <div className="section-list">
                <button
                  className={`section-row ${active === "contact" ? "selected" : ""}`}
                  onClick={() => setActive("contact")}
                >
                  <span className="section-number">01</span>
                  <span>Personal details</span>
                  <ChevronRight size={16} />
                </button>
                {draft.document.sections.map((s, i) => (
                  <div
                    className={`section-row ${active === s.id ? "selected" : ""}`}
                    key={s.id}
                  >
                    <button
                      className="section-select"
                      onClick={() => setActive(s.id)}
                    >
                      <span className="section-number">
                        {String(i + 2).padStart(2, "0")}
                      </span>
                      <span>{s.heading}</span>
                    </button>
                    <div className="section-actions">
                      <button
                        aria-label={`${s.visible ? "Hide" : "Show"} ${s.heading}`}
                        aria-pressed={!s.visible}
                        onClick={() =>
                          updateSection(s.id, (v) => ({
                            ...v,
                            visible: !v.visible,
                          }))
                        }
                      >
                        {s.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>
                      <button
                        aria-label={`Move ${s.heading} up`}
                        disabled={i === 0}
                        onClick={() => move(s.id, -1)}
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        aria-label={`Move ${s.heading} down`}
                        disabled={i === draft.document.sections.length - 1}
                        onClick={() => move(s.id, 1)}
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="section-fields">
                {active === "contact" ? (
                  <>
                    <h2>Let’s start with you.</h2>
                    <p className="muted">
                      Make it easy for someone to get in touch.
                    </p>
                    <div className="field-grid">
                      {Object.entries(draft.document.contact).map(
                        ([key, value]) => (
                          <label key={key}>
                            {
                              (
                                {
                                  name: "Full name",
                                  headline: "Professional headline",
                                  email: "Email",
                                  phone: "Phone",
                                  location: "Location",
                                  website: "Website",
                                  linkedin: "LinkedIn URL",
                                  github: "GitHub URL",
                                } as Record<string, string>
                              )[key]
                            }
                            <input
                              type={
                                ["website", "linkedin", "github"].includes(key)
                                  ? "url"
                                  : key === "email"
                                    ? "email"
                                    : "text"
                              }
                              value={value}
                              maxLength={
                                key === "email"
                                  ? 254
                                  : key === "phone"
                                    ? 60
                                    : key === "name"
                                      ? 120
                                      : [
                                            "website",
                                            "linkedin",
                                            "github",
                                          ].includes(key)
                                        ? 500
                                        : 200
                              }
                              placeholder={
                                key === "name"
                                  ? "Your name"
                                  : key === "headline"
                                    ? "e.g. Software Engineer"
                                    : key === "website"
                                      ? "https://your-website.com"
                                      : ""
                              }
                              onChange={(e) =>
                                updateDoc((d) => ({
                                  ...d,
                                  contact: {
                                    ...d.contact,
                                    [key]: e.target.value,
                                  },
                                }))
                              }
                            />
                          </label>
                        ),
                      )}
                    </div>
                  </>
                ) : (
                  selected && (
                    <>
                      <label>
                        Section heading
                        <input
                          value={selected.heading}
                          maxLength={80}
                          onChange={(e) =>
                            updateSection(selected.id, (s) => ({
                              ...s,
                              heading: e.target.value,
                            }))
                          }
                        />
                      </label>
                      {!selected.visible && (
                        <p className="notice">
                          This section is hidden from your PDF.
                        </p>
                      )}
                      {["summary", "skills"].includes(selected.type) ? (
                        <label>
                          {selected.type === "summary"
                            ? "Your professional summary"
                            : "Your skills"}
                          <textarea
                            rows={selected.type === "summary" ? 6 : 4}
                            maxLength={6000}
                            value={selected.text}
                            placeholder={
                              selected.type === "summary"
                                ? "A few clear sentences about your experience and the work you want to do."
                                : "Group skills by category, or separate them with commas."
                            }
                            onChange={(e) =>
                              updateSection(selected.id, (s) => ({
                                ...s,
                                text: e.target.value,
                              }))
                            }
                          />
                        </label>
                      ) : (
                        <>
                          {selected.items.map((item, index) => (
                            <article className="entry-card" key={item.id}>
                              <div className="entry-heading">
                                <span>
                                  {selected.heading} {index + 1}
                                </span>
                                <button
                                  className="icon-button danger"
                                  aria-label={`Remove entry ${index + 1}`}
                                  onClick={() => {
                                    setUndo(draft);
                                    updateSection(selected.id, (s) => ({
                                      ...s,
                                      items: s.items.filter(
                                        (i) => i.id !== item.id,
                                      ),
                                    }));
                                  }}
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                              <div className="field-grid">
                                {(
                                  [
                                    "title",
                                    "subtitle",
                                    "location",
                                    "start",
                                    "end",
                                    "url",
                                  ] as const
                                ).map((key) => (
                                  <label key={key}>
                                    {
                                      {
                                        title:
                                          selected.type === "education"
                                            ? "Degree / qualification"
                                            : selected.type === "experience"
                                              ? "Job title"
                                              : "Title",
                                        subtitle:
                                          selected.type === "education"
                                            ? "Institution"
                                            : selected.type === "experience"
                                              ? "Company"
                                              : "Organization / context",
                                        location: "Location",
                                        start: "Start date",
                                        end: "End date",
                                        url: "Related URL",
                                      }[key]
                                    }
                                    <input
                                      type={key === "url" ? "url" : "text"}
                                      value={item[key]}
                                      maxLength={
                                        key === "url"
                                          ? 500
                                          : ["start", "end"].includes(key)
                                            ? 40
                                            : 200
                                      }
                                      placeholder={
                                        key === "end"
                                          ? "Present"
                                          : key === "url"
                                            ? "https://…"
                                            : ""
                                      }
                                      onChange={(e) =>
                                        updateEntry(selected.id, item.id, {
                                          [key]: e.target.value,
                                        })
                                      }
                                    />
                                  </label>
                                ))}
                              </div>
                              <label>
                                Highlights{" "}
                                <span className="muted">
                                  One bullet per line
                                </span>
                                <textarea
                                  rows={4}
                                  value={item.bullets.join("\n")}
                                  onChange={(e) =>
                                    updateEntry(selected.id, item.id, {
                                      bullets: e.target.value
                                        .split("\n")
                                        .slice(0, 20)
                                        .map((s) => s.slice(0, 1500)),
                                    })
                                  }
                                />
                              </label>
                              {item.bullets.some(Boolean) && (
                                <button
                                  className="text-link"
                                  onClick={() => {
                                    setAiText(item.bullets.filter(Boolean)[0]);
                                    setAiTarget(
                                      JSON.stringify([
                                        selected.id,
                                        item.id,
                                        item.bullets.findIndex(Boolean),
                                      ]),
                                    );
                                    setAiAction("rewrite");
                                    setPanel("ai");
                                  }}
                                >
                                  <Sparkles size={14} /> Improve a bullet
                                </button>
                              )}
                            </article>
                          ))}
                          <button
                            className="button outline add-entry"
                            disabled={selected.items.length >= 30}
                            onClick={() =>
                              updateSection(selected.id, (s) => ({
                                ...s,
                                items: [...s.items, newEntry()],
                              }))
                            }
                          >
                            <Plus size={16} /> Add{" "}
                            {selected.type === "experience"
                              ? "experience"
                              : selected.type === "education"
                                ? "education"
                                : "entry"}
                          </button>
                        </>
                      )}
                    </>
                  )
                )}
              </div>
            </>
          )}
          <div hidden={panel !== "review"} className="review-pane">
            <ReviewPanel
              document={draft.document}
              onSection={(section) => {
                reviewFocus.current = true;
                setActive(section);
                setPanel("content");
              }}
            />
          </div>
          {panel === "design" && (
            <div className="design-panel">
              <h2>A frame for your story.</h2>
              <p className="muted">Change the presentation. Keep every word.</p>
              <label>
                Template
                <div className="template-options">
                  {(["classic", "modern", "technical"] as const).map((t) => (
                    <button
                      className={`mini-template ${draft.document.presentation.template === t ? "chosen" : ""}`}
                      aria-label={`${t} template`}
                      key={t}
                      onClick={() =>
                        updateDoc((d) => ({
                          ...d,
                          presentation: { ...d.presentation, template: t },
                        }))
                      }
                      aria-pressed={draft.document.presentation.template === t}
                    >
                      <span className={`mini-paper ${t}`}>
                        <b>Aa</b>
                        <i />
                        <i />
                        <i />
                      </span>
                      {t}
                    </button>
                  ))}
                </div>
              </label>
              <label>
                Accent color
                <div className="color-options">
                  {(["violet", "ink", "blue", "forest"] as const).map((c) => (
                    <button
                      aria-label={`${c} accent`}
                      aria-pressed={draft.document.presentation.accent === c}
                      className={`swatch ${c}`}
                      key={c}
                      onClick={() =>
                        updateDoc((d) => ({
                          ...d,
                          presentation: { ...d.presentation, accent: c },
                        }))
                      }
                    >
                      {draft.document.presentation.accent === c && (
                        <Check size={16} />
                      )}
                    </button>
                  ))}
                </div>
              </label>
              <label>
                Page size
                <select
                  aria-label="Page size"
                  value={draft.document.presentation.paper}
                  onChange={(e) =>
                    updateDoc((d) => ({
                      ...d,
                      presentation: {
                        ...d.presentation,
                        paper: e.target.value as "A4" | "LETTER",
                      },
                    }))
                  }
                >
                  <option value="A4">A4</option>
                  <option value="LETTER">US Letter</option>
                </select>
              </label>
              <label>
                Spacing
                <select
                  aria-label="Spacing"
                  value={draft.document.presentation.spacing}
                  onChange={(e) =>
                    updateDoc((d) => ({
                      ...d,
                      presentation: {
                        ...d.presentation,
                        spacing: e.target.value as "compact" | "comfortable",
                      },
                    }))
                  }
                >
                  <option value="comfortable">Comfortable</option>
                  <option value="compact">Compact</option>
                </select>
              </label>
            </div>
          )}
          {panel === "versions" && (
            <div className="versions-panel">
              <h2>Keep the good versions.</h2>
              <p className="muted">
                Name a milestone before tailoring for a new role. Your latest 20
                versions stay available.
              </p>
              {!cloud ? (
                <p>Save this resume to your account to keep named versions.</p>
              ) : (
                <>
                  <label>
                    Version name
                    <input
                      value={revisionName}
                      maxLength={100}
                      onChange={(e) => setRevisionName(e.target.value)}
                      placeholder="e.g. Frontend roles — October"
                    />
                  </label>
                  <button
                    className="button dark"
                    disabled={busy || dirty || !revisionName.trim()}
                    onClick={snapshot}
                  >
                    <Save size={16} /> Save named version
                  </button>
                  {dirty && (
                    <p className="muted">
                      Wait for your current edits to save first.
                    </p>
                  )}
                  {revisions.map((v) => (
                    <article className="version-row" key={v.id}>
                      <div>
                        <strong>{v.name}</strong>
                        <small>{new Date(v.createdAt).toLocaleString()}</small>
                      </div>
                      <button
                        className="button outline small"
                        disabled={busy || dirty}
                        onClick={() => restore(v.id)}
                      >
                        Restore
                      </button>
                    </article>
                  ))}
                </>
              )}
            </div>
          )}
          {panel === "ai" && (
            <fieldset className="ai-panel" disabled={busy}>
              <span className="eyebrow">
                <Sparkles size={14} /> REERHUB PRO
              </span>
              <h2>Your words, a little clearer.</h2>
              <p className="muted">
                Suggestions preserve the facts you provide. Review everything
                before using it.
              </p>
              {!usage?.enabled ? (
                <div className="notice">
                  <strong>Writing assistance is coming.</strong>
                  <p>
                    We’re evaluating quality and privacy before enabling it.
                    Your editor, saved resumes and PDF downloads remain free.
                  </p>
                </div>
              ) : !usage.eligible ? (
                <p>
                  Writing assistance is included with{" "}
                  <a href={`${jobsUrl}/dashboard/billing`}>REERHUB Pro</a>.
                </p>
              ) : (
                <>
                  <p className="allowance">
                    {usage.remaining} of {usage.limit} actions available ·
                    resets/ends {new Date(usage.resetsAt).toLocaleDateString()}{" "}
                    (UTC)
                  </p>
                  <label>
                    Help me with
                    <select
                      value={aiAction}
                      onChange={(e) => {
                        setAiAction(e.target.value as typeof aiAction);
                        setSuggestion(null);
                      }}
                    >
                      <option value="rewrite">Rewrite a selected bullet</option>
                      <option value="summary">
                        Draft a summary from my facts
                      </option>
                      <option value="tailor">Suggest edits for a job</option>
                    </select>
                  </label>
                  {aiAction !== "rewrite" && (
                    <button
                      className="text-link"
                      onClick={() => setAiText(resumeFacts(draft.document))}
                    >
                      Use facts from this resume
                    </button>
                  )}
                  {aiAction === "rewrite" && (
                    <label>
                      Target bullet
                      <select
                        value={aiTarget}
                        onChange={(e) => {
                          setAiTarget(e.target.value);
                          setSuggestion(null);
                          if (e.target.value) {
                            const [sid, iid, index] = JSON.parse(
                              e.target.value,
                            );
                            setAiText(
                              draft.document.sections
                                .find((s) => s.id === sid)!
                                .items.find((i) => i.id === iid)!.bullets[
                                index
                              ],
                            );
                          }
                        }}
                      >
                        <option value="">Writing only — copy manually</option>
                        {draft.document.sections.flatMap((s) =>
                          s.items.flatMap((i) =>
                            i.bullets.map((b, index) =>
                              b ? (
                                <option
                                  key={`${s.id}-${i.id}-${index}`}
                                  value={JSON.stringify([s.id, i.id, index])}
                                >
                                  {s.heading}: {b.slice(0, 70)}
                                </option>
                              ) : null,
                            ),
                          ),
                        )}
                      </select>
                    </label>
                  )}
                  <label>
                    {aiAction === "rewrite"
                      ? "Selected bullet"
                      : "Candidate facts"}
                    <textarea
                      rows={5}
                      value={aiText}
                      maxLength={12000}
                      onChange={(e) => {
                        setAiText(e.target.value);
                        setSuggestion(null);
                      }}
                    />
                  </label>
                  {aiAction === "tailor" && (
                    <label>
                      Job description
                      <textarea
                        rows={6}
                        value={jobDescription}
                        maxLength={16000}
                        onChange={(e) => setJobDescription(e.target.value)}
                      />
                    </label>
                  )}
                  {usage.provider && (
                    <p className="muted">
                      Service: {usage.provider.name} · {usage.provider.model}.{" "}
                      <a
                        href={usage.provider.privacyUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Provider privacy terms
                      </a>
                      . Requests route through Vercel AI Gateway.
                    </p>
                  )}
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                    />
                    <span>
                      I agree to send this writing to the disclosed AI service.
                      Contact fields are excluded; I have removed other personal
                      details. <Link href="/resume/privacy">Privacy</Link>
                    </span>
                  </label>
                  <button
                    className="button primary"
                    disabled={
                      busy ||
                      !consent ||
                      !aiText.trim() ||
                      usage.remaining === 0 ||
                      (aiAction === "tailor" && !jobDescription.trim())
                    }
                    onClick={runAi}
                  >
                    <Sparkles size={16} />
                    {busy ? "Working…" : "Get a suggestion"}
                  </button>
                </>
              )}
              {suggestion && (
                <div className="suggestion">
                  <h3>Review this suggestion</h3>
                  <p>{suggestion.suggestion}</p>
                  {suggestion.warnings.map((w, i) => (
                    <p className="notice" key={i}>
                      {w}
                    </p>
                  ))}
                  {aiAction === "summary" ? (
                    <button
                      className="button dark small"
                      onClick={applySummary}
                    >
                      Apply to summary
                    </button>
                  ) : aiAction === "rewrite" ? (
                    aiTarget ? (
                      <button
                        className="button dark small"
                        onClick={applyBullet}
                      >
                        Apply to selected bullet
                      </button>
                    ) : (
                      <p className="muted">
                        Copy this suggestion into the intended bullet after
                        checking it.
                      </p>
                    )
                  ) : (
                    <p className="muted">
                      Apply relevant changes in the editor after verifying each
                      fact.
                    </p>
                  )}
                  <button
                    className="text-link"
                    onClick={() => setSuggestion(null)}
                  >
                    Discard suggestion
                  </button>
                </div>
              )}
            </fieldset>
          )}
          {undo && (
            <button
              className="button outline small"
              onClick={() => {
                edit(() => undo);
                setUndo(null);
              }}
            >
              <Undo2 size={15} /> Undo last replacement or removal
            </button>
          )}
          <div className="save-area">
            {user ? (
              <>
                <button
                  className="button dark"
                  disabled={busy || conflict || (!dirty && !!cloud)}
                  onClick={() => void save()}
                >
                  <Save size={16} />
                  {busy ? "Saving…" : cloud ? "Save now" : "Save to my account"}
                </button>
                {!cloud && (
                  <p>Upload this device draft only when you choose Save.</p>
                )}
              </>
            ) : (
              <p>
                <a href={`${jobsUrl}/login?next=%2Fresume%2Feditor`}>Sign in</a>{" "}
                to save to your account. Building and PDF downloads are free.
              </p>
            )}
          </div>
          <div className="editor-footer">
            <a href={`${jobsUrl}/jobs`}>
              Find your next role <ChevronRight size={13} />
            </a>
            <Link href="/resume/privacy">Privacy</Link>
          </div>
        </div>
        <div
          className={`preview-container ${tab === "edit" ? "mobile-hidden" : ""}`}
        >
          <PdfWorkspace
            document={draft.document}
            title={draft.title}
            example={draft.example}
          />
        </div>
      </main>
    </div>
  );
}
