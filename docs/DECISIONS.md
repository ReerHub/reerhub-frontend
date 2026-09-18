# Decisions (frontend)

Durable choices. Shared with backend where noted; UI consequences live here.

## ADR-005 — Direct-to-production, no staging (2026-09-17, SUPERSEDED by ADR-010)

Vercel auto-deploys `main`; no staging env. (Kept for history; staging now exists.)

## ADR-010 — Staging promotion flow (2026-09-19, supersedes ADR-005)

Branches merge to `develop` (auto-deploys staging: `staging.reerhub.com` + `staging-api`); after verification, `develop` merges to `main` (prod). Reason: PRs need a live proving ground. Consequence: staging is publicly reachable (SSO off) so `robots.ts` disallows everything there; staging env mirrors prod with staging hosts.

## ADR-006 — Single global navbar (2026-09-18)

One `Navbar` everywhere (links + Dashboard when authed, avatar menu); dashboard has no second nav. Reason: two navs looked broken and split auth state.

## ADR-007 — Public listings stay open for SEO (2026-09-18)

`/jobs`, `/engineering`, `/ai`, `/companies`, job detail stay public; only `/dashboard`/`/profile` require login. Auth pages excluded from sitemap, disallowed in robots. Reason: search traffic is the top of funnel.

## ADR-008 — Design system v2 (2026-09-17)

Navy/blue/cyan-purple, Inter, light surfaces; full spec in `docs/design/design-system.md`. No invented brand colors.

## ADR-009 — Cookie-session UX contract (2026-09-18)

`credentials:"include"` everywhere, silent refresh-once-and-retry, CSRF auto-handled, `safeNext` redirects, `useAuth` single session. Reason: invisible auth that survives the 15-min access window.
