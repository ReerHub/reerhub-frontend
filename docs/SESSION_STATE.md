# Session state — frontend (handoff)

_Last updated: 2026-09-19. Branch: `develop` (clean, matches `origin/develop`).
Remote has only `develop` + `main`. Next session: start here, then branch off `develop`._

## Where we are

All work below is merged into `develop` (up to #23). `main` deploys to Vercel prod (`www.reerhub.com`); `develop` deploys to staging (`staging.reerhub.com`, SSO off, `robots.ts` disallows all there). Flow: feature branch → PR to `develop` → verify on staging → PR to `main`.

## Completed (this cycle)

- **Single global navbar**: auth-aware (Dashboard link when logged in, avatar menu, outside-click close); dashboard mini-nav removed.
- **Design systems**: v2 (navy/pastel) → v3 color system (primary `#2F6FED`, Neural Dark `#111827`, Neural Gray, Light Blue, aligned states; teal = official-trust only); Space Grotesk display type; unified radii; light marketing pages, dark dashboard shell retained.
- **Dashboard rebuild** (LuckyJob-style): dark filter header prefilled from profile, sidebar filters, pastel cards, bookmark saves, Saved-only toggle, sort, verify banner; then **unified** to URL-synced single-state filters, instant sidebar, removable prefill chips (skills-bias toggle), Saved deep-link (`?view=saved`) + pagination, server sort, 44px targets, clickable titles.
- **Auth UX**: login/signup/verify/forgot/reset + Turnstile + show-password + inline errors; public resend form; signup email edit; silent refresh retry; `safeNext`; Google single-init guard.
- **Job detail/profile**: save buttons, mobile Apply-first, `Opens <domain>` preview, related with saves, JobPosting JSON-LD; profile chips (x/10), dirty-aware Save + Reset, Google explainer, delete modal.
- **Logos**: split icon + lockup assets, `next/image` + remote patterns, `CompanyLogo` with fallback.
- **Legal/SEO**: `/privacy`, `/terms`, consent banner, canonical/OG/Twitter, robots (auth disallowed; staging fully disallowed), sitemap, global-error page.
- **Hygiene**: CI (lint + typecheck + build), Dependabot (minors grouped, majors ignored), audit gate, ISC license, `middleware.ts` guards, `AuthProvider` single session.
- **Checks**: eslint zero errors, `tsc --noEmit` clean, `next build` green (20 routes).
- **Skills**: `.agents/skills/` = find-skills, frontend-design, nextjs-app-router-patterns, ui-ux-pro-max, code-review (+ `skills.json`). UI work: `frontend-design` for direction first, `ui-ux-pro-max` rules pass before finishing.

## Planned next (approved, not started)

1. **Teaser gating (reverses ADR-007 — SEO dies by design, accepted)**: lists show title/company/chips/location/date only; detail shows excerpt + login CTA wall; full description/skills/Apply/saves need session. Anonymous and crawler views identical (no cloaking).
2. **Passwordless login** (remove email+password): unified screen — Google primary + magic-link email input; delete password fields, forgot/reset pages (redirect to login); backend supplies the magic-link endpoints.
3. **URL overhaul**: `/engineering-jobs`, `/ai-jobs` (+308s); slug job URLs `/jobs/{title}-{company}-{id}` with canonical redirects; city pages Bengaluru/Chennai/Hyderabad/Mumbai/Delhi/Pune + `/remote-jobs` (thin cities get "expanding soon" + recommended roles); sitemap/canonicals/footer links. Backend untouched.
4. **AI SEO**: `/llms.txt`, FAQ block, JSON-LD trimmed to visible content only.
5. **Company-grid `indiaOnly` audit** + detail loading states + `smoke.js` Malaysia probe (with backend).

## Resume checklist

```bash
git checkout develop && git pull --rebase origin develop
git checkout -b ui/<topic>
npx eslint . && npx tsc --noEmit && npm run build
```

Docs rule: `docs/` stays at DECISIONS + CHANGELOG + deployment + design. No new doc files without a triggering requirement.
