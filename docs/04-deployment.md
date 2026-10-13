# Frontend deployment (Vercel)

## Current release workflow

Feature branch from current `origin/main` → local verification → PR directly into `main` → passing CI → explicit owner approval for that merge → production deployment and verification. Do not commit/push directly to `main`. Keep `develop` and staging unchanged and paused: no PRs/merges/synchronization into `develop`, no routine staging release, and no service/database deletion or hosting changes. Resume only when the owner requests it; then agree how to realign `develop` from current `main`.

Review the diff and relevant unit/integration/contract tests using explicitly isolated fixtures before requesting approval. Include failure/rollback/concurrency or authorization checks where behavior requires them. UI changes also need affected frontend regressions, lint, TypeScript, the standard production build and desktop/mobile inspection. Use mocks or approved Test-mode provider credentials, never real payments or production test data. Documentation-only changes use proportionate diff/format/link/policy review; existing CI still runs. For database migrations, auth and billing, prepare additional verification and recovery steps/limitations.

Deploy compatible backend contracts before frontend consumers. After approved deployment, verify health plus the affected public/private functionality; use low-volume read-only production checks by default. Local tests cannot certify deployed cookies, environment values, provider delivery or scheduled work. Observe normal scheduled work without triggering manual source syncs or replaying emails as a release shortcut. Keep a recovery path to the previous compatible deployment. Production data/configuration mutations require their separately authorized target and scope.

The retained staging URLs, credentials guidance and dated rollout records below are reference material, not a requirement to release through `develop`. This workflow supersedes their earlier staging promotion gates. See [DECISIONS](DECISIONS.md) for the owner's dated decision.

`develop` deploys to `https://staging.reerhub.com`; `main` deploys to `https://reerhub.com`. The `www.reerhub.com` host redirects to the apex domain. Set Node 24 in Vercel.

Reviewed against current code on 2026-10-10. Deploy backend contracts before frontend consumers. A successful frontend build/healthy old API is not proof that the same release is deployed end to end.

Historical India-only rollout (completed 2026-10-12; not a recurring cleanup instruction): deploy the backend guard through develop first, verify its India-only health marker, then run the reviewed staging cleanup and strict validator installation. Deploy frontend after backend support; verify legacy URL normalization, India-only counts, ten-role anonymous previews, free-member pagination, city/work-mode filters and desktop/mobile layout. Promote backend through develop-to-main and perform approved production cleanup before frontend promotion. Keep raw compaction independently gated; do not use seeds, manual source syncs or broad collection wipes for this rollout.

## Environment variables

Production:

```dotenv
API_URL=https://api.reerhub.com/api/v1
SITE_URL=https://reerhub.com
GOOGLE_CLIENT_ID=<id>.apps.googleusercontent.com
TURNSTILE_SITE_KEY=<turnstile-site-key>
```

Staging:

```dotenv
API_URL=https://staging-api.reerhub.com/api/v1
SITE_URL=https://staging.reerhub.com
GOOGLE_CLIENT_ID=<staging-or-shared-client-id>.apps.googleusercontent.com
TURNSTILE_SITE_KEY=<staging-widget-site-key>
```

These values are server/build-time values. Redeploy after changing them. The backend must allow both deployed origins through `CORS_FRONTEND_URL`, and Google OAuth plus Turnstile must list the matching frontend hostname.

## Release checks

1. Sign in with Google and magic link; verify the return URL preserves the requested page.
2. Confirm anonymous listings show a preview but full job details and official Apply links are public. Free users can browse/save; only entitled Pro users get relevance-based recommendations.
3. Verify billing success/cancellation/expiry and webhook/signature contracts with isolated local integration tests and mocks; use approved Test-mode credentials if a real provider check is needed. Never use real payments or require the paused staging service.
4. Retained staging remains noindex but is not a release gate. Production public pages are indexable; private/admin pages are noindex. The `/sitemap.xml` index and child maps use `https://reerhub.com` and cover all active India roles.
5. Verify profile catalog search/aliases, Any role/All India, selection limits, zero/fractional experience, save/reload/clear/discard/failed save and unsaved navigation on mobile/keyboard.
6. Check Free/Pro direct dashboard `?view=discover|saved|matches` links, readiness guidance, saved pagination, score reasons/expansion, feedback exclusions and distinct empty/error states. Apply clicks must not report application outcomes.
7. Confirm request budgets in a production-mode preview: homepage one `/home` content read; directory one 50-item combined read per page/filter and no per-card detail reads; saved IDs shared per session; concurrent 401s share one refresh. Session/auth, images and navigation requests are separate from business API budgets.
8. In isolated local admin fixtures, upload researched JSON (25 companies / 50 sources / 500 KiB maximum), review evidence/feed validation, confirm Ready rows, download results and recover through batch history. Check keyboard/mobile use and unchanged single-company editing. Confirmation shows next sync, not immediate jobs.
9. Verify expired cookies, account switching, logout, slow/failed APIs and cache audience isolation. Review deployment commit, actual API contract and backend `status/checks.db`, not only an HTTP 200.

## Local checks and production verification

Run every regression script listed in README, lint, TypeScript, dependency audit and the standard `npm run build`. The documented local Turbopack CSS-worker restriction can be investigated with `npm run build -- --webpack`; that fallback is not proof the configured standard deployment build passed.

Use the synthetic fixture server for repeatable anonymous/Free/Pro/admin states without database/payment/email calls. Build a production-mode fixture preview before request-waterfall/network checks; never benchmark `next dev` as production. The localhost network proxy adds 150ms/request and 1.6Mbps aggregate bandwidth with no CPU throttle. Track LCP/CLS/lab interaction separately; field INP needs field data.

The free staging API may take roughly 50 seconds to wake. Warm it, report cold startup separately, then verify normal requests. Local fixtures cannot reproduce deployment cookie/security headers, external widgets or real Razorpay/SMTP behavior. Use approved Test credentials with isolated local checks, not real payments. Staging remains paused unless the owner explicitly resumes it.

Previous Vercel protection/old-API blockers were resolved during 2026-10-09 staged checks recorded in DECISIONS. Those dated results do not verify today's import release automatically. If the owner later resumes staging and it redirects to Vercel SSO again, resolve deployment protection before claiming those optional staging checks passed. Do not alter staging protection as part of the current workflow change.

Rollback through Vercel Deployments by redeploying the last known good production build.

# Admin deployment

Attach `admin.reerhub.com` to the existing public Vercel project; no second
project or environment is needed. Host routing serves `/auth` and `/dashboard`
only on that subdomain, while `reerhub.com/auth` is a 404 and customer login
remains `/login`. The admin subdomain uses the same `API_URL` and
`GOOGLE_CLIENT_ID` already configured for the public deployment. Add the admin
subdomain to the Google OAuth client’s Authorized JavaScript origins and to the
backend `CORS_FRONTEND_URL` list.

For current local testing, use `localhost:3000/admin/auth` and
`localhost:3000/admin/dashboard`. Retained staging equivalents are reference
only while staging is paused.
This keeps normal staging/local `/` and `/dashboard` public. Dedicated admin
testing hosts (`admin-staging.reerhub.com` and `admin.localhost`) use `/auth`
and `/dashboard` like production. Production public hosts remain blocked.

The Next admin proxy injects the backend admin marker only on allowed admin/test hosts; dedicated admin cookies and live database role checks remain required. Client-side route visibility alone is not authorization. Admin mutations use CSRF; no API key is exposed to the browser.

The admin import panel consumes the backend-owned format, persisted progress and download results. Research remains manual on request; check database inventory plus previous backend JSON batches before creating the next batch. The panel checks feed availability, not independent employer ownership. No seed command, automatic crawler or spreadsheet integration is required.

## Freshness and quality rollout

Test shared duplicate/count policies, feed/closure dates and admin quality filters on isolated local fixtures; frontend optional fields must tolerate the previously deployed backend. Run relevant regressions, lint, TypeScript, the standard production build and desktop/mobile checks. Open feature PRs directly into `main`, wait for passing CI and explicit owner approval before each merge, release backend support first, verify its production contract, then approve/release the frontend. After deployment verify affected production behavior. Do not rewrite historical dates, expire jobs from link-check failures or resume staging for this rollout.

## Optional measurement activation

Leave `GA4_MEASUREMENT_ID` empty until the owner creates a GA4 web data stream and approves activation. It is a public G- identifier, never an account credential. Configure it on Vercel and redeploy; verify rejection causes no Google analytics/Tag Manager requests, explicit opt-in loads measurement, withdrawal removes it, and event payloads contain only approved enums. The sandbox deliberately sends a fixed public page identity, not private URLs or member contents. Trial activation and first verified payment are separate events. Lab fixtures do not prove GA collection; use GA DebugView after approved activation.

For Search Console, the owner creates a domain property for reerhub.com, verifies its supplied DNS TXT value through the existing DNS account, then submits https://reerhub.com/sitemap.xml. Do not put account credentials in this repository. Until ownership is verified, indexing reports and real-user field metrics cannot be claimed.

Public privacy copy intentionally omits configuration status. Preferences store Accept/Reject whether measurement is configured or not; actual collection requires both acceptance and a valid GA4 ID. First-visit prompts remain suppressed without configuration. A failed storage write revokes acceptance for the current session. Confirm these states after an approved analytics rollout; never replace product copy with setup instructions.
