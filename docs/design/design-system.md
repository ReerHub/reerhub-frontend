# REERHUB design system

Updated for the complete public/member premium redesign on 2026-10-13. This is a behavior/layout reference, not certification that every mobile/browser state was visually tested.

## Product direction

REERHUB is an expressive, professional, trustworthy career-discovery product. The owner-approved direction uses color, spacious typography and purposeful animation to communicate possibility and progress. Preserve existing animation and this visual direction; removing motion or reverting the palette requires an explicit user request. Accessibility and performance refinements should retain the intended visual energy. The interface should make official roles easy to scan, make the free path clearly valuable, and reserve personalized intelligence for Pro without fabricating scores or obscuring useful information.

Keep the platform strictly India-only. Store and display only jobs with confirmed India eligibility, including explicitly eligible remote or multi-country roles. Discovery, recommendations, daily alerts, company counts and homepage positioning follow the same India-only scope.

## Foundations

Public/member surfaces use warm white #fffefa, lavender #f1ebff, violet #6d4aff, hover #5736da, dark-violet links #5034b5, charcoal headings #241e30 and readable purple-gray copy #675d75. Peach/mint/lime are selective tonal accents. Reserve dark purple gradients for secure checkout and specific Pro emphasis, not general chrome. Use white space, subtle borders and rounded illustrations/cards. Admin’s cobalt foundation is independent and unchanged.

Keep Inter Bold (700) for the live-text REERHUB wordmark, original icon and Space Grotesk for display headings. Enterprise name REERHUB TECHNOLOGIES belongs in legal/business identity; no registration-pending notices or unconfirmed ®.

The viewport-wide navbar is fixed at top 0 with no outer margins or rounded corners and a constant 72px content row. Home begins transparent; after 32px scroll use warm-white translucency, 24px prefixed/standard backdrop blur, subtle bottom border and soft shadow. Other pages begin glassy. Unsupported blur uses opaque warm white. Preserve readable bounded account/mobile menus, Escape/focus and anchor clearance.

Public footers continue a warm pastel canvas with a decorative full-width Inter Bold wordmark. Dashboard/profile and signed-in billing use a shared 240px desktop sidebar and compact legal/help footer. Below 1024px, workspace destinations are in global mobile navigation. Preserve /dashboard?view=discover|saved|matches, membership defaults and all existing product states. Never fabricate statistics, jobs or match evidence.

## Components and layout

- Use the shared navigation, footer, `PageHeader`, `JobCard`, `MembershipStatus`, `UpgradePanel`, `RecommendationPanel`, and icon system before creating parallel patterns.
- Every company image uses `CompanyLogo`: one fixed 48×48px non-shrinking rounded-square frame, 12px corners, white background, subtle border and 4px padding. Center the original artwork with `object-fit: contain`; never stretch or crop its proportions. Missing/broken images use initials in the identical frame. Apply this to all member surfaces and the admin Companies list, including detail headers; account avatars, REERHUB branding and description images are separate. Prefer sharp official square/near-square icons rather than wide wordmarks.
- Page content uses the shared page container and responsive spacing. Cards have clear hierarchy, an official-source signal where relevant, and an obvious primary action.
- Public backgrounds are full bleed, while content uses a centered 1680px maximum frame with 20–48px responsive gutters. Extra screen width becomes outer margins. Discovery grids follow container width: job cards have a 300px minimum (or available mobile width) and at most four columns; company tiles have a 160px minimum and at most eight columns. The homepage uses a 1440px content frame with centered copy and a working search above the illustrative company → profile → shortlist scene, with up to three actual source companies. The navigation surface spans the viewport with a centered 1440px row; its dark feature section remains capped at 1344px. The scene rearranges vertically on mobile; real scoring evidence remains separate from illustration. Billing is capped at 1200px; forms and long prose retain reading widths. Admin uses an independent responsive operations layout.
- Homepage shows up to sixteen companies with current openings, ordered by opening count descending with stable name/id ties. Show real logos/counts and link to each company; omit zero-opening companies, never invent brands, endorsements or totals.
- Job-detail hierarchy: breadcrumb, role information, official application, requirements, then optional account/Pro promotion. Never put an upgrade panel ahead of the job itself. Signed-out saving returns to the same job after login.
- Dashboard/profile use the same five-signal completion checklist; readiness guidance must not claim an incomplete profile is ready. The recommendations API remains authoritative. Pro dashboard filters never change the 75%+ daily email policy.
- Edit Profile groups role, skills, and work preferences into three light sections. Put track first, with any role or up to three catalog roles; use searchable selections for ten skills and three cities, plus All India. Aliases are search terms, not separate saved values. A full-width pastel readiness area precedes the form inside the member workspace. Use explicit save/discard actions and protect unsaved edits. Account settings remain separate below; sign-in guidance reflects Google or magic links.
- Profile multi-selects use compact anchored popovers, not permanently expanded full-height lists. Show small selected chips/counts above a labelled search, bounded scrollable checkbox rows, no-result guidance and Done/Escape closing. Popovers may open above when space is constrained. Selected choices remain removable at the limit; never auto-select suggestions or save search text. Keep native Tab/Space checkbox behavior and visible focus.
- Dashboard views use sidebar/mobile links; profile and membership context is expandable above results. Discovery and saved roles remain available to Free and Pro; recommendations are Pro-only. Show actual role/work-mode/available-experience data and “Added” dates, never rename ingestion time as an employer posting date. Display up to three backend match reasons with accessible expansion, “Highest relevance” rather than “Exceptional fit,” and the outcome disclaimer.
- Discovery search shows only keyword, optional city and Search jobs initially, followed by one Filters disclosure and a quiet scope/sort summary. Secondary criteria use labelled controls in a responsive inline panel, not rows of competing pills. Apply filters submits secondary edits together; Cancel, Close and Escape discard them. Applied secondary selections remain visible as removable chips when collapsed, with Clear all. Keep URL/filter contracts, India-only defaults and existing search debounce; do not fetch data per option.
  Country scope controls are removed. Keep city and work-mode filters within India; legacy scope URLs normalize to India and reset pagination. Display original employer location evidence without inventing remote eligibility or sponsorship.
- View role & apply and Save/Saved are primary card actions. Interested / Not relevant are explicit feedback; application stages belong in More and are member-reported. Distinguish incomplete, tier-empty, all-empty, loading and request failure. Retry is not a browse-empty state; broader preferences never promise results.
- Admin import fits the existing Companies workspace: file selection, asynchronous progress, compact evidence/count/status preview, explicit approval and downloadable outcomes/history. Distinguish Ready/Already exists/Conflict/Unsupported/Verification failed and Awaiting first sync. A zero-opening feed may be valid; a successful import is not a job-ingestion success. Keep account/member editing visually separate from operational sync/import confirmations.
- Buttons and touch targets are at least 44px when practical. Inputs have visible labels, useful errors, and clear disabled/loading states.
- Keyboard focus is always visible. Radio groups, tabs, menus, filters, accordions, and feedback controls must work without a pointer.

## Product states

- Anonymous: show a truthful listing preview and a clear free sign-in unlock for full browsing and saved jobs. Full job descriptions and official Apply links are public; saved-role actions require an account.
  Company listings label the visible preview separately from the complete company count (for example, “Showing 10 of 18 roles”). When more roles are known, use one clearly labelled sign-in card after the real jobs, showing the remaining count and “Sign in to view all roles.” Preserve the current page after login. Never blur or fabricate job cards, promise additional jobs for small/empty lists, or imply payment is needed for full browsing.
- Free: show manual discovery, saved roles, profile completion, and contextual Pro panels. Never show blurred or fake recommendations.
- Pro: show membership status, ranked relevance cards, reasons, official Apply links, save actions, feedback controls, and alert pause/resume.
- Admin: show persisted operations/progress and honest timestamps. “Scheduler enabled” reflects configuration, not a live heartbeat; SMTP accepted does not mean inbox delivered. Current schedules stay labelled current even beside historical IST-date reports.
- Empty, loading, failed, closed-job, pending-checkout, cancelled, past-due, and expired states must explain the next safe action.

## Match and billing language

- Say “profile relevance” or “match score”; never say or imply hiring probability.
- Pro opens at the 75%+ tier and can broaden to 90/75/50/25% or all profile-ranked roles. One daily alert contains at most five fresh roles with at least 75% relevance; a quiet day may have fewer.
- Show all current plans consistently: ₹49/week, ₹149/month, ₹299/quarter. State the seven-day trial and non-refundable payment policy beside checkout and cancellation information.

## Motion and performance

- Preserve the expressive homepage motion: floating source cards, traveling signals, rotating profile artwork and the matching journey. Continuous scenes have visible pause/play controls and stop offscreen/in hidden tabs. Add finite opacity/transform entrances and interaction feedback; keep content present before JavaScript. Avoid layout shifts and scroll hijacking. Existing product routes retain their current motion until separately redesigned.
- The matching illustration uses available company logos but is explicitly not a live scan or an actual user recommendation. Never suggest all roles qualify or promise hiring outcomes. For future redesigns, carry this expressive direction into intentional illustrations and interactions while keeping job lists, forms and billing readable and stable.
- Under `prefers-reduced-motion`, content appears in its usable final state.
- Keep static sections server-rendered where possible. Isolate filters, checkout, feedback, authentication, and alert controls to client components.
- Preserve concurrent server `/home` and full `/companies` reads for the homepage, with no public-content refetch after hydration; retain combined directory page/count reads. Disable repeated card detail prefetch without removing route-loading feedback; keep primary navigation prefetch. Widgets load only on the surfaces that need them. Shared session/saved state must not flash fake empty states after failed requests.

## India discovery and Pro journey

Use the approved expressive palette for redesigned surfaces, preserving the original icon, Inter Bold wordmark and Space Grotesk display typography. All public/member routes share this direction; admin remains separate. Homepage order is proposition → keyword/city search and actual openings → source evidence → real scoring proof on fictional profiles → Free/Pro → pricing → answers. Browse jobs is primary, See how Pro works secondary. The hero scene and How it works journey are explicitly illustrative, with pause/reduced-motion/offscreen/hidden-tab behavior.

Profile matches, Stretch roles and Needs review are explicit groups. Show experience gaps and uncertainty beside positive evidence; never call a relevance score hiring probability. Freshers/internships use employer evidence and honest initialization/empty states. Public pricing/FAQ content is readable before hydration. Cookie controls provide equal rejection access, explicit analytics opt-in, preferences and persistent withdrawal access. Retain visible keyboard focus and 44px targets; compact mobile choices must not cover the search action. Offscreen layout deferral preserves public HTML.

Privacy UI stays compact on first visit and never asks to activate unconfigured analytics. With measurement disabled, use the persistent preferences control; configured first visits show a compact rejection/preferences notice. Expand full choices only on request, keep them scrollable within the viewport, and restore keyboard focus on close. The mobile first-visit panel must not cover the search fields or primary Browse jobs action.

Use explicit INR price notation to avoid loading additional currency-only font subsets while retaining the existing typefaces, amounts and trial terms. Company icons retain their approved original assets and fixed frame, but load near the viewport; a neutral loading surface is temporary, not a replacement brand icon. Keep normal no-script and older-browser fallbacks.


## Historical design decisions (superseded where noted below)

### Homepage expressive redesign — 2026-10-13

The owner approved a homepage-only departure from the cobalt palette and quiet motion. The homepage uses warm white, lavender, electric violet, peach, mint and a lime ribbon, with seamless hero navigation that becomes frosted glass after 32px of scroll and a charcoal Pro section. Other routes retain their existing design. Preserve the original icon and Inter wordmark. The hero leads with ambition, India tech discovery and working keyword/city search, followed by an explicitly illustrative source → profile → shortlist scene. Real openings, company evidence, backend-scored examples and trial terms remain intact. Continuous homepage scenes have pause controls, suspend offscreen/in hidden tabs, and become static under reduced motion. Scope shell overrides to the homepage so client navigation restores other routes.

Homepage completion includes bounded mobile/account menus, responsive oversized footer branding, visible focus, readable contrast and progressive entrance effects. No fabricated endorsements or API changes. Approved design direction is a requirement for future redesigns, not evidence that all pages or production have been updated.


### Proton-inspired refinement — 2026-10-13

Use https://proton.me/ as a reference for violet actions (#6d4aff), deep-purple headings (#372580), clean white space and soft lavender/peach glows. Retain existing typography, emotional copy, mint/coral/lime accents, looping matching scenes and oversized footer branding. At the top, the header is transparent with no enclosing border/shadow and the hero paints behind it. After 32px scroll, use a translucent warm-white surface, 18px blur, subtle lavender border and shadow; keep dimensions constant. Light menu panels remain readable in both states. Unsupported blur uses opaque light surfaces; reduced motion removes transitions.

Below the lime ribbon, show all companies returned by the public directory in a slow horizontal logo strip, linking to their directory pages. Never claim partnership or current openings for zero-opening companies. Preserve official logo assets/initials fallbacks. Hide the strip if no records are available; three or fewer records form a static row. Pause moving strips on request, hover/focus, offscreen and in hidden tabs; reduced motion uses a manually scrollable single row. Duplicate visual groups are inaccessible/noninteractive. No client public-content refetch or API contract change.


### Premium refinement using Cadence — 2026-10-13

Use https://cadence-55bab1.webflow.io/ as a reference for restraint and visual explanation. Retain ReerHub’s violet #6d4aff identity, all continuous scenes and their pause/reduced-motion behavior, seamless/frosted navigation, company directory strip and oversized footer wordmark. Make the hero predominantly warm white with soft peach/lavender glows and a quieter grid. Use charcoal #241e30 for ordinary headings; violet for emphasis/actions. Benefit cards use peach/lavender/mint tonal illustration canvases above editorial copy, with clearly illustrative search/profile/saved-role previews; do not fabricate a job, score or member data. Pro copy is concise but retains evidence qualifications, match groups and daily-email limits. Footer flows from the closing section on a warm light canvas, with charcoal headings, muted purple links and soft pastel oversized branding without another CTA row. Other routes remain unchanged.

### Continuous homepage footer and pricing continuation — 2026-10-13

The owner superseded the dark homepage footer with a Cadence-inspired light footer that shares the closing CTA’s #faf9fc canvas. Peach/lavender glows fade seamlessly into the footer; subtle dividers, charcoal labels, readable purple-gray links, violet focus/hover and a pastel full-width Inter Bold wordmark retain the approved identity and motion. Other routes keep their existing navy footer. Homepage pricing cards are whole-card links to /billing?plan=<catalog ID>#choose-plan. Billing preselects that cycle and preserves it through sign-in; checkout remains an explicit action, never started by opening a link. Active memberships retain their existing management flow. Invalid or duplicate query values fall back to Monthly. This entry describes local implementation, not a production release.

### Complete public/member redesign — 2026-10-13 (active)

Supersedes earlier homepage-only and floating-navbar restrictions above; dated sections remain design history. Rebuilt route families include discovery and role/city landings, job/company details, dashboard, profile, public/member billing, auth verification, editorial/legal and fallback states. The homepage scenes are preserved; elsewhere use finite entrances and interaction motion without obscuring initial HTML or destabilizing tasks. Public styling must never leak into admin.

Privacy preferences show brief essential-cookie/optional-analytics copy with Accept and Reject, a privacy link and Close. Never expose “not configured,” “when configured” or internal setup tasks. A stored preference alone cannot initialize measurement: valid configuration and consent are both required. Reject revokes measurement; failed writes fail closed for the session. The first-visit notice stays hidden when analytics is unavailable, but preferences remain accessible. Preserve accurate privacy disclosures and real data/action failures. Implemented locally, not evidence of production deployment.
