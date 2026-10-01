# reerhub-frontend

Next.js 16 + React 19 UI for **ReerHub** (Real Effective Engineering Roles Hub, reerhub.com) — India-first tech-job discovery. Marketing home, SEO listings with official Apply links, protected personalized dashboard, accounts, profiles, saved jobs.

Live: `https://www.reerhub.com` (Vercel, auto-deploy on `main` push). Staging: `https://staging.reerhub.com` (auto-deploys `develop`; SSO off, crawlers disallowed).

## Setup (new developer)

```bash
nvm use 24            # Node 24 required (.nvmrc); Node 20 crashes on jsdom
npm install
cp .env.example .env.local   # defaults point at local backend :8000
npm run dev           # → http://localhost:3000 (needs backend running, see reerhub-backend repo)
npm run build         # 26 routes
npx eslint . && npx tsc --noEmit
```

## What it does

- **Public (teaser-gated, ADR-011):** `/`, `/jobs`, `/engineering-jobs`, `/ai-jobs`, `/<city>-jobs` (Bengaluru/Chennai/Hyderabad/Mumbai/Delhi/Pune), `/remote-jobs`, `/companies[/:slug]`, `/jobs/:slug` (excerpt + login wall for anonymous; full detail for members; JSON-LD, related, saves), `/privacy`, `/terms`, `/llms.txt`, sitemap/robots.
- **Accounts (passwordless):** `/login` (Google + magic link; `/signup`, `/forgot-password`, `/reset-password` redirect here), `/verify-email`, `/verify-magic`, `/profile` (details + role/track/skills + alerts + data export/delete), protected `/dashboard` (URL-synced filters, recommendations panel, bookmarks, sort, Saved-only).
- **Pro:** `/billing` (weekly ₹49 / monthly ₹150 / quarterly ₹299, 7-day trial, trial-steps + assurances + final CTA).
- **Session:** one global `useAuth()` (`components/AuthProvider.tsx`); `proxy.ts` guards dashboard/profile; API via `lib/reerhub.ts` + `lib/auth.ts` (cookies, silent refresh, CSRF, `safeNext`).
- **Motion:** company marquee, scroll reveals (`Reveal`), count-ups (`CountUp`), staggered hero; all static under `prefers-reduced-motion`.

## Docs

`docs/DECISIONS.md` · `docs/04-deployment.md` (Vercel env matrix) · `docs/design/design-system.md` v2. Start with `AGENTS.md`. Deliberately small — no new doc files without a triggering incident or requirement.

## Roadmap

1. e2e smoke (Playwright) — blocked on browsers in dev env, not on need.
2. Analytics + Web Vitals (needs provider pick).
3. Billing FAQ block (if trial conversion lags).
4. Deferred: PWA/offline, nested error boundaries.

## Skills (`.agents/skills/`)

`find-skills` · `frontend-design` (Anthropic UI taste) · `nextjs-app-router-patterns` · `ui-ux-pro-max` (systematic rules) · `code-review`. Pinned in `skills.json` for IDE teammates.

## Deploy

Vercel auto-deploys `main`. Env (`API_URL`, `SITE_URL`, `GOOGLE_CLIENT_ID`, `TURNSTILE_SITE_KEY`) is server-only, no `NEXT_PUBLIC_*` — browser calls same-origin `/api/v1` (Next rewrite proxies to `API_URL`); public keys served at runtime via `/api/config`. Dashboard must pin **Node 24**. Full matrix: `docs/04-deployment.md`. Keep `main` green; branches + PRs.
