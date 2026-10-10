# ReerHub design system

Reviewed against the current profile, dashboard and admin import components on 2026-10-10. This is a behavior/layout reference, not certification that every mobile/browser state was visually tested.

## Product direction

ReerHub is a calm, trustworthy career-discovery product. The interface should make official roles easy to scan, make the free path clearly valuable, and reserve personalized intelligence for Pro without fabricating scores or obscuring useful information.

## Foundations

- Final approved public palette: Cobalt Blue `#2563eb`; hover `#1d4ed8`; deep/on-tint text `#1e40af`; ice blue highlight `#eff6ff`.
- Charcoal headings `#0f172a`; body text `#475569`; muted text `#64748B`.
- Canvas `#f8fafc`; white cards `#FFFFFF`; borders `#e2e8f0`.
- Shared static dark gradient: `--public-gradient` combines a 130-degree Midnight Navy `#172554` to Royal Blue `#1e40af` gradient with a restrained low-opacity `#2563eb` radial highlight. Dark-surface text is white or pale ice blue `#dbeafe`; use solid white buttons with Cobalt Blue text.
- Use solid Midnight Navy `#172554` (`--public-chrome`) for navigation, mobile navigation and footer. Reserve the shared gradient for membership/Pro promotions, featured Monthly pricing and checkout panels. Keep discovery, official application panels, forms, account popovers and long descriptions light. The homepage final CTA is white with a soft ice blue accent, charcoal heading and solid Cobalt Blue button. Selection/check indicators are independent of the Recommended label.
- The footer has no duplicate CTA row. It retains navigation columns, the combined reerhub-sticker-logo-text image, legal links and copyright. Public navigation uses the icon alone; the footer has no separately rendered brand wordmark.
- The public theme lives in `app/public.css`, scoped to `.public-site`, including compatibility aliases for existing `primary` and `electric` utilities. Admin uses the same Cobalt Blue palette in its separately scoped app/admin.css; do not apply public layout overrides to admin.
- Success uses green with AA text contrast; error uses red; warnings use amber. Use semantic status rather than decorative color.
- The brand wordmark is exactly `ReerHub`, without a decorative trailing dot, including social previews. Preserve ordinary sentence punctuation. Retain the original blue logo artwork. Do not introduce unrelated purple/cyan gradients, a theme toggle, or a replacement logo.

## Components and layout

- Use the shared navigation, footer, `PageHeader`, `JobCard`, `MembershipStatus`, `UpgradePanel`, `RecommendationPanel`, and icon system before creating parallel patterns.
- Every company image uses `CompanyLogo`: one fixed 48×48px non-shrinking rounded-square frame, 12px corners, white background, subtle border and 4px padding. Center the original artwork with `object-fit: contain`; never stretch or crop its proportions. Missing/broken images use initials in the identical frame. Apply this to all member surfaces and the admin Companies list, including detail headers; account avatars, ReerHub branding and description images are separate. Prefer sharp official square/near-square icons rather than wide wordmarks.
- Page content uses the shared page container and responsive spacing. Cards have clear hierarchy, an official-source signal where relevant, and an obvious primary action.
- Public backgrounds are full bleed, while content uses a centered 1680px maximum frame with 20–48px responsive gutters. Extra screen width becomes outer margins. Discovery grids follow container width: job cards have a 300px minimum (or available mobile width) and at most four columns; company tiles have a 160px minimum and at most eight columns. The homepage hero uses centered copy above an unboxed illustrative workspace aligned to the full content frame, never side-by-side hero columns. Its animation shows up to 15 real directory companies and stacks vertically on mobile; only the example match retains a focused card. Billing is capped at 1200px; forms and long prose retain reading widths. Admin uses an independent responsive operations layout.
- Homepage shows up to 16 companies with current openings, ordered by opening count descending with stable name/id ties. Show real logos/counts and link to each company; omit zero-opening companies, never invent brands, endorsements or totals.
- Job-detail hierarchy: breadcrumb, role information, official application, requirements, then optional account/Pro promotion. Never put an upgrade panel ahead of the job itself. Signed-out saving returns to the same job after login.
- Dashboard/profile use the same five-signal completion checklist; readiness guidance must not claim an incomplete profile is ready. The recommendations API remains authoritative. Pro dashboard filters never change the 75%+ daily email policy.
- Edit Profile groups role, skills, and work preferences into three light sections. Put track first, with any role or up to three catalog roles; use searchable selections for ten skills and three cities, plus All India. Aliases are search terms, not separate saved values. Desktop readiness sits beside the form; mobile readiness precedes it. Use explicit save/discard actions and protect unsaved edits. Account settings remain separate below; sign-in guidance reflects Google or magic links.
- Profile multi-selects use compact anchored popovers, not permanently expanded full-height lists. Show small selected chips/counts above a labelled search, bounded scrollable checkbox rows, no-result guidance and Done/Escape closing. Popovers may open above when space is constrained. Selected choices remain removable at the limit; never auto-select suggestions or save search text. Keep native Tab/Space checkbox behavior and visible focus.
- Dashboard guidance precedes tabs/job content on mobile. Discovery and saved roles remain available to Free and Pro; recommendations are Pro-only. Show actual role/work-mode/available-experience data and “Added” dates, never rename ingestion time as an employer posting date. Display up to three backend match reasons with accessible expansion, “Highest relevance” rather than “Exceptional fit,” and the outcome disclaimer.
- View role & apply and Save/Saved are primary card actions. Interested / Not relevant are explicit feedback; application stages belong in More and are member-reported. Distinguish incomplete, tier-empty, all-empty, loading and request failure. Retry is not a browse-empty state; broader preferences never promise results.
- Admin import fits the existing Companies workspace: file selection, asynchronous progress, compact evidence/count/status preview, explicit approval and downloadable outcomes/history. Distinguish Ready/Already exists/Conflict/Unsupported/Verification failed and Awaiting first sync. A zero-opening feed may be valid; a successful import is not a job-ingestion success. Keep account/member editing visually separate from operational sync/import confirmations.
- Buttons and touch targets are at least 44px when practical. Inputs have visible labels, useful errors, and clear disabled/loading states.
- Keyboard focus is always visible. Radio groups, tabs, menus, filters, accordions, and feedback controls must work without a pointer.

## Product states

- Anonymous: show a truthful listing preview and a clear free sign-in unlock for full browsing and saved jobs. Full job descriptions and official Apply links are public; saved-role actions require an account.
- Free: show manual discovery, saved roles, profile completion, and contextual Pro panels. Never show blurred or fake recommendations.
- Pro: show membership status, ranked relevance cards, reasons, official Apply links, save actions, feedback controls, and alert pause/resume.
- Admin: show persisted operations/progress and honest timestamps. “Scheduler enabled” reflects configuration, not a live heartbeat; SMTP accepted does not mean inbox delivered. Current schedules stay labelled current even beside historical IST-date reports.
- Empty, loading, failed, closed-job, pending-checkout, cancelled, past-due, and expired states must explain the next safe action.

## Match and billing language

- Say “profile relevance” or “match score”; never say or imply hiring probability.
- Pro opens at the 75%+ tier and can broaden to 90/75/50/25% or all profile-ranked roles. One daily alert contains at most five fresh roles with at least 75% relevance; a quiet day may have fewer.
- Show all current plans consistently: ₹49/week, ₹149/month, ₹299/quarter. State the seven-day trial and non-refundable payment policy beside checkout and cancellation information.

## Motion and performance

- Animate only opacity and transforms for entrances or direct interaction feedback. No automatic carousels or layout-shifting animation. The homepage matching explainer is the single purposeful looping exception: subtle source movement and signals converge through profile fit into a shortlist, with a visible pause/play control. Stop it offscreen and when the tab is hidden.
- The matching illustration uses available company logos but is explicitly not a live scan or an actual user recommendation. Never suggest all roles qualify or promise hiring outcomes. Keep other pages quiet rather than adding loops to job lists, forms or billing.
- Under `prefers-reduced-motion`, content appears in its usable final state.
- Keep static sections server-rendered where possible. Isolate filters, checkout, feedback, authentication, and alert controls to client components.
- Preserve one server homepage content read and combined directory page/count reads. Disable repeated card detail prefetch without removing route-loading feedback; keep primary navigation prefetch. Widgets load only on the surfaces that need them. Shared session/saved state must not flash fake empty states after failed requests.
