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

## ADR-011 — Teaser gating, SEO dies by design (2026-09-20, reverses ADR-007)

Lists show title/company/chips/location/date only; detail shows an excerpt plus a login wall. Full description, skills, Apply, and saves need a session. Anonymous and crawler views are identical (no cloaking). Reason: registration wall is the growth lever; search traffic is sacrificed deliberately. Consequence: detail SSR forwards cookies so members still get full content server-side; JSON-LD carries only the visible excerpt.

## ADR-012 — Slug job URLs + -jobs location paths (2026-09-20)
Job URLs are `/jobs/{title}-{company}-{id}` (id is the lookup key; backend untouched). Bare `/jobs/<id>` links 308 to the canonical slug. Track paths are `/engineering-jobs` + `/ai-jobs` (old paths 308); city paths are `/<city>-jobs` (Bengaluru/Chennai/Hyderabad/Mumbai/Delhi/Pune) + `/remote-jobs`, with thin markets (< 5 roles) showing "expanding soon" + recommended roles. Reason: readable URLs for sharing/SEO without backend changes. Consequence: sitemap, cards, and footer all emit slug URLs; `/llms.txt` documents the surface for AI consumers.

## ADR-013 — Proxy, not middleware (2026-09-24)

`middleware.ts` renamed to `proxy.ts` (`export function proxy`). Reason: Next 16 deprecates the middleware convention. Consequence: nothing behavioral; guards still cover `/dashboard` + `/profile`.

## ADR-014 — Passwordless-only auth UI (2026-09-24)

Login is Google + magic-link email; `/signup`, `/forgot-password`, `/reset-password` redirect to `/login`. Reason: matches backend (passwords 410); one screen converts better. Consequence: profile keeps a password-change section for legacy email accounts only.

## ADR-015 — Pro billing: 3 plans, 7-day trial (2026-09-30)

`/billing` offers weekly ₹49 / monthly ₹149 (preselected, "Most popular") / quarterly ₹299 ("Best value", 33% off), each with a 7-day trial; checkout posts `{ planId }`. Trial-steps, assurances, and a final CTA banner sit below the fold for prospects only. Reason: weekly bridges trial→paid, monthly is the default, quarterly locks a search cycle. Consequence: copy must stay in sync with backend `TRIAL_DAYS` and `BILLING_PLANS`.

## ADR-016 — Homepage motion system (2026-09-30)

Company marquee (CSS-only infinite loop, pause on hover/focus) + `Reveal` (one-shot scroll entrances) + `CountUp` (late data remounts the animation) + staggered hero. Reason: motion is the conversion lever on marketing pages; dashboard stays still. Consequence: all motion disabled under `prefers-reduced-motion`; counters must handle async data (never lock on initial zero).

## ADR-021 — Discovery-first UI and coherent Pro workspace (2026-10-07)

The v3.1 visual system replaces the looping homepage marquee with finite entrances and a clearly labelled illustrative match panel. One navigation/footer and shared page/card patterns cover public, account and membership routes. Anonymous previews explicitly explain the free sign-in unlock; mobile job details put Apply/sign-in directly after the summary. Free users get manual discovery and saved roles; only Pro renders the ranked recommendations workspace. Dashboard discovery filters preserve `view=discover`. Billing success polls membership briefly and offers retry without claiming active access while confirmation is pending. Existing Razorpay pricing, plan IDs, backend matching and entitlement enforcement are unchanged by this redesign.

## ADR-017 — Node 24 LTS baseline (2026-09-30, shared with backend)

Same as backend ADR-014: `.nvmrc`/`engines`/CI/shell default all 24. Holds: `typescript@6` (TS 7 unsupported by typescript-eslint, retry at >=7.1) and `eslint@9` (v10 breaks the bundled react plugin). Reason: latest LTS; Node 20 crashes on jsdom. Consequence: Vercel dashboard must also pin 24.

## ADR-022 — Explicit cancellation and isolated UI checks (2026-10-07)

Billing, cancellation confirmation and terms disclose non-refundable subscription payments and remaining-period access; authorization amounts are distinct. Membership badges and screens honor the backend's `isPro`, `accessEndsAt` and `cancelAtPeriodEnd`. Pending-plan conflicts require an explicit selection rather than silently switching checkout. Turnstile configuration/script failures block submission with an actionable retry. For repeatable local QA, `npm run test:ui:fixtures` serves synthetic membership states at `http://127.0.0.1:3001/api/v1/fixture`, backed only by an in-memory loopback API. It never connects to a database, sends email or initiates payment; it is not a replacement for staging provider tests.
