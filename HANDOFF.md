# REERHUB frontend handoff

Updated: 2026-10-16 (Asia/Kolkata). Verify current Git/CI before release work.

## Current task / merge hold

Resume-first onboarding implemented on `feat/resume-first-profile`, based on main `a06acc6`. Owner requires local testing with real reference resumes and fresh approval before either PR merge; earlier scoped merge authorization is superseded. No frontend production change has been released. Production remains discovery/trial PR #121 at a06acc6; backend main is benchmark #107 at 88fcf85. Feature branches must remain until approved release/verification.

## Implemented

New/empty matching profile starts with PDF upload; existing users see a saved summary. Short fact confirmation and explicit role/location preferences replace the long matching form. Canonical pickers, partial saves, unsaved-navigation guards, account identity/settings/export/deletion and trial-plan links remain. Unknown experience stays blank; an imported draft needs confirmed facts and complete essentials to Save. Upload failure/cancellation leaves saved fields unchanged. No PDF/raw text/localStorage persistence, private analytics tags, external AI, automatic checkout or scoring changes. Privacy notice and existing guides updated.

## Validation — 2026-10-16

127 frontend regressions passed, including legacy preservation, failed-save retry, unknown experience, confirmation gate and imported-profile save. Lint/types/standard production build and audit passed. Browser tested synthetic upload/unknown blocking, explicit preferences and isolated save; desktop/390px/320px had no overflow or private analytics scripts. Backend full suite 204 and four later focused tests passed; production PDF parser read 223/226 reference PDFs with 96 unknown experience; all originals unchanged. Counts do not prove accuracy. Eight-profile/48-pair human labels remain pending.

## Ready for owner local test

Real frontend runs at 127.0.0.1:3019 with API_URL=http://127.0.0.1:8818/api/v1. Open http://127.0.0.1:3019/api/v1/local-qa/login for the synthetic Resume Local QA account. This uses the real parser and isolated local profile DB via backend resumeLocalQa.js, not synthetic ui-fixtures extraction responses. Upload PDFs, compare/correct facts, choose preferences, save and reload; no production changes or payment/email actions. Reopen login to reset test upload budget/session. Do not run full/destructive DB tests during owner review. See backend README/HANDOFF for restart instructions. Fixture-generated tsconfig additions are tool-owned and must be restored before commit.

## Preserved work

Original homepage/public boundaries unchanged. Preserve both local handoff updates and backend unrelated company research JSON. Companion: `../reerhub-backend/HANDOFF.md`. No merges until owner approves after testing.
