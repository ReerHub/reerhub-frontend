# Changelog (frontend)

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
