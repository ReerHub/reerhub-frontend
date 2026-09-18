# Known issues (frontend)

## Current

- No e2e tests (unit/type/build gates only).
- Cookie consent is notice-only: accept/decline both keep strictly-necessary login cookies (nothing optional exists to disable); choice stored in localStorage.
- Dashboard greeting remounts on account switch (key-remount by design).

## Resolved

- Double navbar (global + dashboard mini-nav) → single auth-aware `Navbar`.
- GIS `initialize() called multiple times` → single-init guard.
- Missing legal pages → `/privacy` + `/terms` + consent.
- Plain `<img>` logos/avatars → `next/image` + remote patterns.
- Placeholder-only auth forms → real `<label>`s.
- Scroll-behavior router warning → `data-scroll-behavior` attr.
