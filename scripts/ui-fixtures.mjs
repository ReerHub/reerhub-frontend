// Local visual QA only: synthetic API, no database, email or payment-provider calls.
// Open http://127.0.0.1:3001/api/v1/fixture after starting this script.
import http from "node:http";
import { spawn } from "node:child_process";
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
  locations: [{ city: "Bengaluru" }],
  skills: ["Node.js", "MongoDB"],
  remoteType: "hybrid",
  firstSeenAt: new Date().toISOString(),
  status: "active",
  sourceUrl: "https://example.com/jobs/1",
  fit: {
    score: 86,
    reasons: [
      "Matches your Node.js skills",
      "Aligned with your preferred location",
      "Matches your experience",
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
      res.writeHead(302, {
        "Set-Cookie": [
          `fixtureState=${chosen}; Path=/; SameSite=Lax`,
          `accessToken=${chosen === "anonymous" ? "" : "fixture-only"}; Path=/; HttpOnly; SameSite=Lax`,
        ],
        Location: chosen === "anonymous" ? "/jobs" : "/dashboard",
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
      currentRole: "Backend Engineer",
      techTrack: "software",
      skills: ["Node.js", "MongoDB"],
      experienceYears: 4,
      city: "Bengaluru",
      remoteType: "hybrid",
    },
    notificationPreferences: { digest: paused ? "paused" : "daily" },
    membership: { isPro: pro, subscription },
  };
  let body = "";
  for await (const chunk of req) body += chunk;
  const data = body ? JSON.parse(body) : {};
  const json = (value, status = 200, meta) => {
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({ success: status < 400, data: value, pagination: meta }),
    );
  };
  if (path === "/auth/csrf") return json({ csrfToken: "fixture-csrf" });
  if (path === "/users/me") {
    if (state === "anonymous") return json(null, 401);
    if (req.method === "PATCH") {
      paused = data.notificationPreferences?.digest === "paused";
      user.notificationPreferences.digest = paused ? "paused" : "daily";
    }
    return json(user);
  }
  if (path === "/billing") return json({ subscription });
  if (path === "/recommendations")
    return json(
      { profileCompletion: 100, jobs: hidden ? [] : [job] },
      pro ? 200 : 403,
    );
  if (path.includes("/feedback")) {
    if (data.feedback === "not_relevant") hidden = true;
    return json({ feedback: data.feedback });
  }
  if (path === "/users/me/saved/ids") return json(saved);
  if (path === "/users/me/saved")
    return json(saved.length ? [job] : [], 200, { totalPages: 1 });
  if (path.startsWith("/users/me/saved/")) {
    saved = req.method === "DELETE" ? [] : [job._id];
    return json({ saved: saved.length > 0 });
  }
  if (path === "/companies") return json([company]);
  if (path === "/jobs")
    return json([job], 200, { total: 1, totalPages: 1, page: 1 });
  return json(null, 404);
});
server.listen(8801, "127.0.0.1", () => {
  const child = spawn(
    process.execPath,
    [
      "node_modules/next/dist/bin/next",
      "dev",
      "--webpack",
      "--port",
      "3001",
      "--hostname",
      "127.0.0.1",
    ],
    {
      stdio: "inherit",
      env: {
        ...process.env,
        REERHUB_UI_FIXTURES: "1",
        API_URL: "http://127.0.0.1:8801/api/v1",
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
