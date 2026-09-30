# Session state — frontend (handoff)

_Last updated: 2026-09-30. Branch: `feat/node24-billing-animations` (cut from `develop`; pushed, PR to `develop` pending). Next session: verify PR/staging, then continue on new feature branches — never commit to `develop` directly._

## Where we are

`develop` deploys to staging (`staging.reerhub.com`, SSO off, robots disallow all); `main` to prod (`www.reerhub.com`). Flow: feature branch → PR to `develop` → verify on staging → PR to `main`.

## Completed (this cycle, on branch)

- **Pro billing page**: 3-plan selector (monthly preselected), trial steps + assurances + final CTA, membership view; 7-day trial copy site-wide.
- **Homepage motion**: company marquee, `Reveal`/`CountUp`, staggered hero; roles rail tried and reverted to 3-card grid.
- **Node 24 baseline** + latest deps (TS@6/eslint@9 held, documented).
- **`proxy.ts` rename**, server-safe sanitize (jsdom build fix), passwordless UI, slug/`-jobs` URLs, recommendations panel, profile alerts.
- Checks: eslint 0 errors, `tsc` clean, `next build` 26/26 green.

## Planned next (approved, not started)

1. Billing FAQ block (if trial conversion lags).
2. e2e smoke (Playwright) — blocked on browsers in dev env.
3. Analytics + Web Vitals (needs provider pick).

## Resume checklist

```bash
git checkout feat/node24-billing-animations && git pull --rebase origin feat/node24-billing-animations
nvm use 24 && npx eslint . && npx tsc --noEmit && npm run build
```

Docs rule: `docs/` stays at DECISIONS + CHANGELOG + deployment + design (+ this handoff). No new doc files without a triggering requirement.
