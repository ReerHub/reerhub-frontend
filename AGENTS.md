<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# reerhub-frontend guide (for AI agents)

Next.js 16 App Router + React 19 + Tailwind 4 UI for **ReerHub** (reerhub.com) — India-first tech-job discovery. Marketing home, public SEO listings (`/jobs`, `/engineering`, `/ai`, `/companies`), protected LuckyJob-style `/dashboard`, auth pages, profile. Live at `https://www.reerhub.com` (Vercel, auto-deploy on `main` push).

Self-contained repo: product/routes/design/decisions/changelog/skills live here (`docs/`, `.agents/skills/`). Sibling `reerhub-backend` repo is a separate checkout — never assume shared files. Parent folder is workspace only.

## Runtime

- **Node 22** (`.nvmrc` + `engines`; Node 20 crashes on jsdom). `npm run dev` → `:3000` (needs backend at `:8000` for data).
- Checks: `npx eslint .` (zero errors; `setState` sync-in-`useEffect` is an error — use initializers + key-remount, promise-callback fetches), `npx tsc --noEmit`, `npm run build` (18 routes).

## Conventions

- Path alias `@/*`. API: `lib/reerhub.ts` (public reads) + `lib/auth.ts` (`credentials:"include"`, silent refresh retry, `safeNext`, auto CSRF). One global session: `components/AuthProvider.tsx` (`useAuth`) — never add per-page `getMe()` fetches. Guards in `middleware.ts`.
- Styling: Tailwind + `docs/design/design-system.md` v2 (navy/blue/cyan-purple, Inter, light surfaces). No new brand colors. Logos via `components/CompanyLogo.tsx` (fallback tile); remote images need `next.config.ts` `remotePatterns` for `next/image`.
- SEO: `/jobs` etc. stay public; auth/dashboard never in sitemap; `robots.ts` disallows them; per-job JSON-LD.
- Secrets: only `NEXT_PUBLIC_*` in browser (`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`).
- Commits `feat:/fix:/chore:/ci:/docs:`, only when asked. Never commit `.env*`/secrets.

## Gotchas

- `NEXT_PUBLIC_*` are build-time — Vercel redeploy after changing. Backend CORS must allow the origin + `credentials:true`.
- Backend global rate limit is per process; after running backend tests, wait before live-verifying (15-min window).

## Skills (`.agents/skills/`)

`find-skills` · `frontend-design` (Anthropic UI taste) · `nextjs-app-router-patterns` · `ui-ux-pro-max` (systematic rules: palette/a11y/touch/responsive) · `code-review`. Pinned in `skills.json`. UI work uses both design skills: `frontend-design` for direction first, `ui-ux-pro-max` rules pass before finishing.

## Docs discipline (minimal by design)

`docs/` holds exactly four entries: `DECISIONS.md`, `CHANGELOG.md`, `04-deployment.md` (env matrix mirrors `.env.example`), `design/` (design-system v2). README covers setup/product/roadmap. Do NOT create new doc files, TODO lists, or issue logs without a triggering incident or user-visible requirement — backlog lives in README Roadmap or GitHub Issues.
