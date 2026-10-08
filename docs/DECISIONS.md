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

The active interface uses a light discovery surface, white cards, ReerHub blue (`#2F6FED`), and ink (`#111827`). Shared navigation, cards, status panels, and responsive page shells make free discovery and the Pro workspace feel coherent. Motion is finite feedback only and respects `prefers-reduced-motion`.

## Deployment and UI verification

`develop` is staging and `main` is production. Staging is public but served with noindex directives. `npm run test:ui:fixtures` is an in-memory local membership-state harness; it never calls database, email, or payment services and does not replace real staging checkout tests.

## Public search metadata

Public pages have unique metadata, social previews and self-referencing canonicals. Only sufficiently documented active jobs emit JobPosting markup; historical closed-role URLs remain without it. The metadata-only cursor feed populates a split sitemap index at `/sitemap.xml`, independent of the anonymous listing cap. Private/admin pages and staging use readable noindex directives. Search indexing and rich results are never guaranteed.
