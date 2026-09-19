# ReerHub Design System

> Version: 3.0 (supersedes v2 navy/gradient system)
>
> Status: Active
>
> Product: ReerHub (Real Effective Engineering Roles Hub)
>
> Domain: reerhub.com

---

## 1. Purpose

This document defines the visual identity and UI design system for ReerHub.

All ReerHub frontend interfaces should follow these guidelines unless a specific product decision overrides them.

The goal is to create a product that feels:

- Modern
- Professional
- Trustworthy
- Technology-driven
- Clean
- Fast
- Data-oriented
- Premium but approachable

ReerHub should feel like a modern technology product rather than a traditional job portal.

---

## 2. Brand

### Brand Name

ReerHub

### Name Origin

Acronym of "Real Effective Engineering Roles Hub" — the platform's promise in its name.

### Domain

reerhub.com

### Product Category

India-first career discovery and job search platform.

### Brand Positioning

ReerHub helps people discover career opportunities from official company hiring sources.

### Primary Brand Message

Real Effective Engineering Roles Hub.

### Secondary Messaging

Find opportunities. Build what's next.

---

## 3. Brand Personality

ReerHub should communicate the following qualities:

### Trustworthy

Users should feel confident that job information comes from legitimate company hiring sources.

### Intelligent

The product should feel data-driven and technically sophisticated.

### Modern

The UI should follow contemporary SaaS and technology-product design patterns.

### Focused

Avoid unnecessary visual complexity.

### Approachable

The product should remain easy to understand for both technical and non-technical users.

### Fast

The interface should communicate speed and efficiency.

---

## 4. Logo

### Primary Logo

The primary ReerHub logo consists of:

- W symbol (transitional mark)
- ReerHub wordmark
- Optional tagline

The logo symbol should be usable independently.

### Logo Symbol

The symbol represents:

- W → ReerHub (transitional; the mark evolves toward an R with the rebrand)
- Connection
- Opportunity
- Discovery
- Technology

The W symbol should be used for:

- Favicon
- Mobile application icon
- Social profile
- Compact navigation
- Loading states
- Small UI surfaces

### Wordmark

Use:

ReerHub

"ReerHub" uses slate 900, optionally with a brand-blue accent.

### Tagline

Primary:

Real Effective Engineering Roles Hub.

Secondary:

Find opportunities. Build what's next.

The tagline should not be used everywhere.

Use it primarily on:

- Brand presentations
- Landing page hero
- Marketing pages
- Brand assets

---

## 5. Brand Color Palette (v3 color system)

Modern, clean, premium SaaS: white backgrounds, one primary accent, no
gradients, no heavy shadows, no visual clutter. Dark ink is reserved for
workspace chrome (dashboard shell, apply card) — never marketing surfaces.

### Primary Blue (also Neural Blue)

HEX:

`#2F6FED`

Usage:

- Primary buttons, links, active states, selected filters.
- Hover `#2559C4`, active `#1D46A8`, tint `#E8F0FF` (text on tint: `#1D46A8`).
- Contrast on white: 4.5:1 (AA minimum — do not lighten for text).

---

### Neural Dark

HEX:

`#111827`

Usage:

- Headings and primary text (light surfaces).
- Single dark surface for workspace chrome (dashboard shell, apply card).

---

### Neural Gray

HEX:

`#9AA8BC`

Usage:

- Secondary text, placeholders, meta labels. Never body copy, never borders.

---

### Light Blue

HEX:

`#E8F0FF`

Usage:

- Tint panels (CTA), selected pills, focus rings. Pair with `#1D46A8` text.

---

### Background / Surface / Border

- Background `#FFFFFF`, Surface `#F7F9FC` (input wells), Border `#E2E8F0`.

---

### States

- Success `#16A34A` (text: `#166534` on white for AA), Warning `#F59E0B`
  (text: `#92400E`), Error `#DC2626`.
- Verified/official trust marks: teal, and only there.

---

### Retired v2 tokens

Navy `#07152E`/`#0B1730`, bright blue `#2563EB`, cyan/purple gradients,
glow shadows. Dashboard pastels are retained (pop against ink).

## 6. Neutral Colors

### White

HEX:

`#FFFFFF`

Usage:

- Cards / surfaces
- Text on dark backgrounds
- Navigation
- Modal and input backgrounds

---

### Neural Dark (Headings and primary text — was Slate 900)

HEX:

`#111827`

Usage:

- Headings
- Navigation
- Primary text

Do not use pure black (`#000000`) for normal text.

---

### Slate 600 (Body Text)

HEX:

`#475569`

Usage:

- Paragraphs
- Job descriptions
- Content
- Normal UI text

---

### Neural Gray (Muted text — was Slate 500)

HEX:

`#9AA8BC`

Usage:

- Labels
- Metadata
- Placeholder text
- Supporting information
- Dates
- Location information

---

### Slate 200 (Borders)

HEX:

`#E2E8F0`

Usage:

- Card borders
- Input borders
- Dividers
- Table borders
- Navigation separators

---

### Slate 50 (Light Background)

HEX:

`#F8FAFC`

Usage:

- Main application background
- Search and listing pages

This should be the default application background.

---

## 7. Semantic Colors

### Success

Primary:

`#16A34A`

Background:

`#F0FDF4`

Text (AA on white):

`#166534`

Usage:

- Successful operations
- Active status
- Verified information
- Positive metrics

---

### Error

Primary:

`#DC2626`

Background:

`#FEF2F2`

Text:

`#B91C1C`

Usage:

- Errors
- Failed operations
- Destructive actions
- Validation errors

---

### Warning

Primary:

`#F59E0B`

Background:

`#FFFBEB`

Text:

`#B45309`

Usage:

- Warnings
- Attention states
- Incomplete information

---

### Information

Primary:

`#2563EB`

Background:

`#EFF6FF`

Text:

`#1D4ED8`

Usage:

- Information messages
- Helpful notifications
- Informational alerts

---

## 8. Complete Color Tokens

The frontend should use semantic tokens rather than hardcoding colors throughout components.

Recommended tokens:

```css
:root {
  /* Brand */
  --color-navy: #07152E;
  --color-navy-deep: #0B1F3A;
  --color-brand-blue: #3B82F6;
  --color-brand-bright: #2563EB;
  --color-brand-cyan: #2DD4BF;
  --color-brand-purple: #6366F1;

  /* Backgrounds */
  --color-background: #F8FAFC;
  --color-surface: #FFFFFF;
  --color-surface-muted: #F1F5F9;

  /* Text */
  --color-text-primary: #0F172A;
  --color-text-body: #475569;
  --color-text-secondary: #64748B;
  --color-text-muted: #94A3B8;
  --color-text-inverse: #FFFFFF;

  /* Borders */
  --color-border: #E2E8F0;
  --color-border-strong: #CBD5E1;

  /* Interactive */
  --color-primary: #2563EB;
  --color-primary-hover: #1D4ED8;
  --color-primary-active: #1E40AF;

  /* Status */
  --color-success: #10B981;
  --color-success-bg: #ECFDF5;
  --color-success-text: #047857;

  --color-error: #EF4444;
  --color-error-bg: #FEF2F2;
  --color-error-text: #B91C1C;

  --color-warning: #F59E0B;
  --color-warning-bg: #FFFBEB;
  --color-warning-text: #B45309;

  --color-info: #2563EB;
  --color-info-bg: #EFF6FF;
  --color-info-text: #1D4ED8;
}
```

## 9. Brand Gradient

The official ReerHub gradient:

```css
background: linear-gradient(
  135deg,
  #2DD4BF 0%,
  #3B82F6 50%,
  #6366F1 100%
);
```

Use gradients primarily for:

- Logo
- Hero decoration
- Marketing graphics
- Large visual accents

Avoid using gradients on every button or UI component.

## 10. Color Usage Ratio

Do not make the whole website dark.

Recommended usage:

- Main background: `#F8FAFC`
- Surface / cards: `#FFFFFF`
- Primary buttons and links: `#2563EB`
- Primary button hover: `#1D4ED8`
- Accent elements: `#2DD4BF`
- Headings: `#0F172A`
- Body text: `#475569`
- Muted text: `#64748B`
- Borders: `#E2E8F0`

Use navy `#07152E` for the hero, footer, and selected dark sections
(dark section text: `#FFFFFF`).

Recommended visual balance:

- 60–70% → White / `#F8FAFC`
- 15–20% → Slate text
- 10–15% → Primary blue
- 1–5% → Cyan / purple / semantic colors

Blue represents action.

Navy represents trust and depth.

Cyan represents technology and discovery.

## 11. Typography

### Primary Font

Use:

Inter

Inter should be the default ReerHub font for:

- Headings
- Body text
- Buttons
- Navigation
- Forms
- Job listings
- Tables
- Dashboards

Fallback:

```css
font-family:
  Inter,
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  sans-serif;
```

## 12. Typography Scale

### Display

48px

Weight:

700

Line height:

1.1

Usage:

Landing page hero.

### H1

40px

Weight:

700

Line height:

1.2

### H2

32px

Weight:

700

Line height:

1.25

### H3

24px

Weight:

600

Line height:

1.3

### H4

20px

Weight:

600

Line height:

1.4

### Body Large

18px

Weight:

400

Line height:

1.6

### Body

16px

Weight:

400

Line height:

1.5

### Body Small

14px

Weight:

400

Line height:

1.5

### Caption

12px

Weight:

400

Line height:

1.4

## 13. Font Weight

Use only these weights:

- 400 → Regular
- 500 → Medium
- 600 → Semibold
- 700 → Bold

Avoid using too many font weights.

## 14. Spacing System

Use a 4px base spacing system.

4px
8px
12px
16px
20px
24px
32px
40px
48px
64px
80px
96px

Common usage:

- 4px → icon/text micro spacing
- 8px → compact elements
- 12px → small component spacing
- 16px → normal component spacing
- 24px → card padding
- 32px → section spacing
- 48px → major sections
- 64px → page sections
- 80px → hero sections

## 15. Border Radius

ReerHub should use moderately rounded components.

Recommended:

- 4px → small controls
- 6px → inputs
- 8px → buttons
- 12px → cards
- 16px → large cards
- 20px → feature sections
- 24px → hero/marketing elements

Default card radius:

12px

Default button radius:

8px

Default input radius:

8px

Avoid excessive pill-shaped components.

Pills should primarily be used for:

- Tags
- Job types
- Status badges
- Filters
- Categories

## 16. Shadows

ReerHub should use subtle shadows.

Default card:

```css
box-shadow:
  0 1px 2px rgba(15, 23, 42, 0.04);
```

Elevated card:

```css
box-shadow:
  0 4px 12px rgba(15, 23, 42, 0.08);
```

Modal:

```css
box-shadow:
  0 20px 40px rgba(15, 23, 42, 0.15);
```

Avoid heavy shadows.

## 17. Buttons

### Primary Button

Background:

`#2563EB`

Text:

`#FFFFFF`

Hover:

`#1D4ED8`

Active:

`#1E40AF`

Example:

Apply Now
Search Jobs
Explore Jobs

### Secondary Button

Background:

`#FFFFFF`

Text:

`#2563EB`

Border:

`#E2E8F0`

Hover background:

`#F8FAFC`

### Ghost Button

Background:

transparent

Text:

`#475569`

Hover:

`#F1F5F9`

### Destructive Button

Background:

`#EF4444`

Text:

`#FFFFFF`

Hover:

`#DC2626`

## 18. Job Card

Job cards are one of the most important components in ReerHub.

A job card should contain:

- Company Logo
- Job Title
- Company Name
- Location
- Work Mode
- Experience
- Job Type / Category
- Posted information
- Apply / View Job

Recommended visual hierarchy:

```text
Job Title
    ↓
Company
    ↓
Location + Work Mode
    ↓
Tags
    ↓
Posted information
```

The job title should be the strongest element.

The company name should be visually prominent but secondary to the title.

Metadata should use `#64748B`.

## 19. Company Logo

Company logos should:

- Maintain aspect ratio
- Never be stretched
- Use a consistent container
- Have a subtle border
- Use white background

Recommended container:

48 × 48px

Border radius:

10px

## 20. Job Status

### Active

Use:

`#10B981`

Example:

● Active

### Closed

Use:

`#64748B`

Example:

Closed

Closed jobs should remain in the database for historical purposes but should not appear in normal active-job searches.

## 21. Search Interface

Search is a primary ReerHub experience.

The search interface should be visually prominent.

Primary search elements:

- Search jobs, skills, companies...
- Location
- Experience
- Work Mode
- Filters
- Search

Search should feel simple rather than overwhelming.

Advanced filters can appear after the initial search.

## 22. Filters

Recommended filter categories:

- Company
- Location
- Experience
- Work Mode
- Employment Type
- Job Category
- Skills
- Date Posted

Selected filters should use the ReerHub primary blue.

Selected background:

`#EFF6FF`

Selected text:

`#2563EB`

## 23. Navigation

Primary navigation should be clean and minimal.

Recommended structure:

```text
ReerHub

Jobs
Companies
Career Intelligence

                    Sign In
```

Future navigation may include:

- Saved Jobs
- Alerts
- Profile

Navbar background:

`#FFFFFF`

Navbar border:

`#E2E8F0`

## 24. Landing Page

Recommended landing page visual hierarchy:

```text
Navigation
    ↓
Hero (navy)
    ↓
Search
    ↓
Popular Companies
    ↓
Latest Jobs
    ↓
Why ReerHub
    ↓
CTA
    ↓
Footer (deep navy)
```

Hero should communicate the core value proposition immediately.

Suggested headline:

Discover your next opportunity.

Supporting text:

Find jobs from India's top companies,
directly from their official career pages.

Primary CTA:

Explore Jobs

Secondary CTA:

Explore Companies

## 25. Data Visualization

ReerHub will eventually contain career intelligence and hiring analytics.

Charts should primarily use:

- Primary: `#2563EB`
- Secondary: `#3B82F6`
- Accent: `#2DD4BF`
- Positive: `#10B981`

Avoid using many unrelated colors.

Charts should prioritize readability over decoration.

## 26. Dark Mode

Status: implemented (class-based, Tailwind v4 `@custom-variant dark`, toggle in navbar, persisted to `localStorage` as `reerhub-theme`, pre-paint init script prevents flash; falls back to `prefers-color-scheme` on first visit).

Dark palette (actual):

```css
--dark-background: #060D1D;   /* page */
--dark-surface: #0B1A33;       /* cards */
--dark-surface-input: #060D1D; /* inputs inside dark cards */
--dark-border: rgba(255, 255, 255, 0.1);
--dark-text-primary: #FFFFFF / #F1F5F9;
--dark-text-body: #B6C2D2;
--dark-text-muted: #94A3B8;
--dark-accent: #60A5FA;        /* links / active pills (bright blue, lightened for contrast) */
--dark-accent-bg: rgba(37, 99, 235, 0.15);
--dark-highlight: #2DD4BF;     /* footer headings, toggles */
```

Suggested dark palette (reserve):

```css
--dark-background: #07152E;
--dark-surface: #0B1F3A;
--dark-surface-secondary: #1E293B;

--dark-text-primary: #F8FAFC;
--dark-text-secondary: #CBD5E1;
--dark-text-muted: #94A3B8;

--dark-border: #334155;

--dark-primary: #3B82F6;
--dark-primary-hover: #60A5FA;

--dark-success: #10B981;
--dark-error: #F87171;
```

The brand blue should remain recognizable in dark mode.

## 27. Accessibility

Accessibility is a requirement, not an optional enhancement.

All UI should:

- Maintain sufficient text contrast
- Provide visible keyboard focus
- Use semantic HTML
- Provide accessible labels
- Support keyboard navigation
- Avoid relying only on color to communicate status
- Provide meaningful alt text for images

Interactive elements must have visible focus states.

Recommended focus ring:

```css
outline:
  2px solid #3B82F6;

outline-offset:
  2px;
```

## 28. Responsive Design

ReerHub must support:

- Mobile
- Tablet
- Desktop
- Large Desktop

Primary breakpoints may follow Tailwind conventions:

- sm → 640px
- md → 768px
- lg → 1024px
- xl → 1280px
- 2xl → 1536px

Mobile should not simply be a smaller desktop layout.

Important mobile priorities:

- Search
- Job discovery
- Job details
- Apply action
- Filters

## 29. Iconography

Use a consistent icon library.

Recommended:

Lucide Icons

Icons should generally use:

- 16px → compact UI
- 20px → normal UI
- 24px → prominent UI

Avoid mixing multiple icon styles.

Avoid decorative icons that do not provide meaning.

## 30. UI Principles

### Principle 1 — Search First

ReerHub is a discovery engine.

Search and discovery should remain central.

### Principle 2 — Content First

Job information should be more visually important than decorative UI.

### Principle 3 — Trust Through Clarity

Clearly communicate:

- Company
- Source
- Location
- Job status
- Posting information
- Official application link

### Principle 4 — Minimal Complexity

Do not add UI elements just because they are visually interesting.

### Principle 5 — Consistency

The same component should look and behave the same throughout the application.

### Principle 6 — Mobile First

Every important workflow should work well on mobile.

### Principle 7 — Performance

Avoid unnecessary animations, heavy assets, and excessive client-side rendering.

## 31. Animation

Animations should be subtle.

Recommended duration:

- 100ms → micro interaction
- 150ms → button/input
- 200ms → normal transition
- 300ms → larger UI transition

Use:

```css
transition:
  all 150ms ease;
```

Avoid:

- Excessive bouncing
- Long animations
- Constant motion
- Distracting effects

## 32. Design Don'ts

Do not use:

- Excessive gradients (one brand gradient for logo/hero accents only)
- Excessive shadows
- Neon-heavy UI
- Too many colors
- Excessive rounded cards
- Giant decorative illustrations
- Generic job-board illustrations
- Overly dense dashboards
- Random icon styles
- Pure black body text
- An entirely dark website (dark is for hero, footer, and selected sections)

ReerHub should remain clean and professional.

## 33. Recommended Tailwind Color Mapping

If using Tailwind, define ReerHub tokens approximately as:

```js
colors: {
  navy: {
    DEFAULT: '#07152E',
    deep: '#0B1F3A',
  },

  brand: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#0F172A',
  },

  cyan: '#2DD4BF',
  purple: '#6366F1',

  slate: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    900: '#0F172A',
  },

  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
}
```

## 34. Design Token Priority

When implementing UI, prefer tokens in this order:

1. Semantic token
2. Brand token
3. Neutral token
4. Raw color

For example:

Prefer:

```html
className="text-text-primary"
```

instead of:

```html
className="text-[#0F172A]"
```

Avoid hardcoding colors repeatedly inside components.

## 35. Frontend Implementation Rule

The frontend should centralize design tokens.

Recommended structure:

```text
frontend/
└── src/
    ├── components/
    ├── pages/
    ├── layouts/
    ├── styles/
    │   ├── globals.css
    │   └── tokens.css
    └── ...
```

Brand colors and design tokens should be defined centrally.

Components should consume those tokens rather than defining their own brand colors.

## 36. Brand Color Quick Reference

| Token | HEX | Primary Usage |
| --- | --- | --- |
| Navy | `#07152E` | Hero, dark sections |
| Deep Navy | `#0B1F3A` | Footer, sections |
| Blue | `#3B82F6` | Primary brand |
| Bright Blue | `#2563EB` | Buttons, links |
| Cyan | `#2DD4BF` | Accents |
| Purple | `#6366F1` | Gradient/accent |
| White | `#FFFFFF` | Text on dark, surfaces |
| Slate 900 | `#0F172A` | Main text |
| Slate 600 | `#475569` | Body text |
| Slate 500 | `#64748B` | Muted text |
| Slate 200 | `#E2E8F0` | Borders |
| Slate 50 | `#F8FAFC` | Light background |
| Success | `#10B981` | Success states |
| Warning | `#F59E0B` | Warning states |
| Error | `#EF4444` | Error states |

## 37. Official ReerHub Palette

The following colors are the official starting point for ReerHub v1:

- `#07152E`
- `#0B1F3A`
- `#3B82F6`
- `#2563EB`
- `#2DD4BF`
- `#6366F1`
- `#FFFFFF`
- `#0F172A`
- `#475569`
- `#64748B`
- `#E2E8F0`
- `#F8FAFC`
- `#10B981`
- `#F59E0B`
- `#EF4444`

Do not introduce a new primary brand color without updating this document.

## 38. Future Design System Expansion

Future versions may define:

- Component library
- Button specifications
- Form specifications
- Job card variants
- Company card
- Search components
- Filter components
- Modal
- Toast
- Dropdown
- Table
- Pagination
- Empty states
- Loading states
- Skeletons
- Error states
- Dashboard components
- Charts
- Dark mode
- Accessibility specifications
- Motion guidelines

This document should evolve as the product evolves.
