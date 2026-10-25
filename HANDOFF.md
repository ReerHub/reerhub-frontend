# REERHUB frontend handoff

Updated: 2026-10-25 (Asia/Kolkata).

## Active — common Jobs/Resume navigation

Owner requested common navigation across both products. Branch feat/common-product-navigation from mainfc7b3c9; uncommitted. SiteChrome now mounts Navbar above resume routes; separate marketing headers removed, editor document toolbar retained. Member desktop/mobile product links and My resumes account link added; mobile destinations stay unique and sign-in preserves current route. Editor programmatic navigation/logout uses its unsaved confirmation. Layout reserves72px and keeps one main/header.

Local checks: lint/types,22 resume+12 performance+54 SEO tests and standard production build pass. Built-app browser verifies shared member menu, dirty cloud logout/Cancel, mobile links and PDF sizing, no overflow at390px, one main/header and no console errors. Guest autosave permits product switching without losing the locally saved draft. Screenshots /tmp/reerhub-common-navigation-{desktop,mobile}.png. Preview http://localhost:3000/resume/editor, synthetic API8820. Owner explicitly authorized push and merge on2026-10-25; proceed through passing CI, then verify production and clean the merged branch.

Apple Design PR127/fc7b3c9 passed CI and is live; production CSS/routes/mobile checks passed and feature branch cleaned. This supersedes the prior local-only checkpoint.

## Completed release

Resume Builder125/6a2a131 and docs126/110e6c5 passed CI and deployed. Backend latest666073c is live. Guest recovery/download/review, mobile, noindex, canonical/assets/API and sitemap checks passed. Cloud flows have isolated fixture evidence; production authenticated writes were not exercised. AI stays disabled pending qualification. Previous merged branches were cleaned; main/develop retained.

## Preserve

Keep main/develop, unrelated backend company researchJSON, ignored evaluation/private files and owner QAfrontend3019/backend8818/Mongo27031. Synthetic QA uses API8820/Mongo27045; disposable backend suite uses27046. Never run destructive tests against Atlas/ownerQA. Prior profile releasePR122/8c52f06 and backend108 are historical; preserve explicit profile Save/no raw-PDF retention. See backend HANDOFF/README for contracts and qualification gates.
