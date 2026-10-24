import { PLANS } from "./billing-plans";
import { FAQS } from "./billing-content";
import { SITE } from "./seo";
export type Faq = { id: string; question: string; answer: string };
export type FaqCategory = { id: string; title: string; items: Faq[] };
const items = (rows: string[][]): Faq[] =>
  rows.map(([id, question, answer]) => ({ id, question, answer }));
export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    id: "getting-started",
    title: "Getting started",
    items: items([
      [
        "what-is-reerhub",
        "What is ReerHub?",
        "ReerHub helps you discover engineering, AI and data jobs with confirmed India eligibility, sourced from official employer career pages and applicant tracking systems. You apply directly to the employer.",
      ],
      [
        "who-can-use",
        "Who is ReerHub for?",
        "ReerHub is for people exploring technical careers in India, including freshers, interns and experienced engineers. Read each employer’s qualifications and location requirements before applying.",
      ],
      [
        "free-browsing",
        "Can I browse and apply for free?",
        "Yes. Visitors can browse limited listing previews and read full job details with official Apply links. A free account unlocks complete browsing, saved roles and profile preferences.",
      ],
      [
        "recruitment-agency",
        "Is ReerHub a recruitment agency or an employer?",
        "ReerHub is a discovery and relevance platform. The hiring employer handles applications, interviews and hiring decisions. ReerHub does not place candidates or promise employment.",
      ],
      [
        "free-versus-pro",
        "Do I need Pro to find a job?",
        "No. Free members can browse official openings, save roles and apply directly. Pro adds profile-ranked recommendations, matching explanations and optional daily match emails.",
      ],
    ]),
  },
  {
    id: "resume-builder",
    title: "Resume Builder",
    items: items([
      [
        "resume-free",
        "Is REERHUB Resume Builder free?",
        "Yes. REERHUB Resume Builder provides three free templates and watermark-free PDF downloads without signing in. Open Resume Builder from the main navigation or at reerhub.com/resume. A shared REERHUB account adds cloud saving, duplication and named versions.",
      ],
      [
        "resume-profile",
        "Does my resume change my matching profile?",
        "No. Resume Builder documents are separate from your REERHUB matching profile. Saving or editing a resume does not automatically update profile preferences or job recommendations.",
      ],
      [
        "resume-ai",
        "Can AI write my resume?",
        "Pro writing assistance is planned but remains disabled until provider evaluation qualifies. When available, you will review suggestions before applying them. You remain responsible for confirming your experience; the builder does not guarantee interviews or ATS outcomes.",
      ],
    ]),
  },
  {
    id: "discovering-jobs",
    title: "Finding and applying for jobs",
    items: items([
      [
        "search-filters",
        "How do I find relevant jobs?",
        "Use job or skill search and the available role, track, city, work-mode and experience filters. Read the full official requirements; a filter match does not establish that you meet every qualification.",
      ],
      [
        "remote-india",
        "Are remote roles open to applicants in India?",
        "ReerHub publishes remote roles only when employer evidence confirms India eligibility. Remote does not mean worldwide: review the official location and work-authorization conditions.",
      ],
      [
        "fresher-roles",
        "How are fresher roles selected?",
        "The fresher page requires explicit employer evidence allowing freshers or no mandatory experience. Missing experience information and junior titles are not treated as zero experience. Other qualifications still apply.",
      ],
      [
        "internships",
        "Where can I find internships?",
        "Use the internship page or internship filter. These openings require explicit employer internship evidence. Check degree, graduation-year, duration and location conditions in the original listing.",
      ],
      [
        "apply-official",
        "How do I apply, and can I browse jobs by company?",
        "Company profiles show their official sources and available roles. Open a job and follow its official Apply link to the employer’s hiring site. ReerHub does not submit applications or track their status for you.",
      ],
    ]),
  },
  {
    id: "listing-quality",
    title: "Sources and listing accuracy",
    items: items([
      [
        "official-sources",
        "Where do the jobs come from?",
        "Listings come from official company career pages and supported applicant tracking systems. Source availability is not a claim that the employer endorses or partners with ReerHub.",
      ],
      [
        "source-checks",
        "How often are sources checked?",
        "Scheduled checks run twice daily, starting at 06:00 and 20:00 IST with staggered starts. Failed checks preserve previously verified jobs rather than assuming that every opening has closed.",
      ],
      [
        "listing-dates",
        "What do posting and last-checked dates mean?",
        "An original posting date appears only when supported by employer or reviewed evidence. Employer updates and the last observed feed check are separate dates. A recent check does not guarantee the employer still accepts applications.",
      ],
      [
        "closed-listings",
        "Why might a job be closed, unavailable or missing?",
        "Employers can close roles or change requirements between checks. Expired, unverified or ineligible roles may leave discovery; a closed role may retain a historical detail page. The employer’s current listing is the source of truth.",
      ],
      [
        "report-listing",
        "How do I report an incorrect listing or suspicious application request?",
        "Contact support@reerhub.com with the ReerHub listing and official employer link. Avoid sharing passwords, sign-in links, authentication codes or payment-card details. Check the employer’s domain before providing information.",
      ],
    ]),
  },
  {
    id: "accounts",
    title: "Accounts, profiles and saved roles",
    items: items([
      [
        "sign-in",
        "How do I create an account or sign in?",
        "Use Google sign-in or request an email magic link. ReerHub uses passwordless sign-in. After your session is verified, browsing and account features are available within your member workspace.",
      ],
      [
        "magic-link",
        "Why did my email sign-in link fail?",
        "Magic links expire after 15 minutes and work only once. Request a new link if the token is missing, expired or already used. Check your inbox and spam folder; never forward a sign-in link to someone else.",
      ],
      [
        "profile-preferences",
        "What should I put in my profile?",
        "Describe your actual experience, track, target roles, skills, preferred cities and work mode. The editor offers supported catalog choices. Keep your preferences current and save your changes before leaving.",
      ],
      [
        "save-roles",
        "How do saved roles work?",
        "Sign in and use the save control on a role. Your shortlist is available under Saved roles in your workspace. Saving a listing does not submit an application or reserve the opening.",
      ],
      [
        "change-profile",
        "Can I change my preferences later?",
        "Yes. Open Profile & preferences in your workspace, edit your choices and save. You can discard unsaved edits. Updated preferences inform subsequent matches; they do not change applications already sent to employers.",
      ],
    ]),
  },
  {
    id: "matching",
    title: "Pro matching and relevance",
    items: items([
      [
        "score-meaning",
        "What does a match score mean?",
        "A score describes relevance to your profile using skill, role and preference evidence. It does not predict hiring, verify every qualification or guarantee interviews. Review the matching reasons and official requirements.",
      ],
      [
        "match-groups",
        "What are Profile matches, Stretch roles and Needs review?",
        "Profile matches satisfy verified mandatory experience requirements. Stretch roles have an explicit experience gap. Needs review means required experience is uncertain. The groups help you distinguish qualification evidence from relevance.",
      ],
      [
        "match-threshold",
        "Why does the main Profile matches list use a 75% threshold?",
        "The primary strong-match list requires at least 75% relevance plus the existing evidence checks. Lower relevance and other experience groups remain separate where available. A high score is never a promise of hiring.",
      ],
      [
        "no-matches",
        "Why do I have no matches?",
        "Your profile may need required matching information, or current published roles may not meet the threshold and evidence requirements. Check the displayed state, complete your profile honestly and use Jobs to browse all official openings.",
      ],
      [
        "matching-reasons",
        "Can I see why a role matches or does not match?",
        "Eligible Pro members can review backend-ranked matching reasons, gaps and uncertainty in Matches. The methodology page explains the scoring approach. A free account can browse jobs without loading private Pro recommendations.",
      ],
    ]),
  },
  {
    id: "alerts",
    title: "Daily match emails",
    items: items([
      [
        "daily-email",
        "What is included in Pro match emails?",
        "When qualifying roles are available and alerts are enabled, Pro can send one daily email with up to five verified Profile matches scoring at least 75%. It does not send every job in the catalog.",
      ],
      [
        "email-timing",
        "When are daily match emails scheduled?",
        "The daily match digest is scheduled for 08:00 IST. Verification, service availability and email delivery can affect when it arrives. There is no guaranteed inbox arrival time.",
      ],
      [
        "no-email",
        "Why did I not receive a match email?",
        "Check that your Pro access and alerts are active, your profile has the required information and qualifying roles are available. Also check spam and inbox filters. Contact support if the issue continues.",
      ],
      [
        "pause-emails",
        "Can I pause or resume match emails?",
        "Yes. Use the alerts preference in Profile & preferences and save your choice. Pausing emails does not cancel your subscription or remove access to Matches.",
      ],
      [
        "email-vs-workspace",
        "Are emails the complete set of my matches?",
        "No. Emails contain a limited daily selection of strong Profile matches. Open Matches for the available ranked results, experience groups and explanations, or browse Jobs for all current official openings.",
      ],
    ]),
  },
  {
    id: "billing",
    title: "Plans, trials and billing",
    items: [
      {
        id: "plan-prices",
        question: "What do Pro plans cost?",
        answer:
          PLANS.map(
            (plan) =>
              `${plan.name}: ${plan.price} ${plan.per.replace("/ ", "per ")}.`,
          ).join(" ") +
          " All billing cycles provide the same Pro features. Review current pricing and checkout disclosures before subscribing.",
      },
      ...FAQS.slice(0, 5).map(([question, answer], index) => ({
        id: [
          "refunds",
          "first-charge",
          "payment-methods",
          "cancel-renewal",
          "switch-plans",
          "pro-features",
          "hiring-guarantees",
        ][index],
        question,
        answer,
      })),
    ],
  },
  {
    id: "privacy-support",
    title: "Privacy and support",
    items: items([
      [
        "optional-analytics",
        "Do I have to accept optional analytics?",
        "No. Essential cookies support sign-in and account protection. Optional product analytics requires your consent. You can reject it and continue using ReerHub.",
      ],
      [
        "privacy-choices",
        "How can I change my privacy choice?",
        "Open Privacy preferences from the footer at any time and choose Accept or Reject. Reject withdraws optional analytics consent. Your choice does not cancel your account or membership.",
      ],
      [
        "export-data",
        "Can I export my account data?",
        "Signed-in members can use the account-data export control in Profile & preferences. The export is private; do not share it publicly or send sensitive account information in a support message.",
      ],
      [
        "delete-account",
        "How do I delete my account?",
        "Use the account deletion control in Profile & preferences and review its confirmation carefully. Deletion is different from cancelling Pro renewal. Review your membership and the privacy policy before confirming.",
      ],
      [
        "contact-support",
        "How do I contact support or read the policies?",
        "Email support@reerhub.com for listing corrections, account help or billing questions. Contact and help, Privacy policy and Terms of use are linked from ReerHub. Do not include passwords, login links or payment credentials.",
      ],
    ]),
  },
];
export const ALL_FAQS = FAQ_CATEGORIES.flatMap((category) => category.items);
export function faqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${SITE}/faq#faq`,
    url: `${SITE}/faq`,
    mainEntity: ALL_FAQS.map((faq) => ({
      "@type": "Question",
      "@id": `${SITE}/faq#${faq.id}`,
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}
