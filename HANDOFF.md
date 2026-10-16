# REERHUB frontend handoff

Updated: 2026-10-16 (Asia/Kolkata). Verify Git/CI/deployments before release work.

## Current release

Owner approved pushing/merging backend #108 and frontend #122 after browser testing, superseding the prior local-review hold. `feat/resume-first-profile` is based on main `a06acc6`. CI/release/production verification are in progress; approval is not proof of completion. Deploy compatible backend first, frontend second, verify production, then delete merged branches. No unrelated release is authorized.

## Implemented

Resume-first matching profile: upload bounded text PDF, confirm/correct skills and experience, then explicitly choose roles/location/work mode. Existing users have a saved summary and review/preference shortcuts. Five distinct skills required for readiness/import confirmation, around ten recommended, fifteen maximum. Unknown experience stays blank and blocks imported-profile completion; user confirmation is attestation, not verified employment. Explicit Save is the only profile write. Failed/cancelled uploads preserve saved fields; drafts stay in component memory. No PDF/raw-text persistence, external AI, private analytics tags or automatic checkout.

Simplified page wording/hierarchy, three-step indicator, saved-skill tags and preference summary. Idle save buttons removed from summary; back/save/discard and unsaved guards retained. Mobile save controls stay in document flow. Account settings remain separate; homepage and public/private/billing boundaries preserved.

## Validation — 2026-10-16

128 frontend regressions passed; full lint/types and standard production build passed. Desktop/390px/320px browser checks had no horizontal overflow. Fresh local browser profile: synthetic PDF produced seven skills/two years; confirmation/five-skill gates and missing preferences blocked appropriately; save/reload preserved five selected skills, two years, All India/Hybrid. Reference PDF populated ten skills but unknown experience; left unsaved and completion blocked. Accuracy/human benchmark labels remain unverified; see backend handoff.

## Local QA / preserved work

Frontend3019 uses real isolated backend8818. `/api/v1/local-qa/login` selects original test account; `?fresh=1` creates a distinct empty one. Reference draft currently open; preserve it and local saved profiles. No production writes, scheduler, email or payments in QA. Do not run destructive/full DB tests there. Preserve backend unrelated research JSON and ignored evaluation data. Companion: `../reerhub-backend/HANDOFF.md`.
