# 03 — Auth UX

- Email+password + Google GIS (`NEXT_PUBLIC_GOOGLE_CLIENT_ID`), sessions in httpOnly cookies (backend). Client auto-attaches CSRF (`/auth/csrf` → `x-csrf-token` on mutations) and retries once via `/auth/refresh` on 401 before surfacing errors.
- Pages redirect authed users away (`/login`, `/signup`); `next` param sanitized to internal paths.
- `/profile`: details + current role/track/skills/city/experience, verify banner + resend, change-password (email accounts), download-my-data, two-step account delete.
- Navbar shows Sign in ↔ avatar menu (name/email, Dashboard/Profile/Log out); `useAuth` is the single session source — no per-page `getMe()`.
- Backend contract lives in the backend repo (`reerhub-backend/docs/05-auth.md`); this doc covers only UX behavior.
