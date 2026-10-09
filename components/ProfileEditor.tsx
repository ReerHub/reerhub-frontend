"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import Icon from "@/components/ui/Icon";
import { useAuth } from "@/components/AuthProvider";
import { updateMe, type AuthUser } from "@/lib/auth";
import { API_BASE } from "@/lib/reerhub";
import ProfileOptionPicker from "@/components/ProfileOptionPicker";
import { profileSignals } from "@/lib/profile-readiness";
import {
  draftFromUser,
  profileErrors,
  profilePayload,
  type ProfileOptions,
  type ProfileDraft,
} from "@/lib/profile-editor";
import ProfileSettings from "@/components/ProfileSettings";
import styles from "@/app/profile/Profile.module.css";

const signalFields = [
  "techTrack",
  "roles",
  "skills",
  "experienceYears",
  "cities",
];

export default function ProfileEditor({ user }: { user: AuthUser }) {
  const [options, setOptions] = useState<ProfileOptions | null>(null);
  const [loadError, setLoadError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_BASE}/profile-options`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load profile choices.");
        const json = await response.json();
        if (!json.data?.tracks || !json.data?.skills || !json.data?.cities)
          throw new Error("Profile choices are unavailable.");
        setOptions(json.data);
        setLoadError("");
      })
      .catch((error) => {
        if (!controller.signal.aborted) setLoadError(error.message);
      });
    return () => controller.abort();
  }, [attempt]);
  if (!options)
    return (
      <div className={styles.loading} role="status">
        {loadError || "Loading profile choices…"}
        {loadError && (
          <button
            className={styles.secondary}
            onClick={() => setAttempt((value) => value + 1)}
          >
            Retry
          </button>
        )}
      </div>
    );
  return <Editor user={user} options={options} />;
}

function Editor({
  user,
  options,
}: {
  user: AuthUser;
  options: ProfileOptions;
}) {
  const { refresh } = useAuth();
  const router = useRouter();
  const [leaveTarget, setLeaveTarget] = useState<string | null>(null);
  const leaveDialog = useRef<HTMLDialogElement>(null);
  const allowNavigation = useRef(false);
  const [draft, setDraft] = useState(() => draftFromUser(user));
  const [baseline, setBaseline] = useState(() =>
    profilePayload(draftFromUser(user)),
  );
  const [trackTarget, setTrackTarget] = useState<string | null>(null);
  const trackDialog = useRef<HTMLDialogElement>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);
  const [settingsBusy, setSettingsBusy] = useState(false);
  const effective = draft;
  const track = options.tracks.find((item) => item.value === draft.techTrack);
  const dirty =
    JSON.stringify(profilePayload(effective)) !== JSON.stringify(baseline) ||
    Object.keys(profileErrors(effective)).length > 0;
  const locked = busy || settingsBusy;
  const signals = profileSignals({
    ...user.profile,
    ...draft,
    skills: effective.skills,
    experienceYears:
      draft.experienceYears.trim() === ""
        ? undefined
        : Number(draft.experienceYears),
  });
  const complete = signals.filter((signal) => signal.complete).length;
  const next = signals.findIndex((signal) => !signal.complete);

  useEffect(() => {
    if (!dirty && !busy) return;
    const unload = (event: BeforeUnloadEvent) => {
      if (allowNavigation.current) return;
      event.preventDefault();
      event.returnValue = "";
    };
    const navigate = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const anchor = (event.target as Element).closest<HTMLAnchorElement>(
        "a[href]",
      );
      if (
        !anchor ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download")
      )
        return;
      const url = new URL(anchor.href, window.location.href);
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      )
        return;
      event.preventDefault();
      event.stopPropagation();
      if (!busy) setLeaveTarget(url.href);
    };
    window.addEventListener("beforeunload", unload);
    document.addEventListener("click", navigate, true);
    return () => {
      window.removeEventListener("beforeunload", unload);
      document.removeEventListener("click", navigate, true);
    };
  }, [dirty, busy]);

  useEffect(() => {
    if (leaveTarget) leaveDialog.current?.showModal();
    else leaveDialog.current?.close();
  }, [leaveTarget]);

  function change<K extends keyof ProfileDraft>(
    key: K,
    value: ProfileDraft[K],
  ) {
    setDraft((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: "" }));
    setSaveError("");
    setSaved(false);
  }
  useEffect(() => {
    if (trackTarget !== null) trackDialog.current?.showModal();
    else trackDialog.current?.close();
  }, [trackTarget]);
  function chooseTrack(value: string) {
    const allowed =
      options.tracks.find((item) => item.value === value)?.roles || [];
    if (
      draft.techRoles.some(
        (role) => !allowed.some((item) => item.value === role),
      )
    )
      setTrackTarget(value);
    else change("techTrack", value);
  }
  function focusField(field: string) {
    document.getElementById(`pf-${field}`)?.focus();
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const current = draft;
    const invalid = {
      ...profileErrors(current),
    };
    setErrors(invalid);
    if (Object.keys(invalid).length) {
      focusField(Object.keys(invalid)[0]);
      return;
    }
    setBusy(true);
    setSaveError("");
    try {
      const updated = await updateMe(profilePayload(current));
      const clean = draftFromUser(updated);
      setDraft(clean);
      setBaseline(profilePayload(clean));
      setSaved(true);
      await refresh();
      toast.success("Profile saved");
    } catch (error) {
      setSaveError(
        error instanceof Error && !error.message.startsWith("Request failed")
          ? error.message
          : "Could not save your profile. Try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  function discard() {
    setDraft({
      name: baseline.name || "",
      techTrack: baseline.techTrack || "",
      rolePreference: baseline.rolePreference || "any",
      techRoles: [...(baseline.techRoles || [])],
      skills: [...(baseline.skills || [])],
      experienceYears: baseline.experienceYears?.toString() ?? "",
      locationPreference: baseline.locationPreference || "all-india",
      targetLocations: [...(baseline.targetLocations || [])],
      remoteType: baseline.remoteType || "unknown",
    });
    setErrors({});
    setSaveError("");
    setSaved(false);
  }
  function fieldError(field: string) {
    return errors[field] ? (
      <p id={`error-${field}`} className={styles.error} role="alert">
        {errors[field]}
      </p>
    ) : null;
  }
  const inputProps = (field: string) => ({
    "aria-invalid": Boolean(errors[field]),
    "aria-describedby": errors[field] ? `error-${field}` : undefined,
  });

  return (
    <div className={styles.page}>
      <Link href="/dashboard" className={styles.back}>
        <Icon name="arrow" className="h-4 w-4 rotate-180" /> My dashboard
      </Link>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>YOUR CAREER, YOUR DIRECTION</span>
          <h1>Edit profile</h1>
          <p>A few details. A clearer direction for your next role.</p>
        </div>
        <div className={styles.identity}>
          <span className={styles.avatar} aria-hidden="true">
            {user.name?.trim().slice(0, 1).toUpperCase() || "U"}
          </span>
          <div>
            <strong>{user.name || "Your account"}</strong>
            <span>{user.email}</span>
          </div>
        </div>
      </header>
      <div className={styles.layout}>
        <aside className={styles.readiness} aria-label="Profile readiness">
          <span className={styles.eyebrow}>YOUR PROFILE SIGNALS</span>
          <h2>{complete === 5 ? "Ready for matching" : "Make it yours"}</h2>
          <p>
            {complete === 5
              ? "Your essentials are complete. Available roles still depend on current openings."
              : "Start with the essentials. You can save and finish later."}
          </p>
          <div className={styles.progressLabel}>
            <strong>{complete} of 5 complete</strong>
            <span>{complete * 20}%</span>
          </div>
          <div
            className={styles.progress}
            role="progressbar"
            aria-label="Profile essentials"
            aria-valuemin={0}
            aria-valuemax={5}
            aria-valuenow={complete}
          >
            <span style={{ width: `${complete * 20}%` }} />
          </div>
          <ul>
            {signals.map((signal, index) => (
              <li key={signal.label}>
                <button
                  type="button"
                  onClick={() => focusField(signalFields[index])}
                  disabled={locked}
                >
                  <span
                    className={
                      signal.complete ? styles.checkComplete : styles.check
                    }
                  >
                    {signal.complete ? (
                      <Icon name="check" className="h-3.5 w-3.5" />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <span>{signal.label}</span>
                  <span className={styles.signalState}>
                    {signal.complete ? "Done" : "Add"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {next >= 0 && (
            <div className={styles.next}>
              <span>UP NEXT</span>
              <button
                type="button"
                disabled={locked}
                onClick={() => focusField(signalFields[next])}
              >
                Add {signals[next].label.toLowerCase()}{" "}
                <span aria-hidden="true">↗</span>
              </button>
            </div>
          )}
          <p className={styles.readinessNote}>
            {dirty
              ? "Save changes to update your profile."
              : user.membership?.isPro
                ? "These details guide your Pro matches."
                : complete === 5
                  ? "These essentials can guide your matches if you choose Pro."
                  : "Complete these essentials to guide matches if you choose Pro."}{" "}
            Scores describe relevance, not hiring chances.
          </p>
        </aside>
        <form onSubmit={submit} noValidate className={styles.form}>
          <fieldset disabled={locked} className={styles.section}>
            <legend className="sr-only">Your next role</legend>
            <SectionTitle
              number="01"
              title="Your next role"
              description="Tell us where you want to go, not just where you are now."
            />
            <div className={styles.field}>
              <label htmlFor="pf-techTrack">Your engineering track</label>
              <select
                id="pf-techTrack"
                value={draft.techTrack}
                onChange={(event) => chooseTrack(event.target.value)}
                {...inputProps("techTrack")}
              >
                <option value="">Choose your focus</option>
                {options.tracks.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              <p>
                {track?.description ||
                  "Choose an area you know or would like to work in."}
              </p>
            </div>
            <fieldset
              className={styles.preferenceGroup}
              disabled={!track || locked}
            >
              <legend>Roles you are open to</legend>
              <label>
                <input
                  id="pf-roles"
                  type="radio"
                  name="role-preference"
                  checked={draft.rolePreference === "any"}
                  onChange={() => {
                    change("rolePreference", "any");
                    change("techRoles", []);
                  }}
                />
                Any role in this track
              </label>
              <label>
                <input
                  type="radio"
                  name="role-preference"
                  checked={draft.rolePreference === "selected"}
                  onChange={() => change("rolePreference", "selected")}
                />
                Choose preferred roles
              </label>
              <p className={styles.hint}>
                Not sure about a job title? Any role is a good place to start.
              </p>
              {draft.rolePreference === "selected" && (
                <ProfileOptionPicker
                  id="pf-techRoles"
                  label="Preferred roles"
                  options={track?.roles || []}
                  values={draft.techRoles}
                  limit={3}
                  onChange={(values) => change("techRoles", values)}
                  error={errors.techRoles}
                />
              )}
            </fieldset>
            <div className={styles.field}>
              <label htmlFor="pf-name">Your name</label>
              <input
                id="pf-name"
                value={draft.name}
                onChange={(event) => change("name", event.target.value)}
                autoComplete="name"
                maxLength={120}
                {...inputProps("name")}
              />
              {fieldError("name")}
            </div>
          </fieldset>
          <fieldset disabled={locked} className={styles.section}>
            <legend className="sr-only">Your skills</legend>
            <SectionTitle
              number="02"
              title="Your skills"
              description="Choose the tools and skills you would use in your next role."
            />
            <ProfileOptionPicker
              id="pf-skills"
              label="Core skills"
              options={options.skills}
              values={draft.skills}
              limit={10}
              onChange={(values) => change("skills", values)}
              error={errors.skills}
              suggestions={track?.suggestedSkills || []}
            />
            <p className={styles.hint}>
              Select at least 3 skills to complete your matching essentials.
              Alternate names lead to the same skill.
            </p>
          </fieldset>
          <fieldset disabled={locked} className={styles.section}>
            <legend className="sr-only">Your work preferences</legend>
            <SectionTitle
              number="03"
              title="Your work preferences"
              description="A little context helps put the right opportunities in focus."
            />
            <div className={styles.twoFields}>
              <div className={styles.field}>
                <label htmlFor="pf-experienceYears">
                  Experience <span>Years</span>
                </label>
                <input
                  id="pf-experienceYears"
                  type="number"
                  min="0"
                  max="60"
                  step="any"
                  inputMode="decimal"
                  placeholder="e.g. 0 or 2.5"
                  value={draft.experienceYears}
                  onChange={(event) =>
                    change("experienceYears", event.target.value)
                  }
                  {...inputProps("experienceYears")}
                />
                <p>Just starting out? Enter 0.</p>
                {fieldError("experienceYears")}
              </div>
            </div>
            <fieldset className={styles.preferenceGroup}>
              <legend>Where would you like to work?</legend>
              <label>
                <input
                  id="pf-cities"
                  type="radio"
                  name="location-preference"
                  checked={draft.locationPreference === "all-india"}
                  onChange={() => {
                    change("locationPreference", "all-india");
                    change("targetLocations", []);
                  }}
                />
                All India
              </label>
              <label>
                <input
                  type="radio"
                  name="location-preference"
                  checked={draft.locationPreference === "selected"}
                  onChange={() => change("locationPreference", "selected")}
                />
                Choose preferred cities
              </label>
              {draft.locationPreference === "selected" && (
                <ProfileOptionPicker
                  id="pf-targetLocations"
                  label="Preferred cities"
                  options={options.cities}
                  values={draft.targetLocations}
                  limit={3}
                  onChange={(values) => change("targetLocations", values)}
                  error={errors.targetLocations}
                />
              )}
              <p className={styles.hint}>
                Preferences help rank jobs. Roles in other cities can still
                appear; remote roles do not need a matching office city.
              </p>
            </fieldset>
            <fieldset className={styles.modeGroup}>
              <legend>Preferred work mode</legend>
              <div>
                {[
                  { value: "unknown", label: "Any" },
                  { value: "onsite", label: "Onsite" },
                  { value: "hybrid", label: "Hybrid" },
                  { value: "remote", label: "Remote" },
                ].map((mode) => (
                  <label
                    key={mode.value}
                    className={
                      draft.remoteType === mode.value ? styles.selectedMode : ""
                    }
                  >
                    <input
                      type="radio"
                      name="work-mode"
                      value={mode.value}
                      checked={draft.remoteType === mode.value}
                      onChange={() => change("remoteType", mode.value)}
                    />
                    <span>{mode.label}</span>
                  </label>
                ))}
              </div>
              <p className={styles.hint}>
                Work mode helps rank your matches; it does not hide other
                opportunities.
              </p>
            </fieldset>
          </fieldset>
          <div className={styles.saveBar}>
            <div className={styles.saveStatus} role="status">
              <strong>
                {busy
                  ? "Saving your profile…"
                  : dirty
                    ? "Unsaved changes"
                    : saved
                      ? "Changes saved"
                      : "Your profile is up to date"}
              </strong>
              <span>
                {dirty
                  ? "You can save even if your profile is incomplete."
                  : "You can update these details any time."}
              </span>
            </div>
            <div className={styles.saveActions}>
              <button
                type="button"
                className={styles.secondary}
                disabled={locked || !dirty}
                onClick={discard}
              >
                Discard changes
              </button>
              <button
                type="submit"
                className={styles.primary}
                disabled={locked || !dirty}
              >
                {busy ? "Saving…" : "Save changes"}
              </button>
            </div>
            {saveError && (
              <p className={styles.saveError} role="alert">
                {saveError}
              </p>
            )}
            {saved && !dirty && (
              <Link href="/dashboard" className={styles.savedLink}>
                Go to dashboard <span aria-hidden="true">→</span>
              </Link>
            )}
          </div>
        </form>
      </div>
      <dialog
        ref={leaveDialog}
        className={styles.dialog}
        aria-labelledby="leave-title"
        onCancel={() => setLeaveTarget(null)}
        onClose={() => setLeaveTarget(null)}
      >
        <h2 id="leave-title">Leave without saving?</h2>
        <p>
          Your profile changes have not been saved. Stay here to finish, or
          discard them and leave.
        </p>
        <div className={styles.saveActions}>
          <button
            autoFocus
            type="button"
            className={styles.primary}
            onClick={() => setLeaveTarget(null)}
          >
            Keep editing
          </button>
          <button
            type="button"
            className={styles.secondary}
            onClick={() => {
              if (!leaveTarget) return;
              const url = new URL(leaveTarget);
              allowNavigation.current = true;
              setLeaveTarget(null);
              if (url.origin === window.location.origin)
                router.push(`${url.pathname}${url.search}${url.hash}`);
              else window.location.assign(url.href);
            }}
          >
            Discard & leave
          </button>
        </div>
      </dialog>
      <dialog
        ref={trackDialog}
        className={styles.dialog}
        aria-labelledby="track-title"
        onCancel={() => setTrackTarget(null)}
        onClose={() => setTrackTarget(null)}
      >
        <h2 id="track-title">Change engineering track?</h2>
        <p>
          Your selected roles belong to a different track and will be cleared.
          Your skills will stay selected.
        </p>
        <div className={styles.saveActions}>
          <button
            autoFocus
            type="button"
            className={styles.secondary}
            onClick={() => setTrackTarget(null)}
          >
            Keep current track
          </button>
          <button
            type="button"
            className={styles.primary}
            onClick={() => {
              if (trackTarget === null) return;
              change("techTrack", trackTarget);
              change("techRoles", []);
              change("rolePreference", "any");
              setTrackTarget(null);
            }}
          >
            Change track
          </button>
        </div>
      </dialog>
      <ProfileSettings user={user} disabled={busy} onBusy={setSettingsBusy} />
    </div>
  );
}

function SectionTitle({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className={styles.sectionTitle}>
      <span>{number}</span>
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
}
