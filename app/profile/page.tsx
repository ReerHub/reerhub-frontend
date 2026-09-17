"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/components/AuthProvider";
import { requestVerifyEmail, updateMe, type AuthUser } from "@/lib/auth";
import { TECH_TRACKS } from "@/lib/reerhub";

const inputCls =
  "w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-[15px] text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all";

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
          <label className="text-sm font-semibold text-slate-700">Name</label>
          <input
            className={inputCls}
            value={form.name}
            onChange={set("name")}
            required
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700">
            Headline
          </label>
          <input
            className={inputCls}
            placeholder="e.g. Backend Engineer · 3 yrs · Bengaluru"
            value={form.headline}
            onChange={set("headline")}
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-slate-700">
              Current job role
            </label>
            <input
              className={inputCls}
              placeholder="e.g. SDE-2"
              value={form.currentRole}
              onChange={set("currentRole")}
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">
              Track
            </label>
            <select
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
          <label className="text-sm font-semibold text-slate-700">
            Skills (comma separated, max 10)
          </label>
          <input
            className={inputCls}
            placeholder="React, Node.js, Python"
            value={form.skills}
            onChange={set("skills")}
          />
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-semibold text-slate-700">City</label>
            <input
              className={inputCls}
              value={form.city}
              onChange={set("city")}
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">
              Experience (yrs)
            </label>
            <input
              className={inputCls}
              type="number"
              min={0}
              max={60}
              value={form.experienceYears}
              onChange={set("experienceYears")}
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">
              Work mode
            </label>
            <select
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
          className="px-8 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500 disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save profile"}
        </button>
      </form>
    </div>
  );
}
