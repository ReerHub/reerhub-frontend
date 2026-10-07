# ReerHub design system

## Product direction

ReerHub is a calm, trustworthy career-discovery product. The interface should make official roles easy to scan, make the free path clearly valuable, and reserve personalized intelligence for Pro without fabricating scores or obscuring useful information.

## Foundations

- Brand blue: `#2F6FED`; hover `#2559C4`; blue tint `#E8F0FF`.
- Ink: `#111827`; body text: `#475569`; muted text: `#64748B`.
- Canvas: `#F7F9FC`; cards: white; borders: `#E2E8F0`.
- Success uses green with AA text contrast; error uses red; warnings use amber. Use semantic status rather than decorative color.
- Use the ReerHub logo asset and wordmark. Do not introduce legacy navy, cyan/purple gradients, a theme toggle, or a replacement logo mark.

## Components and layout

- Use the shared navigation, footer, `PageHeader`, `JobCard`, `MembershipStatus`, `UpgradePanel`, `RecommendationPanel`, and icon system before creating parallel patterns.
- Page content uses the shared page container and responsive spacing. Cards have clear hierarchy, an official-source signal where relevant, and an obvious primary action.
- Buttons and touch targets are at least 44px when practical. Inputs have visible labels, useful errors, and clear disabled/loading states.
- Keyboard focus is always visible. Radio groups, tabs, menus, filters, accordions, and feedback controls must work without a pointer.

## Product states

- Anonymous: show a truthful preview and a clear free sign-in unlock. Do not expose full descriptions, Apply links, or saved-role actions.
- Free: show manual discovery, saved roles, profile completion, and contextual Pro panels. Never show blurred or fake recommendations.
- Pro: show membership status, ranked relevance cards, reasons, official Apply links, save actions, feedback controls, and alert pause/resume.
- Empty, loading, failed, closed-job, pending-checkout, cancelled, past-due, and expired states must explain the next safe action.

## Match and billing language

- Say “profile relevance” or “match score”; never say or imply hiring probability.
- Pro opens at the 75%+ tier and can broaden to 90/75/50/25% or all profile-ranked roles. One daily alert contains at most five fresh roles with at least 75% relevance; a quiet day may have fewer.
- Show all current plans consistently: ₹49/week, ₹149/month, ₹299/quarter. State the seven-day trial and non-refundable payment policy beside checkout and cancellation information.

## Motion and performance

- Animate only opacity and transforms for entrances or direct interaction feedback. No automatic carousels, looped decorative motion, or layout-shifting animation.
- Under `prefers-reduced-motion`, content appears in its usable final state.
- Keep static sections server-rendered where possible. Isolate filters, checkout, feedback, authentication, and alert controls to client components.
