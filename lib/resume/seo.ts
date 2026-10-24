import type { Metadata } from "next";
export const ORIGIN = (process.env.SITE_URL || "http://localhost:3000").replace(
  /\/+$/,
  "",
);
export const SITE = `${ORIGIN}/resume`;
export const PARENT = ORIGIN;
export const safeJsonLd = (value: unknown) =>
  JSON.stringify(value).replace(/</g, "\\u003c");
export function publicMetadata(
  title: string,
  description: string,
  path: string,
): Metadata {
  const fullTitle = `${title} | REERHUB Resume Builder`;
  const images = [
    {
      url: "/resume/share-image",
      width: 1200,
      height: 630,
      alt: "REERHUB Resume Builder — Your experience, beautifully presented",
    },
  ];
  return {
    title: { absolute: fullTitle },
    description,
    alternates: { canonical: `/resume${path === "/" ? "" : path}` },
    openGraph: {
      title: fullTitle,
      description,
      url: `/resume${path === "/" ? "" : path}`,
      type: "website",
      siteName: "REERHUB Resume Builder",
      locale: "en_IN",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images,
    },
  };
}
export const RESUME_FAQS = [
  {
    question: "Is REERHUB Resume Builder free?",
    answer:
      "Yes. Create resumes with all three templates and download watermark-free PDFs for free. You do not need to sign in to edit, save a draft on this device or download a PDF.",
  },
  {
    question: "Which resume template should I choose?",
    answer:
      "Classic uses familiar serif typography. Modern adds a confident heading and accent. Technical emphasizes structured technical detail. All three use a single-column layout, selectable PDF text, and A4 or US Letter pages. Choose the structure that makes your experience easiest to read.",
  },
  {
    question: "How do I save versions for different roles?",
    answer:
      "Sign in with your shared REERHUB account, then explicitly choose Save to my account. You can duplicate resumes, create named versions and restore a saved version. Saved resumes remain available when Pro expires.",
  },
  {
    question: "Does my resume update my REERHUB matching profile?",
    answer:
      "No. Resume documents and presentation settings are separate from your matching profile. The builder does not automatically change your profile or apply to jobs.",
  },
  {
    question: "How can I tailor a resume to a job description?",
    answer:
      "Use Review in the editor to check unfinished details and compare familiar tech terms in a pasted job description against your visible resume. The comparison runs on your device, excludes contact details, and does not save the job description. It is a literal vocabulary check, not an ATS score. Add a skill only when your own experience supports it.",
  },
  {
    question: "Is AI writing assistance available?",
    answer:
      "Pro writing assistance remains disabled until provider evaluation qualifies. When available, you will review each suggestion before applying it. The builder does not guarantee ATS scores, interviews or employment.",
  },
];
export const publisher = {
  "@type": "Organization",
  "@id": `${PARENT}/#organization`,
  name: "REERHUB",
  legalName: "REERHUB TECHNOLOGIES",
  url: PARENT,
};
export const applicationSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "@id": `${SITE}/#application`,
  name: "REERHUB Resume Builder",
  url: SITE,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web browser",
  browserRequirements: "Requires JavaScript",
  inLanguage: "en",
  publisher,
  description:
    "A resume builder for tech students and professionals with three free templates, local drafts, shared-account cloud saving and watermark-free PDF export.",
  isAccessibleForFree: true,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "INR",
    description: "Resume creation, three templates and PDF downloads",
  },
  featureList: [
    "Classic, Modern and Technical single-column templates",
    "Watermark-free PDF downloads",
    "A4 and US Letter",
    "Guest drafts saved on this device",
    "Shared-account cloud saving and named versions",
    "Local actionable resume review and job-description keyword comparison",
  ],
};
export const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: RESUME_FAQS.map(({ question, answer }) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: { "@type": "Answer", text: answer },
  })),
};
export function breadcrumb(name: string, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Resume Builder", item: SITE },
      { "@type": "ListItem", position: 2, name, item: `${SITE}${path}` },
    ],
  };
}
