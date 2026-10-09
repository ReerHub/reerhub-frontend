// Local visual QA only: synthetic API, no database, email or payment-provider calls.
// Open http://127.0.0.1:3001/api/v1/fixture after starting this script.
import http from "node:http";
import { readFile } from "node:fs/promises";
// Synthetic snapshot of the backend catalog; keeps this harness self-contained.
// The actual product always fetches the backend-owned /profile-options endpoint.
const PROFILE_OPTIONS = JSON.parse(
  await readFile(
    new URL("./fixtures/profile-options.json", import.meta.url),
    "utf8",
  ),
);
import { spawn } from "node:child_process";
const frontendPort = process.env.FIXTURE_PORT || "3001";
const apiPort = process.env.FIXTURE_API_PORT || "8801";
if (process.env.NODE_ENV === "production")
  throw new Error("Fixtures cannot run in production");
const cases = [
  "anonymous",
  "free",
  "trialing",
  "active",
  "cancelled",
  "past_due",
  "expired",
  "pending",
];
let paused = false;
let saved = [];
let hidden = false;
let profilePatch = {};
let profileName;
let profileMode = "partial";
let dashboardMode = "populated";
let fixtureDelay = 0;
let fixtureRequests = { recommendations: 0, saves: 0, feedback: 0 };
const company = {
  _id: "111111111111111111111111",
  name: "Fixture Labs",
  slug: "fixture-labs",
  website: "https://example.com",
  careersUrl: "https://example.com/careers",
  activeJobs: 1,
};
const job = {
  _id: "222222222222222222222222",
  title: "Senior Backend Engineer",
  companyId: company,
  techTrack: "software",
  techRole: "Backend Engineer",
  locations: [{ city: "Bengaluru", country: "India" }],
  description:
    "<p>Build reliable APIs and distributed backend services. Collaborate with engineering teams using Node.js, MongoDB and TypeScript.</p>",
  applicationUrl: "https://example.com/apply",
  postedAt: "2025-01-01T00:00:00.000Z",
  updatedAt: "2025-01-02T00:00:00.000Z",
  skills: ["Node.js", "MongoDB", "TypeScript"],
  experience: { min: 2, max: 6 },
  remoteType: "hybrid",
  firstSeenAt: new Date().toISOString(),
  status: "active",
  sourceUrl: "https://example.com/jobs/1",
  fit: {
    relevanceScore: 86,
    score: 86,
    evidenceCount: 4,
    reasons: [
      "Matches your Node.js skills",
      "Aligned with your preferred location",
      "Matches your experience",
      "Matches your software track",
    ],
  },
};
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://127.0.0.1:8801");
  const path = url.pathname.replace("/api/v1", "");
  const state =
    /fixtureState=([^;]+)/.exec(req.headers.cookie || "")?.[1] || "anonymous";
  if (path === "/fixture") {
    const chosen = url.searchParams.get("state");
    if (chosen && cases.includes(chosen)) {
      paused = false;
      saved = [];
      hidden = false;
      profilePatch = {};
      profileName = undefined;
      profileMode = url.searchParams.get("profile") || "partial";
      dashboardMode = url.searchParams.get("dashboard") || "populated";
      fixtureDelay = Math.min(Number(url.searchParams.get("delay")) || 0, 5000);
      fixtureRequests = { recommendations: 0, saves: 0, feedback: 0 };
      if (dashboardMode === "saved-pages")
        saved = Array.from({ length: 22 }, (_, i) =>
          String(i + 200).padStart(24, "0"),
        );
      res.writeHead(302, {
        "Set-Cookie": [
          `fixtureState=${chosen}; Path=/; SameSite=Lax`,
          `accessToken=${chosen === "anonymous" ? "" : "fixture-only"}; Path=/; HttpOnly; SameSite=Lax`,
        ],
        Location:
          chosen === "anonymous"
            ? "/jobs"
            : url.searchParams.has("profile") &&
                !url.searchParams.has("dashboard")
              ? "/profile"
              : "/dashboard",
      });
      res.end();
      return;
    }
    res.setHeader("Content-Type", "text/html");
    res.end(
      `<h1>Local UI fixtures</h1><p>Synthetic accounts; no payments or emails.</p>${cases.map((value) => `<p><a href="?state=${value}">${value}</a></p>`).join("")}`,
    );
    return;
  }
  const now = Date.now();
  const end = new Date(
    now + (state === "expired" ? -1 : 7) * 86400000,
  ).toISOString();
  const pro = ["trialing", "active", "cancelled"].includes(state);
  const subscription = ["anonymous", "free"].includes(state)
    ? null
    : {
        plan: "pro-monthly",
        status: state,
        isPro: pro,
        accessEndsAt: end,
        trialEndsAt: end,
        currentPeriodEndsAt: end,
        cancelAtPeriodEnd: state === "cancelled",
        cancelledAt:
          state === "cancelled" ? new Date().toISOString() : undefined,
        payments: [],
      };
  const user = {
    id: "fixture-user",
    name: "Asha Fixture",
    email: "asha@example.com",
    authProvider: "google",
    role: "user",
    emailVerified: true,
    profile: {
      headline: "Backend engineer",
      rolePreference: "selected",
      techRoles: ["Backend Engineer"],
      techTrack: "software",
      skills: ["Node.js", "MongoDB"],
      experienceYears: 4,
      locationPreference: "selected",
      targetLocations: ["Bengaluru"],
      remoteType: "hybrid",
    },
    notificationPreferences: { digest: paused ? "paused" : "daily" },
    membership: { isPro: pro, subscription },
  };
  if (profileMode === "empty") user.profile = {};
  if (profileMode === "complete") user.profile.skills.push("TypeScript");
  user.profile = { ...user.profile, ...profilePatch };
  if (profileName !== undefined) user.name = profileName;
  let body = "";
  for await (const chunk of req) body += chunk;
  const data = body ? JSON.parse(body) : {};
  const json = (value, status = 200, meta) => {
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({ success: status < 400, data: value, pagination: meta }),
    );
  };
  // Explicit admin fixture entry point; never talks to a real database or Google.
  if (path === "/fixture-admin") {
    const mode = url.searchParams.get("state") || "populated";
    res.writeHead(302, {
      "Set-Cookie": `adminFixture=${encodeURIComponent(mode)}; Path=/; SameSite=Lax`,
      Location: "/admin/dashboard",
    });
    return res.end();
  }
  if (path.startsWith("/admin/")) {
    const mode = /adminFixture=([^;]+)/.exec(req.headers.cookie || "")?.[1];
    if (!mode || mode === "denied") return json(null, 403);
    if (path === "/admin/auth/session" || path === "/admin/auth/refresh")
      return json({
        id: "fixture-admin",
        name: "Asha Operator",
        email: "operator@example.com",
        role: "admin",
      });
    if (path === "/admin/auth/logout") return json({ loggedOut: true });
    if (mode === "error") return json(null, 503);
    const id = (n) => String(n).padStart(24, "0");
    const companies =
      mode === "empty"
        ? []
        : Array.from({ length: 32 }, (_, i) => ({
            ...company,
            _id: id(i + 1),
            name: i ? `Product Company ${i + 1}` : "Fixture Labs",
            slug: `company-${i + 1}`,
            industry: "Software & technology",
            isActive: i % 5 !== 0,
            country: "India",
          }));
    const sources =
      mode === "empty"
        ? []
        : ["success", "failed", "running", "inactive"].map((status, i) => ({
            _id: id(i + 100),
            name: `${companies[i].name} · careers`,
            companyId: companies[i],
            type: "greenhouse",
            careersUrl: company.careersUrl,
            config: { boardToken: "fixture" },
            isActive: status !== "inactive",
            isStale: status === "failed",
            latestRun: {
              status,
              errors:
                status === "failed"
                  ? [
                      "Official source returned HTTP 503. Existing openings were preserved.",
                    ]
                  : [],
            },
            lastSuccessfulSyncAt: new Date(
              Date.now() - (status === "failed" ? 40 : 2) * 3600000,
            ).toISOString(),
            syncClaimedUntil:
              status === "running"
                ? new Date(Date.now() + 3600000).toISOString()
                : null,
          }));
    const audits =
      mode === "empty"
        ? []
        : Array.from({ length: 30 }, (_, i) => ({
            _id: id(i + 300),
            action: i % 2 ? "company.updated" : "source.sync_triggered",
            entityType: i % 2 ? "company" : "job-source",
            entityId: id(i + 1),
            adminId: { name: "Asha Operator", email: "operator@example.com" },
            createdAt: new Date(Date.now() - i * 3600000).toISOString(),
            before: { isActive: false },
            after: { isActive: true },
          }));
    const page = (rows) => {
      const current = Number(url.searchParams.get("page") || 1);
      const limit = Number(url.searchParams.get("limit") || 25);
      return json(rows.slice((current - 1) * limit, current * limit), 200, {
        page: current,
        limit,
        total: rows.length,
        totalPages: Math.ceil(rows.length / limit),
      });
    };
    if (path === "/admin/overview")
      return json({
        counts: {
          companies: companies.length,
          activeCompanies: companies.filter((c) => c.isActive).length,
          activeJobs: mode === "empty" ? 0 : 284,
          users: mode === "empty" ? 0 : 128,
        },
        sourceHealth: { staleSources: sources.filter((s) => s.isStale).length },
        subscriptions:
          mode === "empty"
            ? {}
            : { active: 18, trialing: 7, pending: 3, cancelled: 2 },
        failedSyncs: sources
          .filter((s) => s.isStale)
          .map((s) => ({
            _id: s._id,
            sourceId: s,
            companyId: s.companyId,
            status: "failed",
            startedAt: new Date().toISOString(),
            errors: s.latestRun.errors,
          })),
        recentAudit: audits.slice(0, 5),
      });
    if (path === "/admin/operations" || path === "/admin/operations/rows") {
      const day =
        url.searchParams.get("date") ||
        new Date(Date.now() + 19800000).toISOString().slice(0, 10);
      const time = new Date(`${day}T08:00:00+05:30`).toISOString();
      const empty = mode === "empty";
      const kinds = ["created", "updated", "reopened", "closed"];
      const changes = empty
        ? []
        : Array.from({ length: 32 }, (_, i) => ({
            _id: id(i + 700),
            type: kinds[i % 4],
            detectedAt: time,
            jobId: {
              _id: job._id,
              title: job.title,
              companyId: company,
              sourceId: { name: "Fixture Greenhouse" },
            },
            changes:
              i % 4 === 1
                ? { title: { old: "Backend Engineer", new: job.title } }
                : {},
          }));
      const emails = empty
        ? []
        : ["delivered", "failed", "review", "sending"].map((status, i) => ({
            _id: id(i + 800),
            status,
            attemptedAt: time,
            deliveredAt: i === 0 ? time : undefined,
            userId: { name: "Synthetic Member", email: "member@example.com" },
            jobIds: [job],
          }));
      const syncs = empty
        ? []
        : ["success", "partial", "failed"].map((status, i) => ({
            _id: id(i + 850),
            status,
            startedAt: time,
            completedAt: time,
            sourceId: { name: "Fixture Greenhouse" },
            companyId: company,
            stats: {
              fetched: 40,
              newJobs: 8,
              updatedJobs: 16,
              closedJobs: 8,
              unchangedJobs: 8,
            },
            errors:
              i === 2 ? ["Official feed unavailable; jobs preserved."] : [],
            warnings: i === 1 ? ["Some listings could not be parsed."] : [],
          }));
      if (path === "/admin/operations")
        return json({
          day,
          timezone: "Asia/Kolkata",
          generatedAt: new Date().toISOString(),
          changes: Object.fromEntries(kinds.map((key) => [key, empty ? 0 : 8])),
          syncs: {
            running: 0,
            success: empty ? 0 : 1,
            partial: empty ? 0 : 1,
            failed: empty ? 0 : 1,
          },
          deliveries: {
            delivered: empty ? 0 : 1,
            failed: empty ? 0 : 1,
            review: empty ? 0 : 1,
            sending: empty ? 0 : 1,
          },
          digestRun: empty
            ? null
            : {
                status: "completed",
                startedAt: time,
                completedAt: time,
                summary: {
                  evaluated: 12,
                  sent: 1,
                  failed: 1,
                  reviewRequired: 1,
                  skipped: {
                    unverifiedEmail: 1,
                    preference: 2,
                    incompleteProfile: 3,
                    existingDelivery: 1,
                    noQualifiedUnseenMatches: 3,
                  },
                },
              },
          scheduler: {
            enabled: true,
            sourceTimes: ["06:00–06:14", "20:00–20:14"],
            digestTime: "08:00",
            tasks: [
              {
                key: "daily-match-digest",
                dueAt: new Date(Date.now() + 86400000).toISOString(),
                lastCompletedAt: time,
              },
            ],
          },
        });
      const kind = url.searchParams.get("kind") || "changes",
        status = url.searchParams.get("status");
      const rows =
        kind === "changes"
          ? changes
          : kind === "emails"
            ? emails
            : kind === "syncs"
              ? syncs
              : sources.map((source) => ({
                  ...source,
                  nextScheduledSyncAt: new Date(
                    Date.now() + 3600000,
                  ).toISOString(),
                }));
      return page(
        rows.filter((row) => !status || (row.type || row.status) === status),
      );
    }
    if (req.method === "POST" || req.method === "PATCH")
      return json({ ...data, _id: id(900), status: "success" });
    if (path === "/admin/companies") {
      const q = (url.searchParams.get("q") || "").toLowerCase();
      const active = url.searchParams.get("active");
      return page(
        companies.filter(
          (c) =>
            c.name.toLowerCase().includes(q) &&
            (!active || String(c.isActive) === active),
        ),
      );
    }
    if (path === "/admin/sources") return json(sources);
    if (path === "/admin/sync-logs")
      return json([
        {
          _id: id(600),
          status: "success",
          startedAt: new Date().toISOString(),
          errors: [],
        },
        {
          _id: id(601),
          status: "failed",
          startedAt: new Date(Date.now() - 86400000).toISOString(),
          errors: ["Official feed unavailable; jobs preserved."],
        },
      ]);
    if (path === "/admin/jobs") {
      const q = (url.searchParams.get("q") || "").toLowerCase();
      const status = url.searchParams.get("status");
      return page(
        mode === "empty"
          ? []
          : Array.from({ length: 36 }, (_, i) => ({
              ...job,
              _id: id(i + 200),
              title: i % 2 ? "Frontend Engineer" : "Senior Backend Engineer",
              techRole: "Software Engineer",
              postedAt: new Date().toISOString(),
              status: i % 4 ? "active" : "closed",
              experience: { min: 2, max: 5 },
            })).filter(
              (j) =>
                j.title.toLowerCase().includes(q) &&
                (!status || j.status === status),
            ),
      );
    }
    if (path.startsWith("/admin/jobs/"))
      return json({
        ...job,
        _id: path.split("/").at(-1),
        experience: { min: 2, max: 5 },
        raw: {
          title: job.title,
          department: "Engineering",
          source: "fixture only",
        },
      });
    if (path === "/admin/users") {
      const q = (url.searchParams.get("q") || "").toLowerCase();
      return page(
        mode === "empty"
          ? []
          : Array.from({ length: 31 }, (_, i) => ({
              ...user,
              _id: id(i + 400),
              name: `Member ${i + 1}`,
              email: `member${i + 1}@example.com`,
              createdAt: new Date().toISOString(),
            })).filter((u) => `${u.name} ${u.email}`.toLowerCase().includes(q)),
      );
    }
    if (path === "/admin/subscriptions") {
      const status = url.searchParams.get("status");
      return page(
        mode === "empty"
          ? []
          : [
              "active",
              "trialing",
              "cancelled",
              "past_due",
              "expired",
              "pending",
            ]
              .map((s, i) => ({
                _id: id(i + 500),
                plan: "pro-monthly",
                status: s,
                userId: {
                  name: `Member ${i + 1}`,
                  email: `member${i + 1}@example.com`,
                },
                currentPeriodEndsAt: end,
                cancelAtPeriodEnd: s === "cancelled",
              }))
              .filter((s) => !status || s.status === status),
      );
    }
    if (path === "/admin/audit-logs") return page(audits);
  }
  if (path === "/auth/csrf") return json({ csrfToken: "fixture-csrf" });
  if (path === "/profile-options") return json(PROFILE_OPTIONS);
  if (path === "/users/me") {
    if (state === "anonymous") return json(null, 401);
    if (req.method === "PATCH") {
      if (profileMode === "error") return json(null, 503);
      if (data.notificationPreferences)
        paused = data.notificationPreferences.digest === "paused";
      if (data.name !== undefined) profileName = data.name;
      const fields = Object.fromEntries(
        Object.entries(data).filter(
          ([key]) => !["name", "notificationPreferences"].includes(key),
        ),
      );
      profilePatch = { ...profilePatch, ...fields };
      user.profile = { ...user.profile, ...fields };
      if (data.name !== undefined) user.name = data.name;
      user.notificationPreferences.digest = paused ? "paused" : "daily";
    }
    return json(user);
  }
  if (path === "/billing") return json({ subscription });
  if (path === "/fixture-stats") return json(fixtureRequests);
  if (path === "/recommendations") {
    fixtureRequests.recommendations++;
    if (fixtureDelay)
      await new Promise((resolve) => setTimeout(resolve, fixtureDelay));
    if (dashboardMode === "error") return json(null, 503);
    const missing = [
      !user.profile.techTrack && "tech track",
      !(
        user.profile.rolePreference === "any" || user.profile.techRoles?.length
      ) && "role preferences",
      !(user.profile.skills?.length >= 3) && "three skills",
      !Number.isFinite(user.profile.experienceYears) && "experience years",
      !(
        user.profile.locationPreference === "all-india" ||
        user.profile.targetLocations?.length
      ) && "location preferences",
    ].filter(Boolean);
    const ready = missing.length === 0;
    const candidate = {
      ...job,
      fit: {
        ...job.fit,
        relevanceScore: dashboardMode === "threshold-empty" ? 62 : 86,
      },
    };
    const available = ready && !hidden && dashboardMode !== "all-empty";
    const minimumScore = Number(url.searchParams.get("minScore") || 75);
    return json(
      {
        profileCompletion: (5 - missing.length) * 20,
        profileReady: ready,
        missingProfileFields: missing,
        minimumRelevanceScore: minimumScore,
        highMatchScore: 75,
        matchCounts: {
          90: 0,
          75: available && candidate.fit.relevanceScore >= 75 ? 1 : 0,
          50: available ? 1 : 0,
          25: available ? 1 : 0,
          all: available ? 1 : 0,
        },
        jobs:
          !available ||
          (minimumScore && candidate.fit.relevanceScore < minimumScore)
            ? []
            : [candidate],
      },
      pro ? 200 : 403,
    );
  }
  if (path.includes("/feedback")) {
    fixtureRequests.feedback++;
    if (fixtureDelay)
      await new Promise((resolve) => setTimeout(resolve, fixtureDelay));
    if (!pro) return json(null, 403);
    if (dashboardMode === "feedback-error") return json(null, 503);
    if (data.feedback === "not_relevant") hidden = true;
    return json({ feedback: data.feedback });
  }
  if (path === "/users/me/saved/ids") return json(saved);
  if (path === "/users/me/saved") {
    if (dashboardMode === "saved-error") return json(null, 503);
    const page = Number(url.searchParams.get("page") || 1);
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(
      JSON.stringify({
        data: saved
          .slice((page - 1) * 21, page * 21)
          .map((_id) => ({ ...job, _id })),
        meta: { totalPages: Math.max(1, Math.ceil(saved.length / 21)) },
      }),
    );
  }
  if (path.startsWith("/users/me/saved/")) {
    fixtureRequests.saves++;
    if (fixtureDelay)
      await new Promise((resolve) => setTimeout(resolve, fixtureDelay));
    if (dashboardMode === "save-error") return json(null, 503);
    const jobId = path.split("/").at(-1);
    saved =
      req.method === "DELETE"
        ? saved.filter((id) => id !== jobId)
        : [...new Set([...saved, jobId])];
    return json({ saved: saved.length > 0 });
  }
  if (path === "/companies") return json([company]);
  if (path === "/companies/fixture-labs") return json(company);
  if (path === "/jobs/sitemap") return json([job]);
  if (path === `/jobs/${job._id}`) return json(job);
  if (path === "/jobs/333333333333333333333333")
    return json({ ...job, _id: "333333333333333333333333", status: "closed" });
  if (path === "/jobs")
    return json([job], 200, { total: 1, totalPages: 1, page: 1 });
  return json(null, 404);
});
server.listen(Number(apiPort), "127.0.0.1", () => {
  const child = spawn(
    process.execPath,
    [
      "node_modules/next/dist/bin/next",
      "dev",
      "--webpack",
      "--port",
      frontendPort,
      "--hostname",
      "127.0.0.1",
    ],
    {
      stdio: "inherit",
      env: {
        ...process.env,
        REERHUB_UI_FIXTURES: "1",
        API_URL: `http://127.0.0.1:${apiPort}/api/v1`,
        GOOGLE_CLIENT_ID: "",
        TURNSTILE_SITE_KEY: "",
      },
    },
  );
  const stop = () => {
    child.kill("SIGTERM");
    server.close();
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
  child.on("exit", () => server.close());
});
