# Decisions (frontend)

Durable choices. Shared with backend where noted; UI consequences live here.

## ADR-005 — Direct-to-production, no staging (2026-09-17, shared)

Vercel auto-deploys `main`; no staging env. Consequence: keep `main` green, branches + PRs (branch protection on), CI as the gate.

## ADR-006 — Single global navbar (2026-09-18)

One `Navbar` everywhere (links + Dashboard when authed, avatar menu); dashboard has no second nav. Reason: two navs looked broken and split auth state.

## ADR-007 — Public listings stay open for SEO (2026-09-18)

`/jobs`, `/engineering`, `/ai`, `/companies`, job detail stay public; only `/dashboard`/`/profile` require login. Auth pages excluded from sitemap, disallowed in robots. Reason: search traffic is the top of funnel.

## ADR-008 — Design system v2 (2026-09-17)

Navy/blue/cyan-purple, Inter, light surfaces; full spec in `docs/design/design-system.md`. No invented brand colors.

## ADR-009 — Cookie-session UX contract (2026-09-18)

`credentials:"include"` everywhere, silent refresh-once-and-retry, CSRF auto-handled, `safeNext` redirects, `useAuth` single session. Reason: invisible auth that survives the 15-min access window.
