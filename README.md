# REERHUB frontend

Brand: **REERHUB**. Enterprise name: **REERHUB TECHNOLOGIES** (sole proprietorship; owner confirmed registration completed). Slogan: **Real Effective Engineering Roles Hub**. Website: **reerhub.com**. Use uppercase consistently; do not imply registered trademark or display ® without separate confirmation. The live website wordmark uses existing Inter Bold (700); see design guidance.

Trademark status (12 October 2026): government submission and certificate issuance are still pending; the owner expects completion on 13 October. Ask the owner for confirmation on 15 October before updating registration claims. Keep the brand plain **REERHUB**, without ™ or ®, unless the owner later explicitly requests a symbol. Sole-proprietorship registration remains completed and is separate from trademark registration.

Public contact for support, billing and privacy: **support@reerhub.com**, display name **REERHUB Support**. Founder/business mailbox: **arfat.sayyed@reerhub.com**; keep it separate from public support links. Confirm the support mailbox receives mail before release.

Next.js 16 / React 19 / Tailwind 4 member site and admin console for REERHUB, an India-first official-source technology-job discovery product.

Production: https://reerhub.com. Staging: https://staging.reerhub.com. Reviewed against this checkout on **2026-10-10**; deployment state must be checked separately.

## What members can do

| Audience     | Available experience                                                                                                      |
| ------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Anonymous    | Homepage, hiring-company directory/details, ten-role listing previews, full job details and official employer Apply links |
| Free         | Complete manual discovery, profile editing, saved roles, account export/deletion subject to billing safeguards            |
| Entitled Pro | Free features plus ranked matches, backend-provided reasons, relevance feedback and eligible daily match alerts           |

Company job lists distinguish the preview from the complete company count: “Showing 10 of 18 roles,” followed by a clearly labelled “8 more roles available” sign-in card. Free sign-in returns to the same page and enables full browsing; no blurred/fake jobs or paid unlock. Smaller lists do not claim additional openings.

Public routes include `/`, `/companies`, `/companies/[slug]`, `/jobs`, slug-based job details, `/engineering-jobs`, `/ai-jobs`, `/remote-jobs` and Bengaluru/Mumbai/Delhi/Pune/Hyderabad/Chennai landing pages. Passwordless Google/magic-link sign-in uses `/login`; verified members use `/dashboard` and protected nested jobs/company detail, matching, saved, profile, membership, billing success and help/legal routes. Legacy `/profile` and signed-in `/billing` entry points remain compatible. Guest pricing stays public. Legal/privacy pages and public SEO metadata are included.

There is no resume upload, AI profile autofill, automatic application submission or hiring prediction. The homepage animation is illustrative, not a live scan or an actual member recommendation.

## Job-data verification and admin review

Jobs, company directory and company detail show confirmed India-eligible openings only. City/work-mode filters remain; country-scope controls are removed. Legacy scope URLs normalize to India and reset pagination. Anonymous previews and complete filtered counts remain; free sign-in unlocks full pagination. Country labels reflect employer evidence. Deploy compatible backend support and staged cleanup before frontend promotion.

Backend publication now uses one policy across public counts/discovery/sitemap/matches/alerts: active technical job and company, confirmed India eligibility, no archived source. Missing/unqualified remote location evidence is withheld for review, not assumed India. Details and saved references stay accessible. Public detail `publicEligible: false` suppresses JobPosting structured data without removing the detail page.

Admin Overview separates Public India openings, Stored active India jobs and Location review, with a polling Job data verification panel and failure retry. Initial automatic backend repair temporarily pauses dependent job reads and alerts; the frontend must not present request failure as zero matches. Jobs supports location/provenance filters, recorded reasons and official evidence review. Decisions require link/explanation/acknowledgement and preserve failed input. The ordinary editor and evidence decision cannot submit concurrently. Manual skills stay owned by admin; uncertain historical skills are retained for inspection.

Company-import results and source rows show pending/syncing/success-with-openings/success-with-zero/needs-attention outcomes with grouped backend counts, next scheduled time and last success. Import success does not imply ingestion or employer ownership. Existing JSON files remain valid. Release compatible backend support before frontend consumers; verify local repair/availability scenarios before approval, then production repair status and count consistency after deployment. Staging/develop remain paused.

The homepage matching example uses clearly fictional software/data profiles and actual published India jobs, with scores/reasons from the same engine as Pro. Switching examples never edits your profile or sends email. Empty examples remain explicit; no score or employer opening is invented. Cards and details distinguish posting/first-seen dates from exact official-feed observation times in IST; these timestamps do not certify application-link availability.

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

Profile edits submit only changed fields. Existing legacy skills remain saved when unrelated preferences change; newly selected skills still require the current profile catalog.

## Dashboard, discovery and saved jobs

The dedicated member workspace below replaces the shared visitor/member journey. Release status is tracked in GitHub and Vercel; local fixture validation alone does not establish production behavior.

The member overview shows compact saved-role, profile-essential, membership and verified-match summaries, a next step, and up to three saved and relevant roles. Free members see official openings and a Pro explanation; eligible Pro members see backend-ranked previews. Loading, missing profile requirements, catalog preparation, empty results and failed reads remain distinct. Saved counts use shared member-scoped IDs; no account export is used.

Guests use the public website. After AuthProvider verifies a session, homepage/discovery/company/role/city links move with replacement navigation into equivalent workspace destinations, retaining query parameters and anchors. A cookie hint only shows neutral session-loading chrome. The dedicated 72px top bar provides job/skill search and account controls; the desktop sidebar and bounded mobile drawer expose Overview, Jobs, Companies, Matches, Saved roles, Profile, Membership, Help and Sign out. Legacy `/dashboard?view=discover|saved|matches` links map to dedicated screens. Free members may open Matches for an upgrade explanation, but never fetch private recommendations. Search, links and sign-out preserve unsaved-edit protection. Workspace routes are protected, noindex and absent from sitemaps; public URLs retain metadata and eligible structured data.

Discovery keeps keyword/city search prominent and secondary options behind one Filters control. Apply filters submits track, company, work mode, role title, skills, career level, employment, early-career evidence and sorting together; Cancel/Escape discard pending filter edits. Removable chips show active criteria, with Clear all and existing URL state/keyword debounce retained.

Recommendation cards show company/title, location, work mode, verified required experience and distinct original-posting/first-seen/feed-check freshness. Show up to three actual backend reasons with expansion, relevance percentages/tiers and the hiring-outcome disclaimer. “Highest relevance” is not “guaranteed fit.”

View role & apply opens the corresponding workspace detail screen for members; the employer Apply link remains external. Save/Saved state is shared across dashboard/discovery/detail/related roles. Interested and Not relevant record relevance feedback; Not relevant hides the role from matches and alerts, not from all public discovery. Applied/Interview/Offer in More are explicit reported outcomes, never inferred from clicks. Duplicate in-flight actions are blocked; failures retain known state.

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

- Company images share one 48×48px rounded-square `CompanyLogo` frame across public pages, dashboard/saved jobs, detail headers and the admin Companies list. Artwork is contained without cropping/stretching; missing or failed images retain the same frame with initials. Admin uses the list's existing `logoUrl`, without per-company API reads. Account avatars and REERHUB branding remain separate.
- Server-rendered homepage concurrently reads `/home` and `/companies` for the complete company-logo strip; public content does not await authentication or refetch after hydration.
- Company directory requests 50 summaries/open-role counts/pagination together; API search is debounced 300ms with URL state. No per-card detail requests; repeated company/job links disable automatic detail prefetch. Primary navigation retains prefetch.
- Company/job metadata and page rendering share request-scoped reads in `lib/server-reads.ts`. Mutable public data freshness belongs to backend caching, not stacked frontend TTLs.
- `lib/reerhub.ts` handles public reads. `lib/auth.ts` handles credentialed reads, serialized refresh/one permitted retry, CSRF and safe returns. `AuthProvider` is the only session authority; no per-page `getMe()` waterfalls.
- `lib/saved-store.ts` shares member-scoped saved IDs, save/unsave updates and ≥60-second focus refresh. Logout/account switching clears private state; failures keep known saves. Obsolete independent reads use AbortSignal; one consumer cannot cancel another's shared read.
- Public config and the versioned profile catalog are shared; billing/account mutations remain live and uncached.
- Browser calls stay same-origin at `/api/v1`; Next proxies to server-only `API_URL`. The separate admin proxy validates host routing and supplies the backend admin marker. `/api/config` exposes only public Google/Turnstile identifiers.
- API request budgets exclude session/auth, images, navigation and third-party assets. One content read does not mean the browser makes exactly one network request.
- SEO includes unique canonicals/social previews, eligible JobPosting markup, adaptive direct/index sitemap feeds and readable noindex for private/admin/staging. Closed roles do not emit active JobPosting.

## Deployment and documentation

Feature branch from current `origin/main` → local checks → PR directly into `main` → passing CI → explicit owner approval → merge and production verification. Keep `develop` and staging unchanged and paused; no PRs, merges or synchronization into `develop` until the owner resumes them. Never commit/push directly to `main`. Vercel uses Node 24 and server/build-time `API_URL`, `SITE_URL`, `GOOGLE_CLIENT_ID`, `TURNSTILE_SITE_KEY`; redeploy after changing them. Deploy compatible backend contracts first.

[Deployment](docs/04-deployment.md) covers environment/host setup and release checks. [DECISIONS](docs/DECISIONS.md) retains dated decisions/results; newer notes supersede earlier blockers. [Design system](docs/design/design-system.md) defines current visual/interaction rules. Read [AGENTS](AGENTS.md) before changes.

## Availability during job verification

Public discovery, company counts, official job details, sitemap feeds and interactive Pro matches keep using previously verified jobs during a backend rule upgrade. Corrections appear progressively; counts may change until the latest pass completes. The backend's optional `catalogStatus` (`ready`, `updating`, `attention`) and `catalogHasVerifiedJobs` drive a small update/delay notice and a distinct first-verification state. Older backends without these fields retain normal behavior. Daily match emails wait for backend verification completion; private progress/errors remain in Admin Overview. Expected discovery data outages render explicit retry states; unexpected errors still use the existing error boundary.

Deploy compatible backend availability support before these notices. Test running/failed/resumed verification and endpoint outages on isolated local fixtures, including mobile, before requesting merge approval. After approved deployment, verify production availability and sitemaps. Local synthetic coverage is not evidence of production configuration or delivery.

## Approved visual direction

All public and member pages use the approved premium palette: warm white, peach/lavender glows, charcoal headings and violet actions, with Space Grotesk display typography and the original Inter Bold REERHUB identity. Full-width navigation and its uncapped content row sit at top 0 with responsive gutters; it is transparent over the homepage hero and becomes 24px frosted glass after 32px scroll. Other pages start with glass navigation. Dashboard/profile and signed-in billing share a 240px left sidebar on desktop, with workspace links in mobile navigation. Public pages have continuous pastel footers; workspaces have compact legal/help footers. The homepage pricing choice remains preserved through sign-in.

Preserve the animated homepage scenes, pause controls, reduced-motion alternatives and offscreen/hidden-tab suspension. Other pages use purposeful entrance/interaction motion while job information, forms and checkout remain stable. Admin retains its separate cobalt design. Removing motion or reverting this direction requires an explicit user request.

Privacy choices use simple Accept/Reject controls and no configuration-status messaging. A choice dismisses the panel without leaving a floating launcher or prompting again on later visits; footer Privacy preferences allows reopening and changing it. Acceptance stores a choice independently of configuration, but measurement requires both consent and a valid configured ID. Rejection stops measurement; failed storage writes revoke prior acceptance in the current session. Internal setup details belong in deployment docs, not product UI. Preserve truthful user-facing job/account/payment error states. This redesign is implemented locally; screenshots and fixture tests do not establish production deployment.

## India-only discovery

All discovery is for confirmed India-eligible jobs. International/All country controls are removed; city and work-mode filters remain. Old locationScope/indiaOnly URLs redirect to the same page without those parameters and reset pagination, preserving other filters. Backend legacy parameters also resolve to India. Foreign/unclear detail URLs are unavailable. Existing update/initialization notices and Pro matching remain; daily emails wait for current verification. Compatible backend India-only support precedes the frontend release. The one-time 2026-10-12 cleanup is historical; do not repeat database cleanup as a routine deployment step.

### Freshness and quality

Job cards and details show separate Posted/First seen and Last checked dates. Last checked means observed in the official employer feed, not an application-link availability guarantee. Closed details retain the last observation and show a separately recorded closure time when available. Admin overview reports jobs not seen for 30+ hours, application links returning 404/410, unavailable/pending checks and hidden exact cross-source copies. Use the Jobs quality dropdown to inspect records. Link checks are bounded to supported ATS hosts, ignore redirects and never automatically close a job. Other employer links remain unchecked. Backend rollout precedes the UI, and all PRs now target `main` and require owner approval before merging; staging/develop remain paused.

### Release verification and recovery

Local checks and passing CI are required before requesting approval. Add meaningful unit tests for changed business rules and integration/contract tests against an explicitly isolated database for persistence, authorization and failure paths. Use mocks or approved Test-mode providers for external services; never test with real payments or production fixtures. Run affected frontend regressions, lint, type checking and the standard production build, and inspect desktop/mobile when the UI changes. Documentation-only changes need proportionate diff/format/link/policy review; existing CI gates still run.

Local tests cannot fully reproduce deployed environment values, cookies, provider delivery or scheduled jobs. After an approved merge, verify the production deployment and affected behavior using low-volume reads by default. Prepare extra checks and recovery steps/limitations for migrations, authentication and billing changes. Preserve backend-before-frontend compatibility. Merges do not authorize independent database/configuration mutations, manual source syncs or real provider actions. See the 2026-10-12 direct-to-main decision in DECISIONS; when staging is needed again, agree with the owner how to realign `develop` from current `main`.

## SEO and conversion journeys

Homepage leads with India-only discovery, native keyword/city search, actual openings, source evidence and real scoring proof on fictional profiles. Browse jobs is primary; Pro explanation is secondary. Free discovery remains available before optional Pro. Public prices, Free/Pro comparison, trial billing and FAQ render in initial HTML; checkout stays interactive and member-scoped. Six self-canonical role pages cover backend, frontend, full-stack, data engineering, DevOps and QA using exact taxonomy filters and original application guidance. Fresher/internship pages remain noindex/outside sitemaps until five evidence-qualified active roles span two employers with completed editorial content; this is our launch policy, not a Google rule.

Pro separates Profile matches, Stretch roles and Needs review with independent counts/tier controls. Unknown requirements are never zero experience. Strong matches and daily emails require verified experience fit plus >=75 relevance; scores are not hiring probabilities. About, matching methodology and contact use confirmed business facts. Privacy choices version optional consent separately from necessary cookies. Optional measurement requires explicit opt-in. GTM takes precedence over direct GA4; public configuration and release verification are documented in the deployment guide. Search Console ownership and reports must be verified separately. See deployment instructions for activation and release evidence in DECISIONS.

### Crawl files and IndexNow

`/sitemap.xml` is the submission URL: a direct XML URL list while one file suffices, automatically an index when actual serialized XML exceeds 10,000 URLs or 45 MiB. `/sitemaps/{id}` remains compatible. Fresh, concurrent source reads use the full company catalog and complete cursor-based backend-approved India job feed; early-career publication thresholds remain unchanged. Invalid responses, repeated cursors and source outages return 503 with `Retry-After: 60`, never a partial inventory. Generic persistence timestamps are omitted from `lastmod`; there are no artificial dates, priority or changefreq fields, or independent content cache.

Production robots allow public search/AI crawling and rendering assets, exclude APIs and advertise the shared canonical sitemap. Private noindex responses remain readable; authentication protects workspace/admin data. Staging advertises no production sitemap. `llms.txt` provides accurate public product guidance and absolute links, not a ranking mechanism.

The supplied IndexNow ownership file is served at the site root. `npm run indexnow -- --file changed-urls.json` previews a JSON array of changed canonical public URLs against the live sitemap. `npm run indexnow -- --all` previews an initial inventory submission. Only an explicitly authorized live operation adds `--submit`: it verifies the deployed key, submits batches of at most 10,000 URLs, and stops on errors without automatic retry. Successful 200/202 means received/pending key validation, not guaranteed indexing. No page read, build or frontend event sends notifications. Automatic content-change notifications are implemented separately by the backend's production-only opt-in worker: durable five-minute public-job comparisons retain removed URLs, batch notifications and retry failures. That local backend implementation still requires an approved release and activation. This frontend command remains an operator fallback for current inventory; it does not handle deleted URLs.

### Page headings, metadata and FAQ

Public route families use one primary heading and distinct descriptions. Role landing metadata has dedicated complete summaries instead of truncated introduction paragraphs; the 155-character ceiling is editorial, not a Google policy. Private workspace/auth screens have meaningful route-specific titles/descriptions, noindex and no public canonical. Resolved job/company identities retain their public canonicals; unavailable metadata never fabricates employer facts. The workspace shell renders public content once; only the overview’s legacy query entry requires a small Suspense boundary. The global loading boundary has been replaced by route-specific loading views so the public FAQ is readable without JavaScript; existing discovery/private/admin loading appearances are retained.

`/faq` provides 41 server-rendered questions across eight product topics, native accordions, stable answer anchors, progressive Expand/Collapse controls and mobile topic navigation. The protected `/dashboard/faq` reuses content without public structured data. Homepage FAQs move to this dedicated page; contextual billing/application answers remain. Only `/faq` emits FAQPage markup, generated from the visible answer source, plus breadcrumbs. Public sitemap, llms and help/footer links include FAQ. Schema.org still defines FAQPage, but Google stopped showing FAQ rich results on May 7, 2026; no ranking/rich-result guarantee is made.

### Consent-controlled Tag Manager

The owner supplied GTM-KQD9XXJL. GTM_CONTAINER_ID overrides that public identifier; production defaults to it when unset, explicitly empty disables it, local/test defaults off. Accepted optional consent and a confirmed guest session allow one async GTM script in the public document head. Public pageviews omit queries/fragments/referrers; advertising storage, personalization and Google signals are disabled. Member/auth/admin/noindex routes and credential-bearing URLs stay unmeasured. Crossing into private pages uses a fresh document, and withdrawal clears analytics cookies then reloads so executed tags cannot survive. No noscript tracker bypasses consent. Legacy direct GA4 remains isolated and is not installed alongside GTM. Public GTM replaces the earlier opaque-frame GTM decision; production delivery and account settings require verification, not inference from a deployed loader. See deployment guidance for GA4 enhanced-measurement and container configuration.

Public inner pages use visible breadcrumbs aligned with their canonical BreadcrumbList markup. Member trails start at Overview and stay inside the protected workspace, without public breadcrumb schema. Homepage, sign-in and admin surfaces omit trails. Organization attribution uses REERHUB TECHNOLOGIES; no personal author credentials are implied. Raster optimization is selective: official SVG/PNG/ICO logos and the PNG share card remain supported.

The homepage previews three real openings and up to 30 distinct directory companies using its existing server reads. The product explanation, live sample profiles and illustrative matching animation live at `/how-it-works`, with a protected `/dashboard/how-it-works` mirror. The old home `#how-pro-works` anchor leads to a compact link to the new page. Unknown opening counts and catalog outages remain explicit.

Public pricing/support polish (2026-10-14, local only): guest navigation uses Pricing at the existing /billing URL, preserving canonicals and selected-plan/member compatibility. Cadence is a presentation reference for centered pastel introductions, light selectable Pro cards and clear Free/Pro comparison; prices, trial, refunds and checkout contracts are unchanged. Contact now collects name, email, topic and a plain-text message through the shared CSRF client, with a honeypot, validation, confirmed success and retryable errors. Queries appear in the existing protected admin shell under Contact inbox, with pagination and New/In progress/Resolved controls; no automatic emails or response-time promises. Contact data expires after 180 days and is disclosed separately from account/profile export. Legal pages have server-rendered section navigation; About and methodology retain factual organization attribution and gain matching introductions. Public/member composite search fields use a single outer focus treatment, and footer copyright is centered with the legal links. Admin styling remains unchanged apart from the requested inbox feature. No release is authorized; the compatible backend must deploy first after separate approval.

2026-10-14 blog/release update: add a page-based /blog index and three practical guides (reading a listing, a fresher shortlist, understanding match scores). Content and explicit metadata live in lib/blog.ts and lib/blog-catalog.ts; no admin CMS, database blog table, subscription form or invented personal author is added. Authors/publisher are REERHUB TECHNOLOGIES with a visible About link. Public articles render full text and matching BlogPosting metadata; protected /dashboard/blog mirrors omit public article schema and remain noindex. Public catalog URLs feed breadcrumbs, the sitemap and consent-gated analytics; unknown slugs return 404 and do not enter the tag allowlist. Edit dates when substantive article content changes, not on every build.

The owner subsequently authorized PRs, merge and production verification after local checks. This supersedes earlier local-only release restrictions for this combined work. Release the compatible support backend before the frontend; verify production receipt and admin authorization, published article metadata, pricing continuation, privacy choices, footer alignment and field focus. Initial local screenshots/fixtures do not establish deployment. No branch deletion is requested.
