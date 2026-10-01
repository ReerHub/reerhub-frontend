const BODY = `# ReerHub — llms.txt

ReerHub (Real Effective Engineering Roles Hub, reerhub.com) is an
India-first tech-job discovery engine. Listings are indexed daily from
official company career pages and ATS boards — never scraped third-party
reposts. Applications always happen on the company's official site.

> Full job descriptions, skills, Apply links, and saving roles require a
> free account (Google or magic-link sign-in). Anonymous visitors see
> teasers: title, company, location, and a short excerpt.

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
- Detail pages carry JobPosting + FAQ structured data limited to the
  publicly visible teaser content.

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
