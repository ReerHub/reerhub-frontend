# Frontend decisions

## Uniform company image frames — 2026-10-10

The user selected one 48×48px company image frame everywhere rather than context-specific sizes. The shared component reserves a non-shrinking white rounded square with 12px corners, a subtle border and 4px padding; centered `object-fit: contain` artwork preserves proportions. Initials use the identical frame after missing URLs or loading failures, and a changed URL can recover. Dashboard cards now reuse this component instead of a circular image treatment. The admin Companies list renders its existing `logoUrl` without extra API reads. Account avatars, ReerHub branding, description images, backend contracts and research JSON are unchanged.

Rendered DOM regressions cover square/tall/wide images, missing/broken assets and changed URLs. Local isolated fixture browser checks measured 48×48px frames on desktop/mobile directory and company detail views; admin rows also retained uniform frames with loaded square/wide/tall SVGs and broken/missing fallbacks. These checks use synthetic data, not production writes. Admin, dashboard, profile and performance regressions, lint and TypeScript passed. The standard Turbopack production build still fails on this host's CSS-worker port-binding permission; the production Webpack diagnostic passed and does not substitute for a standard deployment build.

## Metadata previews and safe source removal — 2026-10-10

Company imports distinguish identity status from action: Already exists does not overwrite automatically. Admin sees metadata before/after values, separately approves Update metadata only, and sends reviewed timestamps. Failed results remain visible; duplicate clicks are excluded. Explicit metadata-only batches cannot create companies or sources. New file versions use new batch IDs. IDs, jobs, sources, links, active state and history remain intact.

Companies and sources now offer exact-name confirmation for permanent deletion of unused inactive records. Used incorrect sources instead expose Remove source, clearly explaining archival and closure of linked active jobs without deleting saved references or history. Current source views omit archived records; a labelled Archived filter retains History access and disables sync/edit/reactivation. Native dialog focus, Escape handling, pending-action guards and visible failures are covered by rendered DOM regressions. No production mutations were performed in verification.

Lint, TypeScript and admin DOM checks pass. Standard Turbopack build remains blocked here by a CSS-worker port-binding permission error, even with the tool escalation; the Webpack production-build diagnostic passes, but is not proof the standard deployment build passed. Deploy and verify backend metadata/archive/lease support before enabling these controls in the frontend.

## Current product documentation — 2026-10-10

README now describes the complete current member/admin journey, profile catalog selections/readiness, direct dashboard `?view=` links, matching/alert evidence, billing, weekly import workflow, shared reads and executable local checks. Deployment/design/agent guides align with it. This review changes documentation only; it does not certify new deployment checks, mobile validation, standard build success or real email delivery.

Read older sections below as dated history. The Security and staging follow-up supersedes the earlier dev-dependency audit and Vercel-protection blockers. Public/profile/save/Razorpay Test-mode/Pro checks performed on 2026-10-09 are distinct from the newer import feature's still-needed deployment checks. Preserve historical measurements instead of claiming they describe today's production.

Before a requested weekly batch, research compares the database's company/source identities, including inactive records, plus existing backend `data/company-imports/*.json`. That repo stores dated verified evidence; files do not prove import. Database/admin batch history remains authoritative. Admin previews technical feed checks separately from uploaded ownership evidence and never implies confirmation fetched jobs. Source windows remain twice daily; user alerts remain a separate eligible daily process.

## Weekly company import — 2026-10-10

Companies includes a JSON upload/preview panel using existing dedicated admin authentication and CSRF helpers. It distinguishes research evidence from technical feed checks, accepts verified zero-opening companies, requires one explicit approval and retains failed-request results. Server batch history, bounded polling, retry/recheck and downloadable results replace server seed commands. Imported sources show their next scheduler slot and current sync state; upload/confirmation never implies jobs have already been fetched.

Rendered DOM tests cover approval, failed confirmation recovery, double-click exclusion and oversized uploads. The local synthetic browser flow verified upload, preview, keyboard approval and successful import results without database/payment/email calls. Browser access was stopped before the mobile visual check. The default Turbopack build is blocked by this environment's CSS-worker port binding restriction; a production Webpack build passes. Verify the standard deployment build and mobile layout before release. Backend changes must deploy first.

## Security and staging follow-up

The earlier full-audit and staging blockers recorded below were resolved on 2026-10-09. A scoped override replaces only the Next ESLint plugin's fast-glob dependency with compatible tinyglobby 0.2.15. Next, TypeScript, ESLint and lint rules remain unchanged; no forced framework downgrade or disabled audit gate is used. Full `npm audit` reports zero vulnerabilities after a clean install. `npm run test:security` verifies wildcard Next project-root discovery, directory-only behavior and actual no-html-link-for-pages rule enforcement, and runs in CI. Frontend lint, TypeScript, all 34 regression checks and the production build passed.

Real staging checks verified public browsing, profile save/reload, cross-surface saved-state updates, Razorpay Test-mode trial activation and Pro recommendation thresholds/evidence. Not relevant persisted after reload and removed the role from every recommendation tier. Broad preferences produced no invented evidence. These checks used the isolated staging database and no real payment; actual scheduled email delivery and production capacity are not certified by them.

## Discovery-first access

Anonymous visitors get a 10-role listing preview; full descriptions, skills and official Apply links are public. A free account unlocks complete browsing, profile and saved roles. Pro matching remains protected. Crawlers receive the same public content as visitors.

## Pro is career relevance, not hiring prediction

Only a valid Pro entitlement shows ranked recommendations, feedback controls, and daily alerts; that includes remaining access after a cancellation. A match-ready profile needs a track, role preferences (selected roles or any role), three skills, experience, and location preferences (selected cities or All India). Profile roles, skills and cities are searchable selections from the backend-owned catalog, not free-text matching inputs. Scores communicate relevance to the member profile and never predict interviews, offers, or selection; freshness only breaks ties between qualified roles.

## Billing presentation follows backend entitlement

The frontend uses the membership response (`isPro`, `accessEndsAt`, and `cancelAtPeriodEnd`) to render billing, navigation, and Dashboard access. Plans are ₹49 weekly, ₹149 monthly, and ₹299 quarterly with a seven-day trial. Cancellation stops renewal; non-refundable payments do not shorten remaining entitled access.

## Passwordless account UX

Google and magic links are the supported sign-in methods. Deprecated password URLs redirect to Login. Cookie-based session refresh is handled once by the shared authenticated request helper; all mutating requests obtain a CSRF token.

## Visual system and motion

The final public interface uses Cobalt Blue (`#2563eb`, hover `#1d4ed8`), charcoal (`#0f172a`), soft white (`#f8fafc`), white cards, and ice blue (`#eff6ff`). Navigation/mobile navigation/footer use solid Midnight Navy `#172554`. One static shared gradient (`#172554` → `#1e40af`, 130 degrees, restrained Cobalt Blue highlight) is reserved for Pro membership, pricing and checkout panels; discovery and official application panels stay light. The homepage final CTA is white/ice blue to separate it from the footer, whose duplicate CTA is removed. Wordmarks and social previews use `ReerHub` without a decorative dot; ordinary punctuation and original logo artwork remain unchanged. Job details precede upgrade prompts; profile and dashboard share truthful completion guidance. `app/public.css` scopes tokens to the public layout, with admin using separately scoped Cobalt Blue tokens. Shared navigation, cards, status panels, and responsive shells unify Free and Pro. Motion is finite opacity/transform feedback and respects `prefers-reduced-motion`.

## Deployment and UI verification

Admin Daily Operations reports IST-day ingestion changes, sync outcomes and daily match-email attempts through read-only protected admin APIs. Counts are events, not unique jobs; job links show current details. It distinguishes SMTP acceptance from inbox delivery and unavailable historical skip summaries from zero skips. Source schedules reflect current state, not the selected report date.

The dashboard derives next-step guidance from current profile essentials and membership, with discovery and saved roles available to both Free and Pro. Pro recommendations show only backend-provided evidence; scores are relevance, not hiring predictions. Empty thresholds, no ranked jobs and request failures remain distinct. Application outcomes are explicitly member-reported, never inferred from link clicks. Dashboard analytics is deferred.

Public page containers use a centered 1680px maximum frame with responsive 20–48px gutters and full-bleed backgrounds; extra viewport width becomes outer margins. Discovery grids follow container width and stop at four job columns or eight company tiles; long prose and forms retain reading-width limits and billing is capped at 1200px. The homepage shows up to 16 real companies ranked by active openings (zero-opening companies excluded). Its clearly labelled illustrative market-to-match animation is the one looping exception to finite motion, with pause/play, offscreen/tab-hidden suspension and a static reduced-motion state. Company tiles remain static and never imply partnership or endorsement.

`develop` is staging and `main` is production. Staging is public but served with noindex directives. `npm run test:ui:fixtures` is an in-memory local membership-state harness; it never calls database, email, or payment services and does not replace real staging checkout tests.

## Shared reads and performance verification

Homepage content is server-rendered from one `/home` read without a hydration refetch. The directory requests 50 companies/counts together, debounces API search by 300ms and keeps URL state. Repeated company/job cards disable detail prefetch; primary navigation remains prefetched. Company/job metadata and rendering share request-scoped reads, never independent five-minute frontend caches.

One session authority shares session reads and serializes refresh, including late concurrent 401s. Member-scoped saved IDs load once and synchronize across discovery, detail and dashboard; account switching clears state, failed reads retain known values, and focus revalidation is bounded to once per minute. In-flight reads merge successful saves rather than overwrite them. Obsolete searches and tab reads use AbortSignal; shared reads cannot be cancelled by another consumer. Public config/catalog reads are shared; catalog version changes replace the catalog. Google/Turnstile remain authentication-only and Razorpay loads on checkout with a bounded load failure. Billing/account mutations remain uncached.

`npm run test:performance` checks request contracts, refresh concurrency and saved-state races. The synthetic fixture API records route counts at `/api/v1/fixture-stats`; `FIXTURE_API_ONLY=1` can pair it with an independently built production preview. `FIXTURE_PRODUCTION=1` starts an already-built fixture preview. The fixture-only performance probe reports LCP/CLS and supported event latency; it is excluded from ordinary builds.

Verified production-mode fixture requests: homepage one `/home` plus necessary session; directory one `/companies` and no per-card detail reads; Pro dashboard-to-discovery one shared saved-ID read with immediate save synchronization. Mobile 390×844 localhost homepage measured LCP 104ms/CLS 0.042, unthrottled; these are not fixed slow-network mobile budget results. Interaction latency was unavailable in this browser, and no field INP claim is made. Full deployment-equivalent mobile/network, payment-provider and staging checks remain required. Promote compatible backend support through staging before frontend deployment.

## Historical pre-release fixed-network checks

This section records earlier failures; the later Security and staging follow-up above resolves the audit/protection/real-checkout blockers. Its local network profile and measurements remain useful evidence, not a fresh release certification.

Release follow-up updates the lockfile to DOMPurify 3.4.16, sharp 0.35.5 (with matching native binaries/libvips), and source-map-js 1.2.2 using compatible security patches. `npm audit --omit=dev --audit-level=high` now reports zero vulnerabilities. The full audit still reports five high-severity entries in one dev-only dependency chain: ESLint's Next plugin → fast-glob → micromatch → braces. npm offers only a breaking downgrade to eslint-config-next 14.2.35, which is not applied to this Next 16 project. The full-audit CI gate remains enabled and unresolved; production-only audit success is not full CI success.

After the `develop` merge on 2026-10-09, an unauthenticated request to `https://staging.reerhub.com/` still returned 302 to Vercel SSO. The staging API woke successfully but still lacked the new `/home` and anonymous session contracts. Deployed end-to-end checks remain blocked until the merged backend is live and frontend protection is removed for this deployment/domain.

The compatible security patches passed frontend lint, TypeScript, all 33 regression tests and the production build. Next 16.3.8, ESLint 9.39.5 and TypeScript 6.0.3 remain unchanged.

`npm run test:network:fixtures` proxies only a localhost production fixture preview (default target 3004, listening on 3011). Its documented network profile adds 150ms request latency and caps aggregate response traffic at 1.6Mbps; CPU is unthrottled and external assets are outside that cap. Use a fresh origin/cache for cold assets. This is a lab network simulation, not a real-phone or field-INP test.

On 2026-10-09, the 390×844 local production preview measured homepage LCP 1,868ms/CLS 0.063 and directory LCP 584ms/CLS 0.019. Profile edits persisted after save/reload, and synthetic billing confirmation refreshed Pro entitlement without a payment. These checks use only in-memory fixture accounts; real Razorpay staging confirmation remains unverified. Rechecked staging still redirects to Vercel SSO, and the staging API health read timed out after 30 seconds. Do not promote the frontend before backend support is staged and the blocked end-to-end checks are completed.

## Public search metadata

Public pages have unique metadata, social previews and self-referencing canonicals. Only sufficiently documented active jobs emit JobPosting markup; historical closed-role URLs remain without it. The metadata-only cursor feed populates a split sitemap index at `/sitemap.xml`, independent of the anonymous listing cap. Private/admin pages and staging use readable noindex directives. Search indexing and rich results are never guaranteed.
