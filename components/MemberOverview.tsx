"use client";
import { useEffect, useState } from "react";
import Link from "@/components/AppLink";
import { useAuth } from "@/components/AuthProvider";
import {
  getRecommendations,
  getSavedJobs,
  type Recommendation,
} from "@/lib/auth";
import {
  listJobsWithMeta,
  jobUrl,
  catalogMetadata,
  type CatalogMetadata,
  type Job,
} from "@/lib/reerhub";
import { useSavedJobs, useSavedJobsStatus, loadSaved } from "@/lib/saved-store";
import { profileSignals } from "@/lib/profile-readiness";
import { isPro, planLabel, membershipDate } from "@/lib/membership";
import CatalogNotice, { catalogInitializing } from "@/components/CatalogNotice";
import CompanyLogo from "@/components/CompanyLogo";
import Icon from "@/components/ui/Icon";

type Feed = CatalogMetadata & {
  state: "loading" | "ready" | "error";
  jobs: (Job | Recommendation)[];
  count?: number;
  ready?: boolean;
};
function RolePreview({ job }: { job: Job | Recommendation }) {
  return (
    <Link href={jobUrl(job)} prefetch={false} className="overview-role">
      <CompanyLogo
        name={job.companyId?.name || "Company"}
        logoUrl={job.companyId?.logoUrl}
      />
      <div>
        <strong>{job.title}</strong>
        <span>{job.companyId?.name || "Company"}</span>
      </div>
      <Icon name="arrow" className="h-4 w-4 shrink-0" />
    </Link>
  );
}
export default function MemberOverview() {
  const { user } = useAuth();
  const ids = useSavedJobs(user?.id),
    savedStatus = useSavedJobsStatus(user?.id);
  const pro = isPro(user);
  const [roles, setRoles] = useState<Feed>({ state: "loading", jobs: [] });
  const [saved, setSaved] = useState<Feed>({ state: "loading", jobs: [] });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!user) return;
    let active = true;
    const controller = new AbortController();
    const read = pro
      ? getRecommendations(75, controller.signal, "qualified").then((data) => ({
          state: "ready" as const,
          jobs: data.jobs.slice(0, 3),
          count: data.matchCounts["75"],
          ready: data.profileReady,
          ...catalogMetadata(data),
        }))
      : listJobsWithMeta(
          { limit: 3, locationScope: "india" },
          controller.signal,
        ).then((data) => ({
          state: "ready" as const,
          jobs: data.jobs.slice(0, 3),
          ...catalogMetadata(data),
        }));
    read
      .then((value) => {
        if (active) setRoles(value);
      })
      .catch(() => {
        if (active) setRoles({ state: "error", jobs: [] });
      });
    getSavedJobs(1, controller.signal)
      .then((data) => {
        if (active) setSaved({ state: "ready", jobs: data.data.slice(0, 3) });
      })
      .catch(() => {
        if (active) setSaved({ state: "error", jobs: [] });
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [user, pro, attempt]);
  if (!user) return null;
  const signals = profileSignals(user.profile),
    completed = signals.filter((s) => s.complete).length;
  const sub = user.membership?.subscription;
  const retry = () => {
    setRoles({ state: "loading", jobs: [] });
    setSaved({ state: "loading", jobs: [] });
    void loadSaved(true);
    setAttempt((n) => n + 1);
  };
  const countLabel =
    roles.state !== "ready"
      ? roles.state === "error"
        ? "Unavailable"
        : "…"
      : roles.ready === false
        ? "Finish profile"
        : (roles.count ?? "Unavailable");
  const summaries = [
    {
      label: "Saved roles",
      value:
        savedStatus === "ready"
          ? ids.length
          : savedStatus === "error"
            ? "Unavailable"
            : "…",
      note: "Your shortlist",
      href: "/dashboard/saved",
      icon: "bookmark" as const,
    },
    {
      label: "Profile essentials",
      value: `${completed} / ${signals.length}`,
      note:
        completed === signals.length
          ? "Your preferences are saved"
          : "A little context goes a long way",
      href: "/dashboard/profile",
      icon: "user" as const,
    },
    {
      label: "Membership",
      value: pro ? "Pro" : "Free",
      note: pro ? planLabel(sub?.plan) : "Free to browse and apply",
      href: "/dashboard/billing",
      icon: "shield" as const,
    },
    {
      label: pro ? "Verified profile matches" : "Personalized direction",
      value: pro ? countLabel : "Explore Pro",
      note: pro
        ? "75%+ relevance · not hiring probability"
        : "Matching built around your skills",
      href: "/dashboard/matches",
      icon: "spark" as const,
    },
  ];
  return (
    <div className="overview-page page-container">
      <header className="overview-heading">
        <div>
          <p className="workspace-label">YOUR NEXT CHAPTER</p>
          <h1>Good to see you, {user.name.split(" ")[0]}.</h1>
          <p>Your search, your shortlist, your next step—all in one place.</p>
        </div>
        <Link href="/dashboard/jobs" className="btn-primary">
          Explore jobs <Icon name="arrow" className="h-4 w-4" />
        </Link>
      </header>
      <div className="overview-summaries">
        {summaries.map(({ label, value, note, href, icon }) => (
          <Link key={label} href={href} className="overview-summary">
            <div>
              <span>{label}</span>
              <Icon name={icon} className="h-5 w-5" />
            </div>
            <strong>{value}</strong>
            <small>{note}</small>
          </Link>
        ))}
      </div>
      <div className="overview-grid">
        <section className="overview-next">
          <p className="workspace-label">A CLEAR NEXT STEP</p>
          <h2>
            {completed < signals.length
              ? "Make your search more personal."
              : pro
                ? "Find where your skills belong."
                : "Your next possibility is out there."}
          </h2>
          <p>
            {completed < signals.length
              ? `Start with ${signals.find((s) => !s.complete)?.label.toLowerCase()}. You can browse and save jobs while you finish.`
              : pro
                ? "Review the reasons behind your matches, then explore the employer’s official opening."
                : "Explore real company openings. Keep the roles worth coming back to."}
          </p>
          <Link
            href={
              completed < signals.length
                ? "/dashboard/profile"
                : pro
                  ? "/dashboard/matches"
                  : "/dashboard/jobs"
            }
            className="btn-primary"
          >
            {completed < signals.length
              ? "Complete your profile"
              : pro
                ? "See your matches"
                : "Find jobs"}
          </Link>
          {pro && membershipDate(sub) && (
            <small>
              {sub?.cancelAtPeriodEnd ? "Access ends" : "Next membership date"}{" "}
              · {membershipDate(sub)}
            </small>
          )}
        </section>
        <section className="overview-panel">
          <div className="overview-panel-heading">
            <h2>Worth coming back to</h2>
            <Link href="/dashboard/saved">View saved ↗</Link>
          </div>
          {saved.state === "loading" ? (
            <p role="status">Loading your shortlist…</p>
          ) : saved.state === "error" ? (
            <div>
              <p>Your saved roles couldn’t load.</p>
              <button className="btn-secondary mt-3" onClick={retry}>
                Try again
              </button>
            </div>
          ) : saved.jobs.length ? (
            saved.jobs.map((job) => <RolePreview key={job._id} job={job} />)
          ) : (
            <div className="overview-empty">
              <Icon name="bookmark" />
              <h3>A little room for possibility.</h3>
              <p>Save a role that feels right. You’ll find it here.</p>
              <Link href="/dashboard/jobs">Explore jobs ↗</Link>
            </div>
          )}
        </section>
        <section className="overview-panel overview-opportunities">
          <div className="overview-panel-heading">
            <h2>{pro ? "Where your skills fit" : "Openings to explore"}</h2>
            <Link href={pro ? "/dashboard/matches" : "/dashboard/jobs"}>
              View all ↗
            </Link>
          </div>
          <CatalogNotice data={roles} />
          {roles.state === "loading" ? (
            <p role="status">Finding available roles…</p>
          ) : roles.state === "error" ? (
            <div>
              <p>These roles couldn’t load.</p>
              <button className="btn-secondary mt-3" onClick={retry}>
                Try again
              </button>
            </div>
          ) : catalogInitializing(roles) ? null : roles.ready === false ? (
            <div className="overview-empty">
              <h3>A little more context first.</h3>
              <p>
                Complete your matching preferences to see personalized
                recommendations.
              </p>
              <Link href="/dashboard/profile">Complete your profile ↗</Link>
            </div>
          ) : roles.jobs.length ? (
            roles.jobs.map((job) => <RolePreview key={job._id} job={job} />)
          ) : (
            <div className="overview-empty">
              <h3>
                {pro
                  ? "No verified strong matches yet."
                  : "No current openings here yet."}
              </h3>
              <p>
                {pro
                  ? "Your profile is saved. Available matches depend on current employer openings."
                  : "Explore the company directory or try again later."}
              </p>
              <Link href="/dashboard/companies">Explore companies ↗</Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
