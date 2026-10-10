# ReerHub frontend

Next.js 16 / React 19 / Tailwind 4 member site and admin console for ReerHub, an India-first official-source technology-job discovery product.

Production: https://reerhub.com. Staging: https://staging.reerhub.com. Reviewed against this checkout on **2026-10-10**; deployment state must be checked separately.

## What members can do

| Audience     | Available experience                                                                                                      |
| ------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Anonymous    | Homepage, hiring-company directory/details, ten-role listing previews, full job details and official employer Apply links |
| Free         | Complete manual discovery, profile editing, saved roles, account export/deletion subject to billing safeguards            |
| Entitled Pro | Free features plus ranked matches, backend-provided reasons, relevance feedback and eligible daily match alerts           |

Public routes include `/`, `/companies`, `/companies/[slug]`, `/jobs`, slug-based job details, `/engineering-jobs`, `/ai-jobs`, `/remote-jobs` and Bengaluru/Mumbai/Delhi/Pune/Hyderabad/Chennai landing pages. Passwordless Google/magic-link sign-in uses `/login`; member surfaces are `/profile`, `/dashboard`, `/billing` and `/billing/success`. Legal/privacy pages and public SEO metadata are included.

There is no resume upload, AI profile autofill, automatic application submission or hiring prediction. The homepage animation is illustrative, not a live scan or an actual member recommendation.

## Profile setup

Three calm sections: Your next role, Your skills, Your work preferences. Name remains editable; account settings sit separately below.

- Choose one of nine technology tracks first; choose Any role in this track or up to three catalog roles.
- Search/select up to ten canonical skills. Aliases such as React.js/NodeJS help search but do not become duplicate saved skills. Track suggestions are optional; arbitrary custom values are not accepted.
- Choose All India or up to three searchable catalog cities, with aliases such as Bangalore/Bengaluru.
- Enter experience, including zero and fractions (0–60 years), and choose Any/Onsite/Hybrid/Remote work mode.
- Compact checkbox popovers show removable chips, counts, selection limits, no-result messages and keyboard focus. Escape/Done/outside interaction close them; lists are bounded and scrollable rather than expanding the whole form.
- Track changes confirm before incompatible roles are cleared; skills stay selected. Incomplete profiles can save.
- Explicit Save/Discard, a saved baseline, failed-save recovery and unsaved dashboard/browser-unload protection preserve editing state. Success offers dashboard navigation without forcing it.
- Google/magic-link account information replaces the unsupported password form. Pro alert preferences, data export and account deletion remain separate.

Five readiness essentials: track, role preference, at least three skills, experience and location preference. Any role and All India count as completed choices; name/work mode are not readiness essentials. Completion means the required inputs are present, not that relevant jobs or hiring outcomes are guaranteed. Single-role/single-city free-text fields are not used for matching; no automatic migration or account wipe occurs.

## Dashboard, discovery and saved jobs

A compact guidance card precedes the tabs, including on mobile. Incomplete members get their next missing essential and a profile link; browsing/saves remain available. Complete Free members see saved preferences and discovery guidance with Pro described separately. Complete Pro members get ranked-match guidance.

Discover jobs and Saved roles work for Free and Pro. Your matches is Pro-only. `/dashboard?view=discover`, `?view=saved` and `?view=matches` preserve shareable tab state; defaults are discovery for Free and matches for Pro. Controls support keyboard navigation.

Recommendation cards show company/title, location, work mode, available experience and “Added” freshness (ingestion time, not a claimed employer posting date). Show up to three actual backend reasons with expansion, relevance percentages/tiers and the hiring-outcome disclaimer. “Highest relevance” is not “guaranteed fit.”

View role & apply opens the existing detail page and official employer link. Save/Saved state is shared across dashboard/discovery/detail/related roles. Interested and Not relevant record relevance feedback; Not relevant hides the role from matches and alerts, not from all public discovery. Applied/Interview/Offer in More are explicit reported outcomes, never inferred from clicks. Duplicate in-flight actions are blocked; failures retain known state.

Incomplete profile, selected-threshold empty, all-ranked empty, loading and failed requests are separate states. Lower-tier suggestions use API counts; otherwise browse and preference editing remain available without guarantees. Saved lists retain pagination and move back to a valid page after the last later-page item is removed.

## Matching and membership

Matching is backend-owned and deterministic: skills up to 40, track 25, roles 20, city five, work mode five, experience five. Any role/All India/Any mode remove their respective weights before normalization; remote jobs ignore city weight. Broad choices produce no invented evidence; location/work mode are soft ranking preferences. All ranked results require two evidence signals including skills or preferred-role evidence, with experience safeguards.

Pro opens at 75%+, with 90/75/50/25% and all-ranked tiers. Dashboard filters do not change daily email policy: eligible members get up to five fresh 75%+ roles, with a count of additional matches. Profile readiness, membership access dates, alert pause/frequency and backend exclusions control eligibility.

Plans: ₹49/week, ₹149/month, ₹299/quarter; seven-day trial. Payments are non-refundable; cancellation stops renewal and preserves remaining entitlement. Checkout confirmation uses bounded polling and refreshes membership. Google/Turnstile load on authentication surfaces; Razorpay loads only when checkout is requested.

## Admin workspace and weekly company imports

The same deployment serves `admin.reerhub.com/auth` and `/dashboard`. Staging/local public hosts expose `/admin/auth` and `/admin/dashboard`; production member hosts block these admin routes. Dedicated admin testing hosts use the production-shaped paths. Google-only admin sign-in requires a separate admin session and the current database admin role.

Console capabilities: source health/schedules, company/source editing, confirmed source syncs, sync history, job-quality editing, read-only member/subscription support and before/after audit history. Daily Operations shows IST-day job-change events, sync runs, email attempts/skip summaries and current schedule state. “Scheduler enabled” is not a heartbeat; SMTP accepted is not confirmed inbox delivery. Refresh requests current data; schedules are not historical snapshots. Admin tabs use URL hashes.

### Research → upload → first sync

1. On request, research new companies after checking current database company/source identities **and prior backend JSON batches**. Include inactive/conflicting identities in exclusions; compare normalized names/slugs, website hosts and ATS board identities. This is manual research, not an automated crawler.
2. Save verified, dated JSON in the backend's `data/company-imports/`. That repository is the research record; its files do not prove import. Database/admin import history remains authoritative.
3. Admin → Companies → Import companies → upload. Maximum 25 companies / 50 sources / 500 KiB; supported providers are Greenhouse, Ashby, Lever and SmartRecruiters.
4. Wait for asynchronous feed validation and review Ready / Already exists / Conflict / Unsupported / Verification failed, feed counts and uploaded official evidence. Reachable feeds alone do not prove ownership.
5. Approve Ready companies once. Verified zero-opening feeds are valid; existing metadata/sources and disabled records are never silently replaced/reactivated.
6. Download results or reopen recent batch history. Recheck expired/failed validation (Ready checks expire after 24 hours). Retries retain committed rows.
7. Imported sources show Awaiting first sync and their next future **06:00–06:14 or 20:00–20:14 IST** slot. Import does not create jobs immediately or send email. Normal successful scheduler runs then populate openings; zero-opening companies stay out of hiring-only views.

No server seed command is needed. File format, evidence policy, first researched batch and backend endpoints are documented in the backend README. Release backend import support before this UI.

Existing-company updates are separate: upload a revised batch with a new batch ID, refresh/review metadata before/after values, approve the metadata checkbox and choose **Update metadata only**. “Already exists” still identifies an existing record; it does not create duplicates or update automatically. Only logo, industry, descriptive company type and country change; IDs, names, links, sources, active state, jobs and history are preserved. A `purpose: metadata-only` file cannot import new companies or sources. Stale previews and partial failures require refresh/review; applied rows remain applied. Do not delete production collections or rerun seeds to refresh metadata.

Company/source rows also expose Delete with a native keyboard-accessible confirmation dialog and exact-name entry. Records must first be inactive and unused; the backend rejects job/sync/source dependencies and retains audit history. Ordinary used records should remain inactive. Jobs, users, subscriptions and audit records have no new delete action.

For an incorrect used source, **Job sources → Remove source** archives it and closes only its linked active jobs after exact-name confirmation. It does not delete job records, saved references or history. Running syncs block removal; repeated clicks/retries cannot duplicate the closure/audit. Archived rows appear under **Archived · history only**, with editing/reactivation/sync disabled. **Delete unused** remains a different permanent action for genuinely unused inactive sources. Deploy the backend archive route/lease guards before this UI.

## Local setup and checks

```bash
nvm use 24
npm ci
cp .env.example .env.local
npm run dev
npm run lint
npx tsc --noEmit
npm run test:admin
npm run test:seo
npm run test:profile
npm run test:dashboard
npm run test:operations
npm run test:performance
npm run test:security
npm audit --audit-level=high
npm run build
```

Development normally listens on port 3000 and proxies to the backend on port 8000. Node 24 is required. Check the actual build output for route counts rather than relying on a fixed documented count.

`npm run build` is the standard release build. A local CSS-worker port-binding restriction previously blocked Turbopack; `npm run build -- --webpack` passed as a diagnostic fallback. It does not replace verification of the configured deployment build. No backend/database/payment/email writes are needed for this documentation-only update.

### Isolated fixtures and performance checks

`npm run test:ui:fixtures` starts the synthetic frontend on 3001 and API on 8801. Open `http://127.0.0.1:3001/api/v1/fixture` to choose anonymous/Free/trialing/active/cancelled/past-due/expired/pending accounts. Profile/dashboard modes exercise completion, thresholds, empty/error lists, pagination and delayed responses. `/api/v1/fixture-admin` supports admin states; `/api/v1/fixture-stats` records request counts. These fixtures never contact MongoDB, SMTP or Razorpay.

Set `FIXTURE_PORT` / `FIXTURE_API_PORT` for free ports. `FIXTURE_API_ONLY=1` starts just the mock API; `FIXTURE_PRODUCTION=1` starts an already-built frontend preview. Ensure the production fixture build points to the mock API and isolated output configuration from `scripts/ui-fixtures.mjs`; never benchmark a development server as production.

`npm run test:network:fixtures` proxies a localhost production preview (default target 3004, proxy 3011). It adds 150ms/request and caps aggregate response traffic at 1.6Mbps; CPU is unthrottled and external assets are outside the cap. Use a fresh cache. Mobile budgets: LCP ≤2.5s, CLS ≤0.1, lab interaction ≤200ms. Historical results are in DECISIONS; no field-INP or deployed capacity claim follows from fixtures.

## Architecture and request budgets

- Company images share one 48×48px rounded-square `CompanyLogo` frame across public pages, dashboard/saved jobs, detail headers and the admin Companies list. Artwork is contained without cropping/stretching; missing or failed images retain the same frame with initials. Admin uses the list's existing `logoUrl`, without per-company API reads. Account avatars and ReerHub branding remain separate.
- Server-rendered homepage uses one `/home` business read; public content does not await authentication or refetch after hydration.
- Company directory requests 50 summaries/open-role counts/pagination together; API search is debounced 300ms with URL state. No per-card detail requests; repeated company/job links disable automatic detail prefetch. Primary navigation retains prefetch.
- Company/job metadata and page rendering share request-scoped reads in `lib/server-reads.ts`. Mutable public data freshness belongs to backend caching, not stacked frontend TTLs.
- `lib/reerhub.ts` handles public reads. `lib/auth.ts` handles credentialed reads, serialized refresh/one permitted retry, CSRF and safe returns. `AuthProvider` is the only session authority; no per-page `getMe()` waterfalls.
- `lib/saved-store.ts` shares member-scoped saved IDs, save/unsave updates and ≥60-second focus refresh. Logout/account switching clears private state; failures keep known saves. Obsolete independent reads use AbortSignal; one consumer cannot cancel another's shared read.
- Public config and the versioned profile catalog are shared; billing/account mutations remain live and uncached.
- Browser calls stay same-origin at `/api/v1`; Next proxies to server-only `API_URL`. The separate admin proxy validates host routing and supplies the backend admin marker. `/api/config` exposes only public Google/Turnstile identifiers.
- API request budgets exclude session/auth, images, navigation and third-party assets. One content read does not mean the browser makes exactly one network request.
- SEO includes unique canonicals/social previews, eligible JobPosting markup, split sitemap feeds and readable noindex for private/admin/staging. Closed roles do not emit active JobPosting.

## Deployment and documentation

Feature PR → `develop` → verify staging → `main`. Vercel uses Node 24 and server/build-time `API_URL`, `SITE_URL`, `GOOGLE_CLIENT_ID`, `TURNSTILE_SITE_KEY`; redeploy after changing them. Deploy compatible backend contracts first.

[Deployment](docs/04-deployment.md) covers environment/host setup and release checks. [DECISIONS](docs/DECISIONS.md) retains dated decisions/results; newer notes supersede earlier blockers. [Design system](docs/design/design-system.md) defines current visual/interaction rules. Read [AGENTS](AGENTS.md) before changes.
