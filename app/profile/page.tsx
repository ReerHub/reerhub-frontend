"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/components/AuthProvider";
import {
  changePassword,
  deleteAccount,
  exportMyData,
  requestVerifyEmail,
  updateMe,
  type AuthUser,
} from "@/lib/auth";
import { TECH_TRACKS } from "@/lib/reerhub";

const inputCls =
  "w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[15px] text-slate-900 placeholder:text-slate-400 outline-none focus:border-electric-dark focus:ring-2 focus:ring-electric-soft transition-all";

export default function ProfilePage() {
  const { user, loading, refresh } = useAuth();
  if (loading) {
    return (
      <p className="max-w-2xl mx-auto px-4 py-16 text-slate-500">Loading…</p>
    );
  }
  if (!user) {
    return (
      <p className="max-w-2xl mx-auto px-4 py-16 text-slate-500">
        Please log in to view your profile.
      </p>
    );
  }
  return <ProfileForm key={user.id} user={user} onSaved={refresh} />;
}

function ProfileForm({
  user,
  onSaved,
}: {
  user: AuthUser;
  onSaved: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: user.name || "",
    headline: user.profile.headline || "",
    currentRole: user.profile.currentRole || "",
    techTrack: user.profile.techTrack || "",
    skills: (user.profile.skills || []).join(", "),
    city: user.profile.city || "",
    experienceYears: user.profile.experienceYears?.toString() || "",
    remoteType: user.profile.remoteType || "unknown",
  });

  const set =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await updateMe({
        name: form.name,
        headline: form.headline || undefined,
        currentRole: form.currentRole || undefined,
        techTrack: form.techTrack || undefined,
        skills: form.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, 10),
        city: form.city || undefined,
        experienceYears: form.experienceYears
          ? Number(form.experienceYears)
          : undefined,
        remoteType: form.remoteType,
      });
      await onSaved();
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    try {
      await requestVerifyEmail();
      toast.success("Verification email sent");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send email");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
        Your profile
      </h1>
      <p className="text-slate-500 mb-6">
        {user.email} · {user.authProvider === "google" ? "Google" : "Email"}{" "}
        account
      </p>
      {!user.emailVerified && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 flex items-center justify-between gap-3">
          <span>Email not verified — check your inbox.</span>
          <button onClick={resend} className="font-semibold underline shrink-0">
            Resend
          </button>
        </div>
      )}
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label
            htmlFor="pf-name"
            className="text-sm font-semibold text-slate-700"
          >
            Name
          </label>
          <input
            id="pf-name"
            className={inputCls}
            value={form.name}
            onChange={set("name")}
            required
            autoComplete="name"
          />
        </div>
        <div>
          <label
            htmlFor="pf-headline"
            className="text-sm font-semibold text-slate-700"
          >
            Headline
          </label>
          <input
            id="pf-headline"
            className={inputCls}
            placeholder="e.g. Backend Engineer · 3 yrs · Bengaluru"
            value={form.headline}
            onChange={set("headline")}
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="pf-role"
              className="text-sm font-semibold text-slate-700"
            >
              Current job role
            </label>
            <input
              id="pf-role"
              className={inputCls}
              placeholder="e.g. SDE-2"
              value={form.currentRole}
              onChange={set("currentRole")}
            />
          </div>
          <div>
            <label
              htmlFor="pf-track"
              className="text-sm font-semibold text-slate-700"
            >
              Track
            </label>
            <select
              id="pf-track"
              className={inputCls}
              value={form.techTrack}
              onChange={set("techTrack")}
            >
              <option value="">Select track</option>
              {TECH_TRACKS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label
            htmlFor="pf-skills"
            className="text-sm font-semibold text-slate-700"
          >
            Skills (comma separated, max 10)
          </label>
          <input
            id="pf-skills"
            className={inputCls}
            placeholder="React, Node.js, Python"
            value={form.skills}
            onChange={set("skills")}
          />
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="pf-city"
              className="text-sm font-semibold text-slate-700"
            >
              City
            </label>
            <input
              id="pf-city"
              className={inputCls}
              value={form.city}
              onChange={set("city")}
              autoComplete="address-level2"
            />
          </div>
          <div>
            <label
              htmlFor="pf-exp"
              className="text-sm font-semibold text-slate-700"
            >
              Experience (yrs)
            </label>
            <input
              id="pf-exp"
              className={inputCls}
              type="number"
              min={0}
              max={60}
              value={form.experienceYears}
              onChange={set("experienceYears")}
            />
          </div>
          <div>
            <label
              htmlFor="pf-mode"
              className="text-sm font-semibold text-slate-700"
            >
              Work mode
            </label>
            <select
              id="pf-mode"
              className={inputCls}
              value={form.remoteType}
              onChange={set("remoteType")}
            >
              <option value="unknown">Any</option>
              <option value="onsite">Onsite</option>
              <option value="hybrid">Hybrid</option>
              <option value="remote">Remote</option>
            </select>
          </div>
        </div>
        <button
          type="submit"
          disabled={busy}
          className="px-8 py-2.5 bg-electric text-white rounded-xl font-semibold hover:bg-electric-dark disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save profile"}
        </button>
      </form>
      <SecuritySection isEmailAccount={user.authProvider === "email"} />
      <DataSection />
    </div>
  );
}

function SecuritySection({ isEmailAccount }: { isEmailAccount: boolean }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [busy, setBusy] = useState(false);

  if (!isEmailAccount) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await changePassword(current, next);
      setCurrent("");
      setNext("");
      toast.success("Password changed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Change failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mt-10 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-card">
      <h2 className="font-bold text-slate-900 text-lg mb-1">Security</h2>
      <p className="text-sm text-slate-500 mb-4">Change your password.</p>
      <form onSubmit={submit} className="space-y-3 max-w-sm">
        <div>
          <label
            htmlFor="pw-current"
            className="text-sm font-semibold text-slate-700"
          >
            Current password
          </label>
          <input
            id="pw-current"
            type="password"
            required
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            autoComplete="current-password"
            className={inputCls}
          />
        </div>
        <div>
          <label
            htmlFor="pw-next"
            className="text-sm font-semibold text-slate-700"
          >
            New password (min 8 characters)
          </label>
          <input
            id="pw-next"
            type="password"
            required
            minLength={8}
            value={next}
            onChange={(e) => setNext(e.target.value)}
            autoComplete="new-password"
            className={inputCls}
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="px-6 py-2.5 bg-electric text-white rounded-xl text-sm font-semibold hover:bg-electric-dark disabled:opacity-50"
        >
          {busy ? "Updating…" : "Change password"}
        </button>
      </form>
    </section>
  );
}

function DataSection() {
  const router = useRouter();
  const { logout } = useAuth();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  const download = async () => {
    try {
      const data = await exportMyData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "reerhub-data.json";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Export failed");
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await deleteAccount();
      await logout();
      toast.success("Account deleted");
      router.push("/");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mt-6 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-card">
      <h2 className="font-bold text-slate-900 text-lg mb-1">Your data</h2>
      <p className="text-sm text-slate-500 mb-4">
        Download everything we store about you, or delete your account and saved
        jobs permanently.
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={download}
          className="px-6 py-2.5 bg-white border border-slate-200 text-slate-900 rounded-xl text-sm font-semibold hover:border-slate-300"
        >
          Download my data
        </button>
        {!confirming ? (
          <button
            onClick={() => setConfirming(true)}
            className="px-6 py-2.5 bg-white border border-red-200 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50"
          >
            Delete account
          </button>
        ) : (
          <span className="inline-flex flex-wrap items-center gap-3">
            <span className="text-sm text-slate-600">
              Are you sure? This cannot be undone.
            </span>
            <button
              onClick={remove}
              disabled={busy}
              className="px-6 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-500 disabled:opacity-50"
            >
              {busy ? "Deleting…" : "Yes, delete"}
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold"
            >
              Cancel
            </button>
          </span>
        )}
      </div>
    </section>
  );
}
