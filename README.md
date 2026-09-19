# reerhub-frontend

Next.js 16 + React 19 UI for **ReerHub** (Real Effective Engineering Roles Hub, reerhub.com) — India-first tech-job discovery. Marketing home, SEO listings with official Apply links, protected personalized dashboard, accounts, profiles, saved jobs.

Live: `https://www.reerhub.com` (Vercel, auto-deploy on `main` push). Staging: `https://staging.reerhub.com` (auto-deploys `develop`; SSO off, crawlers disallowed).

## Setup (new developer)

```bash
nvm use 22            # Node 22 required (.nvmrc); Node 20 crashes on jsdom
npm install
cp .env.example .env.local   # defaults point at local backend :8000
npm run dev           # → http://localhost:3000 (needs backend running, see reerhub-backend repo)
npm run build         # 20 routes
npx eslint . && npx tsc --noEmit
```

## What it does

- **Public (SEO):** `/`, `/jobs`, `/engineering`, `/ai`, `/companies[/:slug]`, `/jobs/:id` (Apply on company site, related, JSON-LD), `/privacy`, `/terms`, sitemap/robots.
- **Accounts:** `/login`, `/signup`, `/verify-email`, `/forgot-password`, `/reset-password`, `/profile` (details + role/track/skills + password + data export/delete), protected `/dashboard` (filter bar, sidebar, pastel cards, bookmarks, sort, Saved-only).
- **Session:** one global `useAuth()` (`components/AuthProvider.tsx`); `middleware.ts` guards dashboard/profile; API via `lib/reerhub.ts` + `lib/auth.ts` (cookies, silent refresh, CSRF, `safeNext`).

## Docs

`docs/DECISIONS.md` · `docs/CHANGELOG.md` · `docs/04-deployment.md` (Vercel env matrix) · `docs/design/design-system.md` v2. Start with `AGENTS.md`. Deliberately small — no new doc files without a triggering incident or requirement.

## Roadmap

1. e2e smoke (Playwright) — blocked on browsers in dev env, not on need.
2. Analytics + Web Vitals (needs provider pick).
3. Job alerts backend (bell + footer subscribe are "coming soon").
4. Deferred: PWA/offline, nested error boundaries.

## Skills (`.agents/skills/`)

`find-skills` · `frontend-design` (Anthropic UI taste) · `nextjs-app-router-patterns` · `ui-ux-pro-max` (systematic rules) · `code-review`. Pinned in `skills.json` for IDE teammates.

## Deploy

Vercel auto-deploys `main`. Env (`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`) is build-time → redeploy after changes. Full matrix: `docs/04-deployment.md`. Keep `main` green; branches + PRs.
