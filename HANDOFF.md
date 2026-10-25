# REERHUB frontend handoff

Updated: 2026-10-25 (Asia/Kolkata).

## Active — Apple Design across the website

Owner requested applying Apple Design across all website UI after approving the Resume Builder result. Branch feat/apple-design-site-refinement from main110e6c5. Implemented changes: app/apple-design.css imported after public.css, shared public/member hierarchy, quieter stable cards, menu materials, press feedback, FAQ/editorial refinements, reduced transparency/contrast/motion alternatives. Existing palette, wordmark, homepage animation and product behavior remain intact. Updated design guide, AGENTS and DECISIONS with the durable site-wide direction.

Local checks: lint, TypeScript, 54 SEO and12 performance regressions pass. Browser checks at desktop/390px cover discovery/filter dismissal, mobile navigation, sign-in, FAQ disclosure and pricing layout. No overflow observed; isolated catalog is empty, so populated cards and authenticated member visuals remain unverified. Standard production build passed (76 generated pages). Preview http://localhost:3030/jobs; screenshots in /tmp/reerhub-apple-*.png. Owner explicitly authorized push and merge on 2026-10-25. Release proceeds through a main-targeted PR and passing CI, followed by production checks and merged-branch cleanup.

## Completed release

Resume Builder125/6a2a131 and docs126/110e6c5 passed CI and deployed. Backend latest666073c is live. Guest recovery/download/review, mobile, noindex, canonical/assets/API and sitemap checks passed. Cloud flows have isolated fixture evidence; production authenticated writes were not exercised. AI stays disabled pending qualification. Previous merged branches were cleaned; main/develop retained.

## Preserve

Keep main/develop, unrelated backend company researchJSON, ignored evaluation/private files and owner QAfrontend3019/backend8818/Mongo27031. Synthetic QA uses API8820/Mongo27045; disposable backend suite uses27046. Never run destructive tests against Atlas/ownerQA. Prior profile releasePR122/8c52f06 and backend108 are historical; preserve explicit profile Save/no raw-PDF retention. See backend HANDOFF/README for contracts and qualification gates.
