# Changelog (frontend)

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
