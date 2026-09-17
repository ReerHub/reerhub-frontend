# Wareers Frontend

Next.js 16 + React 19 tech-job discovery UI for Wareers, an India-first platform for engineering and AI roles that indexes official company career pages and links out to official application URLs.

## Routes

- `/` — tech home: hero, 9-track pills, keyword (`q`), company, city, remoteType, skills filters, paginated results (21/page, load-more), skeletons + empty state
- `/engineering` — software-track page; `/ai` — ai-ml track page (own SEO metadata, shared `JobBrowser`)
- `/jobs/[jobId]` — job detail with track/role/seniority chips + facts and official **Apply on company site** button (`applicationUrl`, new tab)
- `/companies` — company list with live `activeJobs` counts
- `/companies/[slug]` — company detail with open-role count, sources, jobs grid

## API layer

`lib/wareers.ts` (`NEXT_PUBLIC_API_URL`, default `http://localhost:8000/api/v1`, `cache: no-store`): `listJobsWithMeta`, `getJob`, `listCompanies`, `getCompany`, `listCompanyJobs`.

Legacy auth/resume routes, middleware, and context have been removed.

## Setup

```bash
npm install
npm run dev
npm run build
npm run lint
```

## Design

Follow `docs/design/design-system.md` (v2, navy `#07152E` / blue `#2563EB` / cyan `#2DD4BF` / purple `#6366F1`, Inter, `60-70%` light surfaces). Do not invent new brand colors.
