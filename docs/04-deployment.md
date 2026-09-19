# 04 — Deployment (Vercel)

- Project auto-deploys `main` at `https://www.reerhub.com` (apex `reerhub.com` 308 → `www`). Staging auto-deploys `develop` at `https://staging.reerhub.com` (ADR-010; SSO off, `robots.ts` disallows all there).
- **Environment** (Settings → Environment Variables, Production; build-time → **Redeploy** after changes):
  ```dotenv
  NEXT_PUBLIC_API_URL=https://api.reerhub.com/api/v1
  NEXT_PUBLIC_SITE_URL=https://www.reerhub.com
  NEXT_PUBLIC_GOOGLE_CLIENT_ID=<id>.apps.googleusercontent.com
  ```
- Staging uses the same keys with staging hosts:
  ```dotenv
  NEXT_PUBLIC_API_URL=https://staging-api.reerhub.com/api/v1
  NEXT_PUBLIC_SITE_URL=https://staging.reerhub.com
  ```
  (Google OAuth origins + Turnstile widget domains must list `staging.reerhub.com`.)
- Backend must list `https://www.reerhub.com` in `CORS_FRONTEND_URL` with credentials on.
- CI (`.github/workflows/ci.yml`): eslint + `tsc --noEmit` + build + `npm audit`; Dependabot weekly. Requires Node 22.
- Rollback: Vercel → Deployments → Redeploy last good.
