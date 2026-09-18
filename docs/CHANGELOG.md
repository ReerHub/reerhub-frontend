# Changelog (frontend)

## Unreleased — Redesign PR 4: hero, motion, mobile (on `ui/redesign-p4`)

- Home hero rebuilt around live search (role + track → `/jobs`); stat boxes replaced by one live proof line; quick links simplified.
- Motion: single hero entrance only; `prefers-reduced-motion` disables entrances/skeletons/smooth scroll; `min-h-dvh`; Google button sized for 320px screens.
- Mobile: dashboard results first with collapsible filter card; navbar pills get fade affordance + hidden scrollbars.

## Unreleased — Auth/detail/profile flows (PR 3)

- Login: Turnstile, show-password, inline errors. Signup inbox: edit-email + resend. Verify page: public resend form (kills the logged-out dead loop). Reset + profile passwords: show toggles.
- Job detail: save button, Apply-first on mobile, `Opens <domain>` preview, related jobs with saves.
- Profile: skill chips (x/10), dirty-aware Save + Reset, Google-account explainer, delete modal with Escape/backdrop dismiss. Footer companies loading state.

## Unreleased — Dashboard unification (PR 2, on `ui/redesign-p2`)

- Single URL-synced filter state (header + sidebar write the same state; refresh/share/back-button safe), instant sidebar, removable prefill chips (incl. skills-bias toggle), Saved deep-link (`?view=saved`) with pagination, server-side sort (Title A–Z), 44px save targets, clickable card titles.

## Unreleased — Docs trim

- Collapsed `docs/` to DECISIONS + CHANGELOG + deployment + design system; roadmap folded into README; deleted TODO/KNOWN_ISSUES/specs (history preserved in git). New rule: no new doc files without a triggering requirement.

## Unreleased — Security hardening (on `sec/hardening`)

- Invisible Turnstile on signup + forgot-password (no site key locally → submits without token, backend bypasses in dev).
- `SECURITY.md`, `.env.example` committable again (gitignore negation), Gitleaks + least-privilege Actions in CI.

## 2026-09-18 — Hardening + single navbar (on `main`)

- `/privacy` + `/terms` + footer links + consent banner; robots disallow auth; canonical/OG/Twitter; `JobPosting` JSON-LD; `global-error.tsx`.
- `next/image` remote patterns (Google favicons/avatars); `CompanyLogo` everywhere; real form labels.
- Single auth-aware `Navbar` (Dashboard link, avatar menu, outside-click close); dashboard mini-nav removed.
- GIS single-init guard; scroll-behavior attr; CSRF on silent refresh.
- CI (lint + typecheck + build), Dependabot, audit gate, ISC `LICENSE`.

## 2026-09-17/18 — Auth UX + dashboard (merged via `phase-2-auth`)

- Login/signup/verify/forgot/reset, profile + security/data sections, protected LuckyJob-style dashboard with saves, marketing home, `AuthProvider`, middleware guards.

## 2026-09-17 — Discovery MVP + rebrand

- Listings, job detail + Apply, companies, SEO/sitemap, design system v2, ReerHub rename.
