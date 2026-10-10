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
- Checks: `npx eslint .` (zero errors; `setState` sync-in-`useEffect` is an error — use initializers + key-remount, promise-callback fetches), `npx tsc --noEmit`, regression scripts `test:admin/seo/profile/dashboard/operations/performance/security`, `npm audit --audit-level=high`, `npm run build`. Use actual build output for route counts. A local `--webpack` diagnostic fallback is not proof the standard deployment build passed.
- Version holds (do not bump until upstream supports): `typescript@6` (TS 7 unsupported by typescript-eslint, retry at >=7.1) and `eslint@9` (v10 breaks `eslint-config-next`'s bundled react plugin).

## Conventions

- Path alias `@/*`. API: `lib/reerhub.ts` (public reads) + `lib/auth.ts` (`credentials:"include"`, silent refresh retry, `safeNext`, auto CSRF). One global session: `components/AuthProvider.tsx` (`useAuth`) — never add per-page `getMe()` fetches. Guards in `proxy.ts`.
- Styling: Tailwind + `docs/design/design-system.md` (public Cobalt Blue `#2563eb`, charcoal `#0f172a`, canvas `#f8fafc`, ice blue `#eff6ff`). `app/public.css` scopes the final palette to `.public-site`; admin uses its own Cobalt Blue tokens in app/admin.css. Navigation/footer use solid `--public-chrome` Midnight Navy; reserve `--public-gradient` for Pro emphasis. Keep forms/discovery/application panels light and buttons solid. Brand wordmarks are `ReerHub` without a decorative dot. Motion is finite opacity/transform feedback only; everything is static under `prefers-reduced-motion`. Logos use `components/CompanyLogo.tsx`; retain original brand assets. Remote images need `next.config.ts` `remotePatterns` for `next/image`.
- Anonymous listings show up to 10 previews; full job details and official Apply links are public. Crawlers see identical content. Only eligible active roles emit JobPosting; private/admin pages and staging use noindex and stay out of the split sitemap.
- Secrets: server-only env (`API_URL`, `SITE_URL`, `GOOGLE_CLIENT_ID`, `TURNSTILE_SITE_KEY`) — no `NEXT_PUBLIC_*`. Browser calls same-origin `/api/v1` (rewrite proxies to `API_URL`); `GET /api/config` serves public widget keys at runtime.
- Commits `feat:/fix:/chore:/ci:/docs:`, only when asked. Never commit `.env*`/secrets.
- **Branching: feature branches → PR into `develop` (auto-deploys staging) → tested → PR `develop` → `main` (auto-deploys prod). Never touch `main` directly.**

## Gotchas

- Public backgrounds are full bleed; content is centered in a 1680px frame with 20–48px gutters. Discovery grids follow container width, stopping at four job columns and eight company tiles. Prose/forms stay readable; billing is capped at 1200px. The homepage matching explainer is the exception to finite motion: it may loop with pause/play, offscreen/tab-hidden suspension and reduced-motion support. Follow this exception over the general finite-motion rule above; other pages remain quiet.

- `API_URL`/`SITE_URL` are build-time — Vercel redeploy after changing. Backend CORS must allow the origin + `credentials:true`.
- Backend global rate limit is per process; after running backend tests, wait before live-verifying (15-min window).
- Dashboard URL state is `?view=discover|saved|matches`, not `?tab=`. Free defaults to discovery; Pro defaults to matches. Preserve distinct readiness/threshold-empty/all-empty/error states and backend-only match evidence.
- Profile uses backend catalog choices: one track, any/up to three roles, ten skills, All India/up to three cities, nonnegative fractional experience. Keep compact searchable checkbox popovers, explicit save/discard and unsaved protection; no custom free-text matching entries. Any work mode maps to `unknown`.
- Shared saved IDs/session reads must stay member-scoped, clear on logout/account switch and serialize refresh. Homepage uses one server content read; directory uses 50-item combined reads. Repeated card links disable detail prefetch. Backend owns mutable-content TTL; do not add another independent five-minute SSR cache.
- Weekly JSON import lives in admin Companies: bounded async preview, evidence approval, recent history/recheck/download and Awaiting first sync. Feed availability is not employer ownership. Research is manual on request, checks database identities and previous backend batches, and never uses a seed command. Deploy backend support first.

## Docs discipline (minimal by design)

`docs/` holds exactly three entries: `DECISIONS.md`, `04-deployment.md` (env matrix mirrors `.env.example`), and `design/` (the active design system). README covers current setup, product behavior, admin/import workflows, architecture, and deployment. Preserve dated historical results in DECISIONS and label superseded blockers; never imply a local fixture proves production behavior. Update these existing guides when behavior changes. Do NOT create new doc files, TODO lists, or issue logs without a triggering incident or user-visible requirement.
