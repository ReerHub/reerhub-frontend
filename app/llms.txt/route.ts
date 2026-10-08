const BODY = `# ReerHub — llms.txt

ReerHub (Real Effective Engineering Roles Hub, reerhub.com) is an
India-first tech-job discovery engine. Listings are indexed daily from
official company career pages and ATS boards — never scraped third-party
reposts. Applications always happen on the company's official site.

> Full job descriptions, skills, and official Apply links are public.
> Anonymous listings show up to 10 previews. Complete browsing, profile,
> and saving roles require a free Google or magic-link account.

## Browse

- All roles: /jobs
- Engineering: /engineering-jobs
- AI / ML: /ai-jobs
- Remote (India): /remote-jobs
- Companies: /companies

## Jobs by city

- Bengaluru: /bengaluru-jobs
- Chennai: /chennai-jobs
- Hyderabad: /hyderabad-jobs
- Mumbai: /mumbai-jobs
- Delhi NCR: /delhi-jobs
- Pune: /pune-jobs

## Job detail

- Canonical shape: /jobs/{title}-{company}-{id}
- Sufficiently documented active jobs carry JobPosting structured data
  matching the publicly visible description. Closed jobs omit job markup.

## Accounts

- Sign in: /login (Google or email magic link, 15-minute single-use)
- Dashboard (members): /dashboard
- Profile: /profile

## Company

- About: /#why
- Privacy: /privacy
- Terms: /terms
`;

export function GET() {
  return new Response(BODY, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
