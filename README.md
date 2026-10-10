# ReerHub frontend

Next.js 16 and React 19 frontend for ReerHub, an India-first tech-job discovery product. It presents official company openings, passwordless accounts, free manual discovery, and a Pro workspace for ranked role relevance.

Live: `https://reerhub.com`. Staging: `https://staging.reerhub.com` from `develop`; staging serves noindex directives.

## Product behaviour

- Anonymous visitors can preview up to 10 listings and read full job descriptions, skills and official Apply links without signing in. A free account unlocks complete browsing, profile editing and saved roles.
- Free accounts use a manual discovery dashboard. They never receive ranked matches or match emails.
- Pro members with a valid entitlement, including remaining time after cancellation, receive a default 75%+ ranked shortlist, tiered 90/75/50/25% dashboard filters, relevance feedback, and one daily email with up to five fresh 75%+ roles. A match-ready profile needs a track, role preferences (or any role), three skills, experience, and location preferences (or All India). A score describes profile relevance, never hiring probability; freshness only orders already-qualified roles.
- Pro plans are weekly ₹49, monthly ₹149, and quarterly ₹299. Each has a seven-day trial. Subscription payments are non-refundable; cancellation stops renewal while access remains available until the displayed end date.

## Local setup

```bash
nvm use 24
npm install
cp .env.example .env.local
npm run dev
npx eslint .
npx tsc --noEmit
npm run test:seo
npm run test:admin
npm run build
```

The app runs at `http://localhost:3000` and proxies browser API requests to `API_URL`, which defaults to the local backend at port 8000. `npm run test:ui:fixtures` starts an isolated UI-only fixture server at port 3001; it does not contact MongoDB, SMTP, or Razorpay.

## Admin workspace

The same deployment serves Google-only admin login at `admin.reerhub.com/auth` and the console at `/dashboard`. Localhost and staging use `/admin/auth` and `/admin/dashboard`; production public hosts cannot access these routes. Backend authorization requires a dedicated admin session and the current database admin role.

The console includes source health, company/source editing, sync history and confirmed sync triggers, safe job-quality editing, paginated member/subscription support views, and before/after audit inspection. Members and billing remain read-only. Tabs are shareable using dashboard URL hashes. Admin styles are isolated from the public UI.

Run `npm run test:admin` for API/host regression checks. For synthetic admin UI testing, start the fixture server and open `/api/v1/fixture-admin` on port 3001 (`?state=empty`, `error`, or `denied` exercise alternate states). Set `FIXTURE_PORT` and `FIXTURE_API_PORT` if those ports are occupied; fixture build caches are isolated per frontend port.

## Architecture

### Weekly company import

In admin Companies, choose **Import companies**, upload a researched JSON batch, review official-link evidence and feed counts, then approve Ready rows once. Up to 25 companies / 50 sources / 500 KiB; research file format is documented in the backend README. Empty verified feeds are valid. Imports do not fetch/store jobs immediately: source cards/results show the next scheduler slot and Awaiting first sync. Recent batches, recheck/retry and downloadable results support recovery without server commands. Backend feed availability checks are not proof of employer ownership. Deploy the compatible backend first.

- App Router routes cover public job/company discovery, authentication, billing, profile, and dashboard flows.
- `lib/reerhub.ts` handles public API reads; `lib/auth.ts` handles credentialed requests, CSRF, one refresh retry, and safe return paths.
- `AuthProvider` is the only client session source. `proxy.ts` protects Dashboard and Profile routes.
- `/api/v1/*` is rewritten server-side to `API_URL`. No backend URL or secret is exposed to browser code. `/api/config` exposes only the Google client ID and Turnstile site key at runtime.

## Deployment

Vercel deploys `develop` to staging and `main` to production. Set Node 24 and configure `API_URL`, `SITE_URL`, `GOOGLE_CLIENT_ID`, and `TURNSTILE_SITE_KEY`; redeploy after any change because these are server/build-time values. See `docs/04-deployment.md` for the environment matrix and staging checks.

## Reference

Read `AGENTS.md` first. Product decisions are in `docs/DECISIONS.md`; the current visual system is in `docs/design/design-system.md`.

Profile setup loads searchable choices from the backend's public `/api/v1/profile-options` catalog. Choose one of nine tracks, any role or up to three preferred roles, up to ten canonical skills, and All India or up to three cities. Aliases are searchable; free text is never saved as a selection. City and work-mode preferences influence ranking without hiding other locations or modes. Track changes confirm before clearing incompatible roles. Incomplete profiles remain saveable.
