# 02 — Frontend (`app/`, `components/`, `lib/`)

## Routes

- `/` marketing (hero, hiring-now, How-it-works, Why, CTA → `/signup`).
- `/jobs` (+ `?q&companyId&city&remoteType&techTrack&techRole&skills&indiaOnly&page`) via shared `JobBrowser` (URL-synced filters, 21/page load-more, skeletons, empty state); `/engineering`, `/ai` reuse it with track presets.
- `/jobs/[jobId]` (chips, facts, sanitized ATS HTML via DOMPurify, official Apply, related, per-job metadata + `JobPosting` JSON-LD).
- `/companies[/:slug]` (live counts, sources, jobs grid); `/dashboard` (protected: greeting + filter bar in dark shell, promo card, work-mode/employment/level sidebar, `DashboardJobCard` pastel grid, Saved-only, sort updated/A–Z); `/profile`; auth group `(auth)`; `/privacy`, `/terms`.
- `middleware.ts` guards `/dashboard`, `/profile` (cookie presence → `/login?next=` sanitized by `safeNext`).

## Components & lib

- `JobBrowser`/`JobCard` (public cards + bookmark support), `DashboardJobCard` (pastel), `CompanyLogo` (logo → initial-tile fallback), `SearchFilters`, `Navbar` (single global nav: links + Dashboard when authed, avatar menu with logout), `Footer`, `CookieConsent`, `GoogleButton` (GIS, single-init guard), `AuthProvider` (`useAuth`, one session fetch).
- `lib/reerhub.ts` (public GETs, `TECH_TRACKS`, `Job`/`Company` types) + `lib/auth.ts` (cookie client, silent refresh retry, auto CSRF via `/auth/csrf`, data-rights helpers).

## Design tokens (full system: `docs/design/design-system.md` v2)

navy `#07152E`, deep `#0B1730`, blue `#2563EB`, cyan `#2DD4BF`, purple `#6366F1`; Inter 400–700; cards `rounded-2xl`/`shadow-card`; 60–70% light surfaces, navy reserved for hero/CTA/dashboard shell. Never invent brand colors.
