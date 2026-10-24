import { SITE } from "@/lib/seo";

const BODY = `# REERHUB

> REERHUB (Real Effective Engineering Roles Hub) helps people discover engineering, AI and data jobs with confirmed India eligibility, sourced from official employer career pages and applicant tracking systems.

Public job pages provide role descriptions, requirements and official application links. Applications are completed on the employer's website. The employer's current listing is the source of truth; a listing or relevance score does not guarantee availability, interviews or employment.

Visitors can explore limited listing previews and read full public job details. A free Google or email magic-link account adds complete browsing, a saved shortlist and profile preferences in a protected member workspace. Optional Pro membership adds profile-ranked recommendations with matching reasons and daily emails when qualifying roles are available. Match scores describe profile relevance, not hiring probability.

REERHUB TECHNOLOGIES operates REERHUB as a sole proprietorship. Personal profiles, saved roles, billing information and admin data are private and are not public reference material. This file describes the product; it does not grant additional access or replace crawler rules.

## Discover jobs and companies

- [Tech jobs in India](${SITE}/jobs): Search official engineering, AI and data openings with confirmed India eligibility.
- [Software engineering jobs](${SITE}/engineering-jobs): Browse software engineering roles.
- [AI and machine learning jobs](${SITE}/ai-jobs): Explore AI and ML opportunities.
- [Remote jobs open to India](${SITE}/remote-jobs): Review remote roles with explicit India eligibility.
- [Company directory](${SITE}/companies): Find employer profiles and official career sources.

## Engineering roles

- [Backend engineering](${SITE}/backend-jobs): Roles building APIs, services and backend systems.
- [Frontend engineering](${SITE}/frontend-jobs): Web interface and frontend development roles.
- [Full-stack engineering](${SITE}/full-stack-jobs): Roles spanning frontend and backend development.
- [Data engineering](${SITE}/data-engineering-jobs): Data pipelines and platforms.
- [DevOps engineering](${SITE}/devops-jobs): Delivery infrastructure and operational automation.
- [Quality engineering and testing](${SITE}/qa-jobs): QA, testing and SDET openings.
- [Fresher roles](${SITE}/fresher-jobs): Roles with explicit employer evidence of fresher eligibility.
- [Internships](${SITE}/internship-jobs): Openings with explicit internship evidence.

## Jobs by location

- [Bengaluru](${SITE}/bengaluru-jobs): Tech roles in Bengaluru.
- [Hyderabad](${SITE}/hyderabad-jobs): Tech roles in Hyderabad.
- [Pune](${SITE}/pune-jobs): Tech roles in Pune.
- [Chennai](${SITE}/chennai-jobs): Tech roles in Chennai.
- [Delhi NCR](${SITE}/delhi-jobs): Tech roles across Delhi, Gurgaon and Noida.
- [Mumbai](${SITE}/mumbai-jobs): Tech roles in Mumbai.

## Resume Builder

- [REERHUB Resume Builder](${SITE}/resume): A resume editor within REERHUB with three free single-column templates and watermark-free PDF downloads. No sign-in is required for local drafts and downloads. The same REERHUB account adds explicit cloud saving and named versions. Resume documents remain separate from matching profiles. Pro AI writing assistance is not yet enabled and awaits evaluation.
- [Resume templates](${SITE}/resume/templates): Classic, Modern and Technical layouts, A4 or US Letter. No ATS score or hiring guarantee.

## Product and matching

- [ReerHub blog](${SITE}/blog): Practical guides for reading tech job listings and understanding job-search evidence.
- [About REERHUB](${SITE}/about): Product purpose and business identity.
- [How ReerHub works](${SITE}/how-it-works): Free discovery, profiles, official applications and a clearly labelled Pro matching demonstration.
- [Matching methodology](${SITE}/matching-methodology): How profile relevance and experience groups are explained.
- [Pro plans and pricing](${SITE}/billing): Current prices, trial disclosures and subscription terms.
- [Contact and help](${SITE}/contact): Listing corrections, account questions and support.

- [Frequently asked questions](${SITE}/faq): Accounts, official listings, matching, alerts, billing and privacy answers.

## Optional

- [Privacy policy](${SITE}/privacy): Personal data, optional analytics and privacy choices.
- [Terms of use](${SITE}/terms): Product and subscription conditions.
- [Public sitemap](${SITE}/sitemap.xml): Canonical public URLs; active job inventory changes over time.
`;

export function GET() {
  return new Response(BODY, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
