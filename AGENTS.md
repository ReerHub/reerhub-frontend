<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# reerhub-frontend guide (for AI agents)

Next.js 16 App Router + React 19 + Tailwind 4 UI for **ReerHub** (reerhub.com) — India-first tech-job discovery. Teaser-gated public listings (`/jobs`, `/engineering-jobs`, `/ai-jobs`, city + `/remote-jobs`, `/companies`, slug job URLs), protected `/dashboard` with recommendations, passwordless auth, and Pro billing. Live at `https://reerhub.com` (Vercel, auto-deploy on `main` push).

Self-contained repo: product, deployment, design, and decisions live in README and `docs/`. Sibling `reerhub-backend` repo is a separate checkout — never assume shared files. Parent folder is workspace only.

## Runtime

- **Node 24** (`.nvmrc` + `engines`; Node 20 crashes on jsdom). `npm run dev` → `:3000` (needs backend at `:8000` for data).
- Checks: `npx eslint .` (zero errors; `setState` sync-in-`useEffect` is an error — use initializers + key-remount, promise-callback fetches), `npx tsc --noEmit`, `npm run build` (26 routes).
- Version holds (do not bump until upstream supports): `typescript@6` (TS 7 unsupported by typescript-eslint, retry at >=7.1) and `eslint@9` (v10 breaks `eslint-config-next`'s bundled react plugin).

## Conventions

- Path alias `@/*`. API: `lib/reerhub.ts` (public reads) + `lib/auth.ts` (`credentials:"include"`, silent refresh retry, `safeNext`, auto CSRF). One global session: `components/AuthProvider.tsx` (`useAuth`) — never add per-page `getMe()` fetches. Guards in `proxy.ts`.
- Styling: Tailwind + `docs/design/design-system.md` (primary `#2F6FED`, ink `#111827`, light surfaces). No new brand colors. Motion is finite opacity/transform feedback only; everything is static under `prefers-reduced-motion`. Logos use `components/CompanyLogo.tsx` when a company mark is needed; remote images need `next.config.ts` `remotePatterns` for `next/image`.
- Anonymous visitors see teasers only (ADR-011): lists show chips + excerpt, detail shows excerpt + login wall; crawlers see the identical view. Per-job JSON-LD carries the visible excerpt only; auth/dashboard never in sitemap; `robots.ts` disallows them.
- Secrets: server-only env (`API_URL`, `SITE_URL`, `GOOGLE_CLIENT_ID`, `TURNSTILE_SITE_KEY`) — no `NEXT_PUBLIC_*`. Browser calls same-origin `/api/v1` (rewrite proxies to `API_URL`); `GET /api/config` serves public widget keys at runtime.
- Commits `feat:/fix:/chore:/ci:/docs:`, only when asked. Never commit `.env*`/secrets.
- **Branching: feature branches → PR into `develop` (auto-deploys staging) → tested → PR `develop` → `main` (auto-deploys prod). Never touch `main` directly.**

## Gotchas

- `API_URL`/`SITE_URL` are build-time — Vercel redeploy after changing. Backend CORS must allow the origin + `credentials:true`.
- Backend global rate limit is per process; after running backend tests, wait before live-verifying (15-min window).

## Docs discipline (minimal by design)

`docs/` holds exactly three entries: `DECISIONS.md`, `04-deployment.md` (env matrix mirrors `.env.example`), and `design/` (the active design system). README covers setup, product behavior, architecture, and deployment. Do NOT create new doc files, TODO lists, or issue logs without a triggering incident or user-visible requirement.
