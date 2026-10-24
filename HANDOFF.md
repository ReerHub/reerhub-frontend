# REERHUB frontend handoff

Updated:2026-10-25 (Asia/Kolkata).

## Active: same-app Resume Builder release

Owner superseded standalone/subdomain plan: this frontend/repository owns `/resume` and editor/templates/library/privacy children. Branch `feat/resume-builder-entry` from currentmain9cca00d; local changes await final build/PR. Owner explicitly authorized push, passing-CI merges, live checks and merged-feature cleanup. Preserve main/develop. Backend PR122 passed322 tests and merged558016d, now live on Render; health200 and unsigned resumes401/private-no-store verified.

Migrated builder pages/components/libs, scoped CSS/chrome, existing AuthProvider/CSRF/serialized refresh, owner-bound requests, identity-keyed workspaces/confirmations, guest/local recovery, explicit migration, CAS autosave/conflicts, versions/restore, library/duplicate/delete and three template PDF export. Added free local Review/JD tech-vocabulary comparison after official competitor research. Keep AI disabled until its real synthetic qualification passes; no provider/real-resume calls. Homepage/nav/footer/FAQ/SEO/sitemap/llms use same-origin paths. Legacy returns redirect locally. Original siblingprototype is preserved, not a deployment target.

Fresh local checks:22 resume tests and131 existing/frontend regressions pass; lint, fresh types and standard Next production build (76 generated pages) pass after compatible patch updates. Retain Next/config16.4.3, ESLint9/TS6 holds; incorporated compatible pending frontendPR124 floors. Actual browser tests pass guest recovery/download/extracted PDF, explicit upload, autosave, mobile390/320px design and Edit/Preview, named restore and two-tab conflict/save-as-new. Account switch clears private fields and pending confirmations, secondary library isolation and cross-tab logout pass. Production checks remain before completion.

GitHub branch audit: old frontend feature remoteheads already deleted; local merged branches have PRproof. Backend durablequeue/resume feature branches are merged. Backend dependencyPR121 passed CI, merged3c5c3d and is live; backend remote cleanup leaves main/develop only; frontendPR124 is obsolete/insecure as-is and will be superseded by checked compatible updates here. Do not merge its older Next patch. Vercel MCPteam access remains403; direct production reads authorized and available. Before frontendrelease /resume is404, expected.

## Preserve

Unrelated backend company researchJSON, ignored evaluation/private files, owner QAfrontend3019/backend8818/Mongo27031. Synthetic builder QAAPI8820/Mongo27045, disposable backend suite27046; never run destructive tests against Atlas/ownerQA. Prior profile releasePR122/8c52f06 and backend108 are historical; preserve explicit profile Save/no raw-PDF retention. See counterpart backendHANDOFF and README for contract/release gates.
