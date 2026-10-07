# ReerHub frontend

Next.js 16 and React 19 frontend for ReerHub, an India-first tech-job discovery product. It presents official company openings, passwordless accounts, free manual discovery, and a Pro workspace for ranked role relevance.

Live: `https://reerhub.com`. Staging: `https://staging.reerhub.com` from `develop`; staging is blocked from crawlers.

## Product behaviour

- Anonymous visitors can preview up to 10 listings. Signing in for free unlocks full descriptions, official Apply links, filters, company pages, profile editing, and saved roles.
- Free accounts use a manual discovery dashboard. They never receive ranked matches or match emails.
- Pro members with a valid entitlement, including remaining time after cancellation, receive a default 75%+ ranked shortlist, tiered 90/75/50/25% dashboard filters, relevance feedback, and one daily email with up to five fresh 75%+ roles. A match-ready profile needs a track, target role, three skills, experience, and a city or work-mode preference. A score describes profile relevance, never hiring probability; freshness only orders already-qualified roles.
- Pro plans are weekly ₹49, monthly ₹149, and quarterly ₹299. Each has a seven-day trial. Subscription payments are non-refundable; cancellation stops renewal while access remains available until the displayed end date.

## Local setup

```bash
nvm use 24
npm install
cp .env.example .env.local
npm run dev
npx eslint .
npx tsc --noEmit
npm run build
```

The app runs at `http://localhost:3000` and proxies browser API requests to `API_URL`, which defaults to the local backend at port 8000. `npm run test:ui:fixtures` starts an isolated UI-only fixture server at port 3001; it does not contact MongoDB, SMTP, or Razorpay.

## Architecture

- App Router routes cover public job/company discovery, authentication, billing, profile, and dashboard flows.
- `lib/reerhub.ts` handles public API reads; `lib/auth.ts` handles credentialed requests, CSRF, one refresh retry, and safe return paths.
- `AuthProvider` is the only client session source. `proxy.ts` protects Dashboard and Profile routes.
- `/api/v1/*` is rewritten server-side to `API_URL`. No backend URL or secret is exposed to browser code. `/api/config` exposes only the Google client ID and Turnstile site key at runtime.

## Deployment

Vercel deploys `develop` to staging and `main` to production. Set Node 24 and configure `API_URL`, `SITE_URL`, `GOOGLE_CLIENT_ID`, and `TURNSTILE_SITE_KEY`; redeploy after any change because these are server/build-time values. See `docs/04-deployment.md` for the environment matrix and staging checks.

## Reference

Read `AGENTS.md` first. Product decisions are in `docs/DECISIONS.md`; the current visual system is in `docs/design/design-system.md`.
