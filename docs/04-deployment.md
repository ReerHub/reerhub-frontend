# Frontend deployment (Vercel)

`develop` deploys to `https://staging.reerhub.com`; `main` deploys to `https://reerhub.com`. The `www.reerhub.com` host redirects to the apex domain. Set Node 24 in Vercel.

Reviewed against current code on 2026-10-10. Deploy backend contracts before frontend consumers. A successful frontend build/healthy old API is not proof that the same release is deployed end to end.

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
3. Use Razorpay Test mode on staging to verify checkout, signature verification, billing success, cancellation, webhook delivery, and expiry.
4. Confirm staging returns `X-Robots-Tag: noindex, nofollow` and allows crawlers to read it. Production public pages are indexable; private/admin pages are noindex. The `/sitemap.xml` index and child maps use `https://reerhub.com` and cover all active India roles.
5. Verify profile catalog search/aliases, Any role/All India, selection limits, zero/fractional experience, save/reload/clear/discard/failed save and unsaved navigation on mobile/keyboard.
6. Check Free/Pro direct dashboard `?view=discover|saved|matches` links, readiness guidance, saved pagination, score reasons/expansion, feedback exclusions and distinct empty/error states. Apply clicks must not report application outcomes.
7. Confirm request budgets in a production-mode preview: homepage one `/home` content read; directory one 50-item combined read per page/filter and no per-card detail reads; saved IDs shared per session; concurrent 401s share one refresh. Session/auth, images and navigation requests are separate from business API budgets.
8. In staging admin, upload researched JSON (25 companies / 50 sources / 500 KiB maximum), review evidence/feed validation, confirm Ready rows, download results and recover through batch history. Check keyboard/mobile use and unchanged single-company editing. Confirmation shows next sync, not immediate jobs.
9. Verify expired cookies, account switching, logout, slow/failed APIs and cache audience isolation. Review deployment commit, actual API contract and backend `status/checks.db`, not only an HTTP 200.

## Local checks versus staging

Run every regression script listed in README, lint, TypeScript, dependency audit and the standard `npm run build`. The documented local Turbopack CSS-worker restriction can be investigated with `npm run build -- --webpack`; that fallback is not proof the configured standard deployment build passed.

Use the synthetic fixture server for repeatable anonymous/Free/Pro/admin states without database/payment/email calls. Build a production-mode fixture preview before request-waterfall/network checks; never benchmark `next dev` as production. The localhost network proxy adds 150ms/request and 1.6Mbps aggregate bandwidth with no CPU throttle. Track LCP/CLS/lab interaction separately; field INP needs field data.

The free staging API may take roughly 50 seconds to wake. Warm it, report cold startup separately, then verify normal requests. Local fixtures cannot reproduce deployment cookie/security headers, external widgets or real Razorpay/SMTP behavior. Use staging Test credentials for approved checkout, not real payments.

Previous Vercel protection/old-API blockers were resolved during 2026-10-09 staged checks recorded in DECISIONS. Those dated results do not verify today's import release automatically. If staging redirects to Vercel SSO again, resolve deployment protection before treating route checks as completed.

Rollback through Vercel Deployments by redeploying the last known good production build.

# Admin deployment

Attach `admin.reerhub.com` to the existing public Vercel project; no second
project or environment is needed. Host routing serves `/auth` and `/dashboard`
only on that subdomain, while `reerhub.com/auth` is a 404 and customer login
remains `/login`. The admin subdomain uses the same `API_URL` and
`GOOGLE_CLIENT_ID` already configured for the public deployment. Add the admin
subdomain to the Google OAuth client’s Authorized JavaScript origins and to the
backend `CORS_FRONTEND_URL` list.

For testing, use `staging.reerhub.com/admin/auth` and
`staging.reerhub.com/admin/dashboard`, or their `localhost:3000` equivalents.
This keeps normal staging/local `/` and `/dashboard` public. Dedicated admin
testing hosts (`admin-staging.reerhub.com` and `admin.localhost`) use `/auth`
and `/dashboard` like production. Production public hosts remain blocked.

The Next admin proxy injects the backend admin marker only on allowed admin/test hosts; dedicated admin cookies and live database role checks remain required. Client-side route visibility alone is not authorization. Admin mutations use CSRF; no API key is exposed to the browser.

The admin import panel consumes the backend-owned format, persisted progress and download results. Research remains manual on request; check database inventory plus previous backend JSON batches before creating the next batch. The panel checks feed availability, not independent employer ownership. No seed command, automatic crawler or spreadsheet integration is required.
