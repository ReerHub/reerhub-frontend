# Frontend decisions

## Discovery-first access

Anonymous visitors get a 10-role listing preview; full descriptions, skills and official Apply links are public. A free account unlocks complete browsing, profile and saved roles. Pro matching remains protected. Crawlers receive the same public content as visitors.

## Pro is career relevance, not hiring prediction

Only a valid Pro entitlement shows ranked recommendations, feedback controls, and daily alerts; that includes remaining access after a cancellation. A match-ready profile needs a track, target role, three skills, experience, and a city or work-mode preference. Scores communicate relevance to the member profile and never predict interviews, offers, or selection; freshness only breaks ties between qualified roles.

## Billing presentation follows backend entitlement

The frontend uses the membership response (`isPro`, `accessEndsAt`, and `cancelAtPeriodEnd`) to render billing, navigation, and Dashboard access. Plans are ₹49 weekly, ₹149 monthly, and ₹299 quarterly with a seven-day trial. Cancellation stops renewal; non-refundable payments do not shorten remaining entitled access.

## Passwordless account UX

Google and magic links are the supported sign-in methods. Deprecated password URLs redirect to Login. Cookie-based session refresh is handled once by the shared authenticated request helper; all mutating requests obtain a CSRF token.

## Visual system and motion

The final public interface uses Cobalt Blue (`#2563eb`, hover `#1d4ed8`), charcoal (`#0f172a`), soft white (`#f8fafc`), white cards, and ice blue (`#eff6ff`). Navigation/mobile navigation/footer use solid Midnight Navy `#172554`. One static shared gradient (`#172554` → `#1e40af`, 130 degrees, restrained Cobalt Blue highlight) is reserved for Pro membership, pricing and checkout panels; discovery and official application panels stay light. The homepage final CTA is white/ice blue to separate it from the footer, whose duplicate CTA is removed. Wordmarks and social previews use `ReerHub` without a decorative dot; ordinary punctuation and original logo artwork remain unchanged. Job details precede upgrade prompts; profile and dashboard share truthful completion guidance. `app/public.css` scopes tokens to the public layout, with admin using separately scoped Cobalt Blue tokens. Shared navigation, cards, status panels, and responsive shells unify Free and Pro. Motion is finite opacity/transform feedback and respects `prefers-reduced-motion`.

## Deployment and UI verification

Public page containers use a centered 1680px maximum frame with responsive 20–48px gutters and full-bleed backgrounds; extra viewport width becomes outer margins. Discovery grids follow container width and stop at four job columns or eight company tiles; long prose and forms retain reading-width limits and billing is capped at 1200px. The homepage shows up to 16 real companies ranked by active openings (zero-opening companies excluded). Its clearly labelled illustrative market-to-match animation is the one looping exception to finite motion, with pause/play, offscreen/tab-hidden suspension and a static reduced-motion state. Company tiles remain static and never imply partnership or endorsement.

`develop` is staging and `main` is production. Staging is public but served with noindex directives. `npm run test:ui:fixtures` is an in-memory local membership-state harness; it never calls database, email, or payment services and does not replace real staging checkout tests.

## Public search metadata

Public pages have unique metadata, social previews and self-referencing canonicals. Only sufficiently documented active jobs emit JobPosting markup; historical closed-role URLs remain without it. The metadata-only cursor feed populates a split sitemap index at `/sitemap.xml`, independent of the anonymous listing cap. Private/admin pages and staging use readable noindex directives. Search indexing and rich results are never guaranteed.
