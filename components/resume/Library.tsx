"use client";
import { useConfirm } from "./ConfirmationProvider";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Plus,
  Copy,
  Trash2,
  ArrowUpRight,
  FileText,
  RefreshCw,
} from "lucide-react";
import Brand from "./Brand";

import { api as requestResume, json, type User } from "@/lib/resume/api";
import type { ResumeSummary } from "@/lib/resume/document";
export default function Library({
  jobsUrl,
  user,
}: {
  jobsUrl: string;
  user: User | null;
}) {
  const api = useCallback(
    <T,>(path: string, init?: RequestInit) =>
      requestResume<T>(path, init, user?.id),
    [user?.id],
  );
  const ask = useConfirm();
  const sequence = useRef(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [rows, setRows] = useState<ResumeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  async function refresh() {
    const ticket = ++sequence.current;
    setRows([]);
    setLoading(true);
    setError("");
    try {
      const account = user;
      if (ticket !== sequence.current) return;
      const result = account
        ? await api<{ items: ResumeSummary[]; hasMore: boolean }>(
            "/resumes?page=1",
          )
        : { items: [], hasMore: false };
      if (ticket !== sequence.current) return;
      setRows(result.items);
      setHasMore(result.hasMore);
      setPage(1);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    let active = true;
    async function load() {
      const ticket = ++sequence.current;
      try {
        const account = user;
        if (!active || ticket !== sequence.current) return;
        if (account) {
          const result = await api<{
            items: ResumeSummary[];
            hasMore: boolean;
          }>("/resumes?page=1");
          if (active && ticket === sequence.current) {
            setRows(result.items);
            setHasMore(result.hasMore);
            setPage(1);
          }
        }
      } catch (e) {
        if (active) setError((e as Error).message);
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    const onFocus = () => {
      setRows([]);
      void load();
    };
    window.addEventListener("focus", onFocus);
    return () => {
      active = false;
      window.removeEventListener("focus", onFocus);
    };
  }, [api, user]);
  async function more() {
    setBusy("more");
    const ticket = sequence.current;
    try {
      const result = await api<{ items: ResumeSummary[]; hasMore: boolean }>(
        `/resumes?page=${page + 1}`,
      );
      if (ticket !== sequence.current) return;
      setRows((current) => [
        ...current,
        ...result.items.filter((row) => !current.some((r) => r.id === row.id)),
      ]);
      setPage((p) => p + 1);
      setHasMore(result.hasMore);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy("");
    }
  }
  async function act(id: string, action: "duplicate" | "delete") {
    if (
      action === "delete" &&
      !(await ask("Permanently delete this resume and all its named versions?"))
    )
      return;
    setBusy(id);
    try {
      await api(
        `/resumes/${id}${action === "duplicate" ? "/duplicate" : ""}`,
        json(action === "duplicate" ? "POST" : "DELETE"),
      );
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy("");
    }
  }
  return (
    <>
      <header className="marketing-nav">
        <Brand />
        <nav>
          <a href={`${jobsUrl}/jobs`}>
            Explore jobs <ArrowUpRight size={14} />
          </a>
          <Link className="button primary small" href="/resume/editor">
            <Plus size={16} /> New resume
          </Link>
        </nav>
      </header>
      <main id="main-content" className="library-main">
        <span className="eyebrow">ROOM FOR EVERY NEXT STEP</span>
        <div className="library-heading">
          <div>
            <h1>
              My resumes<span>.</span>
            </h1>
            <p>Different roles. Different versions. All your story.</p>
          </div>
          {user && <span className="account-pill">{user.name}</span>}
        </div>
        {error && (
          <div className="notice error" role="alert">
            {error}
            <button className="text-link" onClick={refresh}>
              <RefreshCw size={14} /> Try again
            </button>
          </div>
        )}
        {loading ? (
          <p role="status">Opening your library…</p>
        ) : !user ? (
          <section className="empty-state">
            <FileText size={36} />
            <h2>Your story deserves a home.</h2>
            <p>
              Sign in with your REERHUB account to save resumes and keep named
              versions. Your guest draft stays on this device until you choose
              to upload it.
            </p>
            <a
              className="button dark"
              href={`${jobsUrl}/login?next=%2Fresume%2Flibrary`}
            >
              Sign in to REERHUB <ArrowUpRight size={16} />
            </a>
            <Link className="text-link" href="/resume/editor">
              Continue without an account
            </Link>
          </section>
        ) : (
          <div className="library-grid">
            {rows.map((row) => (
              <article className="library-card" key={row.id}>
                <Link
                  className="library-open"
                  href={`/resume/editor?id=${row.id}`}
                >
                  <div className="library-page">
                    <FileText size={42} />
                    <span>RESUME</span>
                  </div>
                  <h2>{row.title}</h2>
                  <p>Updated {new Date(row.updatedAt).toLocaleDateString()}</p>
                </Link>
                <div className="library-actions">
                  <Link href={`/resume/editor?id=${row.id}`}>
                    Open <ArrowUpRight size={14} />
                  </Link>
                  <div>
                    <button
                      disabled={busy === row.id}
                      aria-label={`Duplicate ${row.title}`}
                      onClick={() => act(row.id, "duplicate")}
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      disabled={busy === row.id}
                      className="danger"
                      aria-label={`Delete ${row.title}`}
                      onClick={() => act(row.id, "delete")}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
            <Link href="/resume/editor" className="new-resume-card">
              <Plus size={28} />
              <h2>A new possibility.</h2>
              <p>Start a new resume</p>
            </Link>
          </div>
        )}
        {user && hasMore && (
          <button className="button outline" disabled={!!busy} onClick={more}>
            Load more resumes
          </button>
        )}
      </main>
    </>
  );
}
