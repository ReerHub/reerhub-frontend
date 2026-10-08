# ReerHub design system

## Product direction

ReerHub is a calm, trustworthy career-discovery product. The interface should make official roles easy to scan, make the free path clearly valuable, and reserve personalized intelligence for Pro without fabricating scores or obscuring useful information.

## Foundations

- Final approved public palette: Indigo `#4F46E5`; hover `#4338CA`; deep/on-tint text `#3730A3`; lavender highlight `#EEECFF`.
- Charcoal headings `#18181B`; body text `#475569`; muted text `#64748B`.
- Canvas `#FAFAFC`; white cards `#FFFFFF`; borders `#E7E7EE`.
- Shared static dark gradient: `--public-gradient` combines a 130-degree dark Indigo `#25215a` to dark Indigo `#312E81` gradient with a restrained low-opacity `#4F46E5` radial highlight. Dark-surface text is white or pale lavender `#DEDCF3`; use solid white buttons with Indigo text.
- Use solid dark Indigo `#25215a` (`--public-chrome`) for navigation, mobile navigation and footer. Reserve the shared gradient for membership/Pro promotions, featured Monthly pricing and checkout panels. Keep discovery, official application panels, forms, account popovers and long descriptions light. The homepage final CTA is white with a soft lavender accent, charcoal heading and solid Indigo button. Selection/check indicators are independent of the Recommended label.
- The footer has no duplicate CTA row. It retains navigation columns, a decorative outlined ReerHub wordmark fading downward, legal links and copyright. Decorative lettering is hidden from assistive technology.
- The public theme lives in `app/public.css`, scoped to `.public-site`, including compatibility aliases for existing `primary` and `electric` utilities. Admin uses the same Indigo palette in its separately scoped app/admin.css; do not apply public layout overrides to admin.
- Success uses green with AA text contrast; error uses red; warnings use amber. Use semantic status rather than decorative color.
- The brand wordmark is exactly `ReerHub`, without a decorative trailing dot, including social previews and oversized footer lettering. Preserve ordinary sentence punctuation. Retain the original blue logo artwork. Do not introduce unrelated purple/cyan gradients, a theme toggle, or a replacement logo.

## Components and layout

- Use the shared navigation, footer, `PageHeader`, `JobCard`, `MembershipStatus`, `UpgradePanel`, `RecommendationPanel`, and icon system before creating parallel patterns.
- Page content uses the shared page container and responsive spacing. Cards have clear hierarchy, an official-source signal where relevant, and an obvious primary action.
- Public backgrounds are full bleed, while content uses a centered 1680px maximum frame with 20–48px responsive gutters. Extra screen width becomes outer margins. Discovery grids follow container width: job cards have a 300px minimum (or available mobile width) and at most four columns; company tiles have a 160px minimum and at most eight columns. The homepage hero uses centered copy above an unboxed illustrative workspace aligned to the full content frame, never side-by-side hero columns. Its animation shows up to 15 real directory companies and stacks vertically on mobile; only the example match retains a focused card. Billing is capped at 1200px; forms and long prose retain reading widths. Admin uses an independent responsive operations layout.
- Homepage shows up to 16 companies with current openings, ordered by opening count descending with stable name/id ties. Show real logos/counts and link to each company; omit zero-opening companies, never invent brands, endorsements or totals.
- Job-detail hierarchy: breadcrumb, role information, official application, requirements, then optional account/Pro promotion. Never put an upgrade panel ahead of the job itself. Signed-out saving returns to the same job after login.
- Dashboard/profile use the same five-signal completion checklist; readiness guidance must not claim an incomplete profile is ready. The recommendations API remains authoritative. Pro dashboard filters never change the 75%+ daily email policy.
- Buttons and touch targets are at least 44px when practical. Inputs have visible labels, useful errors, and clear disabled/loading states.
- Keyboard focus is always visible. Radio groups, tabs, menus, filters, accordions, and feedback controls must work without a pointer.

## Product states

- Anonymous: show a truthful listing preview and a clear free sign-in unlock for full browsing and saved jobs. Full job descriptions and official Apply links are public; saved-role actions require an account.
- Free: show manual discovery, saved roles, profile completion, and contextual Pro panels. Never show blurred or fake recommendations.
- Pro: show membership status, ranked relevance cards, reasons, official Apply links, save actions, feedback controls, and alert pause/resume.
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
