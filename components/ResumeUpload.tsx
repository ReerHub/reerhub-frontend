"use client";
import { useEffect, useRef, useState } from "react";
import { extractResume, type ResumeDraft } from "@/lib/resume";
import styles from "@/app/profile/Profile.module.css";
export default function ResumeUpload({
  onDraft,
  onBusy,
  disabled,
}: {
  onDraft: (draft: ResumeDraft) => void;
  onBusy: (busy: boolean) => void;
  disabled: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  return (
    <section className={styles.section} aria-labelledby="resume-title">
      <h2 id="resume-title">Start with your resume</h2>
      <p>Text-based PDF · Up to 5 MB · Maximum 10 pages</p>
      <p className={styles.notice}>
        Your PDF is discarded after processing. Only the details you confirm and
        save are kept.
      </p>
      <label className={styles.field}>
        Choose PDF resume
        <input
          type="file"
          accept=".pdf,application/pdf"
          disabled={busy || disabled}
          onChange={async (event) => {
            const file = event.currentTarget.files?.[0];
            event.currentTarget.value = "";
            if (!file) return;
            const abort = new AbortController();
            controller.current = abort;
            setBusy(true);
            onBusy(true);
            setError("");
            try {
              const draft = await extractResume(file, abort.signal);
              if (!abort.signal.aborted) onDraft(draft);
            } catch (error) {
              if (!abort.signal.aborted)
                setError(
                  error instanceof Error
                    ? error.message
                    : "Upload failed. Your saved profile is unchanged.",
                );
            } finally {
              if (controller.current === abort) {
                controller.current = null;
                setBusy(false);
                onBusy(false);
              }
            }
          }}
        />
      </label>
      {busy && (
        <>
          <p role="status">
            Reading your resume… Your saved profile is unchanged.
          </p>
          <button
            type="button"
            className={styles.secondary}
            onClick={() => controller.current?.abort()}
          >
            Cancel upload
          </button>
        </>
      )}
      {error && (
        <p role="alert" className={styles.error}>
          {error} Your saved profile is unchanged. You can retry or continue
          browsing.
        </p>
      )}
    </section>
  );
}
