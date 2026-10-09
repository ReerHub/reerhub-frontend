"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/components/AuthProvider";
import {
  deleteAccount,
  exportMyData,
  requestVerifyEmail,
  updateMe,
  type AuthUser,
} from "@/lib/auth";
import styles from "@/app/profile/Profile.module.css";

export default function ProfileSettings({
  user,
  disabled,
  onBusy,
}: {
  user: AuthUser;
  disabled: boolean;
  onBusy: (busy: boolean) => void;
}) {
  const router = useRouter();
  const { logout, refresh } = useAuth();
  const [action, setAction] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [digest, setDigest] = useState(
    user.notificationPreferences?.digest || "daily",
  );
  const dialogRef = useRef<HTMLDialogElement>(null);
  const deleteTrigger = useRef<HTMLButtonElement>(null);
  const locked = disabled || Boolean(action);
  useEffect(() => {
    if (confirming) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [confirming]);
  async function perform(name: string, task: () => Promise<void>) {
    setAction(name);
    onBusy(true);
    try {
      await task();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not complete this action. Try again.",
      );
    } finally {
      setAction("");
      onBusy(false);
    }
  }
  async function download() {
    const data = await exportMyData();
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "reerhub-data.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }
  return (
    <section className={styles.settings} aria-labelledby="settings-title">
      <div className={styles.settingsHeader}>
        <h2 id="settings-title">Account settings</h2>
        <p>The details that keep your account yours.</p>
      </div>
      {user.membership?.isPro && (
        <div className={styles.settingsRow}>
          <div>
            <h3>Daily match emails</h3>
            <p>
              Up to five fresh roles with 75%+ relevance when qualifying matches
              are available.
            </p>
          </div>
          <select
            aria-label="Daily Pro match email preference"
            value={digest}
            disabled={locked}
            onChange={(event) => {
              const choice = event.target.value as "daily" | "paused";
              void perform("alerts", async () => {
                await updateMe({ notificationPreferences: { digest: choice } });
                setDigest(choice);
                await refresh();
                toast.success(
                  choice === "paused"
                    ? "Match emails paused"
                    : "Daily match emails enabled",
                );
              });
            }}
          >
            <option value="daily">Daily matches</option>
            <option value="paused">Paused</option>
            {!["daily", "paused"].includes(digest) && (
              <option value={digest}>{digest} (previous preference)</option>
            )}
          </select>
          {action === "alerts" && <span role="status">Updating…</span>}
        </div>
      )}
      <div className={styles.settingsRow}>
        <div>
          <h3>Sign-in & email</h3>
          <p>
            {user.authProvider === "google"
              ? "You sign in securely with Google."
              : "You sign in with a secure link sent to your email. No password needed."}
          </p>
          <span className={styles.accountEmail}>
            {user.email} · {user.emailVerified ? "Verified" : "Not verified"}
          </span>
        </div>
        {!user.emailVerified && (
          <button
            className={styles.secondary}
            disabled={locked}
            onClick={() =>
              void perform("verify", async () => {
                await requestVerifyEmail();
                toast.success("Verification email sent");
              })
            }
          >
            {action === "verify" ? "Sending…" : "Resend verification"}
          </button>
        )}
      </div>
      <div className={styles.settingsRow}>
        <div>
          <h3>Your data</h3>
          <p>Download a copy of your profile and saved roles.</p>
        </div>
        <button
          className={styles.secondary}
          disabled={locked}
          onClick={() => void perform("export", download)}
        >
          {action === "export" ? "Preparing…" : "Download my data"}
        </button>
      </div>
      <div className={`${styles.settingsRow} ${styles.dangerRow}`}>
        <div>
          <h3>Delete account</h3>
          <p>Permanently remove your account and saved roles.</p>
        </div>
        <button
          ref={deleteTrigger}
          className={styles.dangerButton}
          disabled={locked}
          onClick={() => setConfirming(true)}
        >
          Delete account
        </button>
      </div>
      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-labelledby="delete-title"
        onCancel={(event) => {
          if (action) event.preventDefault();
          else setConfirming(false);
        }}
        onClose={() => {
          setConfirming(false);
          deleteTrigger.current?.focus();
        }}
      >
        <h2 id="delete-title">Delete your account?</h2>
        <p>
          Your profile and saved roles will be permanently removed. This cannot
          be undone. Any renewable subscription must be cancelled first.
        </p>
        <div className={styles.saveActions}>
          <button
            autoFocus
            className={styles.secondary}
            disabled={Boolean(action)}
            onClick={() => setConfirming(false)}
          >
            Keep my account
          </button>
          <button
            className={styles.dangerButton}
            disabled={Boolean(action)}
            onClick={() =>
              void perform("delete", async () => {
                await deleteAccount();
                await logout();
                toast.success("Account deleted");
                router.push("/");
                router.refresh();
              })
            }
          >
            {action === "delete" ? "Deleting…" : "Delete permanently"}
          </button>
        </div>
      </dialog>
    </section>
  );
}
