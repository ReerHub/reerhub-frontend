"use client";

import { useEffect, useRef, useState } from "react";
import { writeAdmin } from "@/lib/admin";

export default function AdminDeleteDialog({
  kind,
  record,
  onClose,
  onDeleted,
  archive = false,
}: {
  kind: "company" | "source";
  record: { _id: string; name: string; isActive: boolean };
  onClose: () => void;
  onDeleted: (result: {
    closedJobs?: number;
    alreadyArchived?: boolean;
  }) => void;
  archive?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const pending = useRef(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const element = dialog.current;
    const focus = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    element?.showModal();
    return () => {
      element?.close();
      document.body.style.overflow = overflow;
      focus?.focus();
    };
  }, []);
  async function remove() {
    if (
      pending.current ||
      (!archive && record.isActive) ||
      name !== record.name
    )
      return;
    pending.current = true;
    setBusy(true);
    setError("");
    let result: { closedJobs?: number; alreadyArchived?: boolean };
    try {
      result = await writeAdmin<{
        closedJobs?: number;
        alreadyArchived?: boolean;
      }>(
        archive
          ? `/admin/sources/${record._id}/archive`
          : `/admin/${kind === "company" ? "companies" : "sources"}/${record._id}`,
        archive ? "POST" : "DELETE",
        { confirmName: name },
      );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Deletion failed. Please retry.",
      );
      pending.current = false;
      setBusy(false);
      return;
    }
    onDeleted(result);
  }
  return (
    <dialog
      ref={dialog}
      className="admin-ui modal"
      aria-labelledby="delete-title"
      aria-describedby="delete-description"
      onCancel={(event) => {
        event.preventDefault();
        if (!pending.current) onClose();
      }}
    >
      <header className="modal-head">
        <div>
          <p className="eyebrow">
            {archive ? "Safe source removal" : "Permanent deletion"}
          </p>
          <h2 id="delete-title">
            {archive ? "Remove" : "Delete"} {record.name}?
          </h2>
          <p id="delete-description">
            {archive ? (
              "This archives the source, stops future syncs and closes only its linked active jobs. Job records, saved-job references and sync history remain stored. Other sources and their jobs are untouched. Archived sources cannot be reactivated through ordinary editing. The action is recorded in the audit trail."
            ) : (
              <>
                Only inactive, unused records can be deleted. Companies with
                sources, jobs or sync history must be kept inactive. Nothing
                else is deleted. This action cannot be undone in admin and is
                recorded in the audit trail.
              </>
            )}
          </p>
        </div>
        <button
          className="button"
          disabled={busy}
          onClick={onClose}
          aria-label="Close deletion dialog"
        >
          Close
        </button>
      </header>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void remove();
        }}
      >
        <div className="modal-body">
          {record.isActive && !archive && (
            <p className="notice error">
              Use Edit to deactivate this record before deleting it.
            </p>
          )}
          <label className="field">
            <span>
              Type <strong>{record.name}</strong> to confirm
            </span>
            <input
              autoComplete="off"
              value={name}
              disabled={busy || (!archive && record.isActive)}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          {error && (
            <p className="notice error" role="alert">
              {error} Refresh records before retrying if deletion could not be
              confirmed.
            </p>
          )}
          {busy && (
            <p role="status">
              {archive
                ? "Archiving source and closing linked active jobs…"
                : "Checking dependencies and deleting…"}
            </p>
          )}
        </div>
        <footer className="modal-actions">
          <button
            type="button"
            className="button"
            disabled={busy}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="button danger"
            disabled={
              busy || (!archive && record.isActive) || name !== record.name
            }
          >
            {busy
              ? "Processing…"
              : archive
                ? "Remove source & close linked jobs"
                : "Delete permanently"}
          </button>
        </footer>
      </form>
    </dialog>
  );
}
