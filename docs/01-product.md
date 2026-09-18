# 01 — Product (frontend lens)

ReerHub (Real Effective Engineering Roles Hub, reerhub.com) is an India-first tech-job discovery engine. This repo is its face: marketing home, SEO job/company listings with official Apply links, and — for logged-in users — a personalized dashboard, profiles, and saved jobs. Data comes from `https://api.reerhub.com/api/v1` (sibling backend repo).

## Status (2026-09-18, `main`)

- Public: marketing `/`, `/jobs`, `/engineering` (software), `/ai` (ai-ml), `/companies[/:slug]`, `/jobs/:id` (Apply on company site + related + SEO + JSON-LD), `/privacy`, `/terms`, sitemap/robots.
- Accounts: `/login`, `/signup`, `/verify-email`, `/forgot-password`, `/reset-password`, `/profile` (details + role/track/skills + security + data export/delete), protected `/dashboard` (dark shell, filter sidebar, pastel cards, bookmarks, sort, Saved-only).
- 18 routes build clean; eslint + `tsc` clean; CI (lint + typecheck + build) + Dependabot + audit gate.
