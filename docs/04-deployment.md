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
4. Retained staging remains noindex but is not a release gate. Production public pages are indexable; private/admin pages are noindex. The `/sitemap.xml` direct URL list (or automatic index for larger inventories) and legacy child maps use the shared canonical `SITE_URL`, normalized without trailing slashes, and cover backend-approved active India roles.
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

GTM has precedence over the legacy isolated direct GA4 fallback. Configure GTM_CONTAINER_ID on Vercel Production and redeploy. Verify no Google requests before Accept or after Reject, and no tag on member/auth/admin/noindex routes. Main-document GTM cannot be unloaded: withdrawal clears analytics cookies and reloads; transitions into private screens replace the document. Product event payloads contain only approved enums and canonical public page identity. Tests intercept collection endpoints; they do not establish GA receipt.

For Search Console, the owner creates a domain property for reerhub.com, verifies its supplied DNS TXT value through the existing DNS account, then submits https://reerhub.com/sitemap.xml. Do not put account credentials in this repository. Until ownership is verified, indexing reports and real-user field metrics cannot be claimed.

Public privacy copy intentionally omits configuration status. Preferences store Accept/Reject whether measurement is configured or not; actual collection requires both acceptance and a valid measurement/container ID. First-visit prompts remain suppressed without configuration. A failed storage write revokes acceptance for the current session. Confirm these states after an approved analytics rollout; never replace product copy with setup instructions.

## Crawl-file release verification

After a separately approved deployment, anonymously verify `/sitemap.xml`, every advertised `/sitemaps/{id}`, `/robots.txt`, `/llms.txt` and the root IndexNow ownership file on https://reerhub.com. Require successful, well-formed UTF-8 responses, canonical absolute links, complete eligible inventory, no private/query URLs and no generic database `lastmod`. Sources remain fresh with no extra cache; failures must return 503 and `Retry-After: 60`. Staging keeps readable noindex and no production sitemap declaration; rendering assets and private noindex responses stay crawlable. Search/AI public access remains enabled.

Only after verification and separate submission authorization, resubmit `/sitemap.xml` in Search Console. A zero-discovered report alone does not prove a technical failure; sitemap changes do not guarantee crawling or indexing. `llms.txt` is agent guidance; Google requires no special AI text file.

IndexNow: first verify the deployed ownership file contains the supplied key exactly. Preview `npm run indexnow -- --all` for initial setup, or `npm run indexnow -- --file changed-urls.json` for selected current public URLs. Review the JSON payload before an authorized repeat with `--submit`. The command verifies live ownership, accepts 200/202, limits batches to 10,000 URLs and stops on provider errors. Do not add this to builds, visitor requests or scheduled full-inventory resubmissions. Automatic publication/deletion notifications now belong to the separately released backend opt-in worker, which reconciles verified public job URLs every five minutes with durable retries and retained removals. Before activation, verify the key and canonical frontend origin; keep backend INDEXNOW_ENABLED off in local/test/staging. This frontend release alone does not activate that worker. Verify receipt in Bing Webmaster Tools; receipt is not a promise of indexing. No live notifications are sent as part of local validation.

## GTM and FAQ release checks

GTM_CONTAINER_ID is a public runtime identifier. Production defaults to owner-supplied GTM-KQD9XXJL if unset; explicitly empty disables GTM. Local/test defaults off. The standard async loader runs in the main public document head after explicit consent and shared AuthProvider guest verification. No main-page noscript tracker bypasses consent; no-JavaScript measurement remains off. This supersedes the earlier iframe GTM setup. Member/auth/admin/noindex screens and credential-bearing public URLs are excluded; cookies alone do not determine authentication.

Before loading, consent defaults to denied, then analytics is granted for an accepted choice while ad_storage, ad_user_data and ad_personalization remain denied. Global page_location excludes query/fragment, page_referrer is empty, send_page_view is false, Google signals/ad personalization are disabled, ads_data_redaction is true and url_passthrough is false. The app queues one explicit page_view per public pathname transition and allowlisted custom product events; never configure another pageview trigger. Executed tags require a document reload for complete withdrawal/private-route isolation, not DOM script removal. Analytics cookies are cleared on withdrawal; essential cookies are preserved.

Google-account settings: use one Google tag for the verified GA4 destination, with send_page_view=false and the supplied page_location/page_referrer/page_title. Disable GA4 Enhanced Measurement (including browser-history pageviews, site search and form interactions) so it cannot bypass sanitized explicit events or double-count. Keep Google signals, user-provided data collection and ads personalization off. Custom event tags may forward only discovery and view_pricing with the supplied enum page_family; no DOM scraping, user identifiers, custom HTML, advertising tags or arbitrary trackers. Preserve built-in analytics consent checks. Published account settings require direct account access and are not established by code defaults alone. Use Tag Assistant and intercepted collect requests first, then GA4 Realtime/DebugView for actual receipt after approved release. GTM installation is not an SEO ranking mechanism.

After approved deployment, check `/faq` anonymously for one primary H1, all 41 answers in initial HTML, a self-canonical URL and one matching FAQPage document. With JavaScript disabled, native accordions and category links must remain usable. Verify member `/dashboard/faq` is protected/noindex and emits no public FAQPage schema. Check sitemap and llms links, retained contextual questions, member redirects and nonduplicated page bodies. Test unknown/failed reads for honest state and no fabricated metadata. Google discontinued FAQ rich results in May 2026; use Schema.org validation and HTML review rather than expecting Google’s removed FAQ rich-result test feature.

Verified Google account configuration on 2026-10-14: GTM version 3 has one Google tag and one GA4 event tag with the exact event trigger ^(page_view|discovery|view_pricing)$. GA4 Enhanced Measurement is off, email redaction remains on and q/search/query/token/code/email/next/returnTo/password/session/authorization/secret are redacted from URL event fields. Google signals and user-provided data remain off; ads personalization is disallowed in all 307 regions. These account settings complement the app guards. Recheck after any container/property changes.
