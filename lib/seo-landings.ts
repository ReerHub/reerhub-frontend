import type { TechTrack } from "./reerhub";
export type Landing = {
  title: string;
  track?: TechTrack;
  role?: string;
  earlyCareer?: "fresher" | "internship";
  intro: string;
  description: string;
  guidance: string[];
  editorialComplete: boolean;
};
export const JOB_LANDINGS: Record<string, Landing> = {
  "backend-jobs": {
    description:
      "Find backend engineering jobs in India from official employers. Explore API, services and systems roles, read requirements and apply directly.",
    title: "Backend engineer jobs in India",
    track: "software",
    role: "Backend Engineer",
    intro:
      "Explore backend roles building APIs, services and the systems behind software products. These openings come from official employer sources and include confirmed India locations.",
    guidance: [
      "Read the required language and framework experience before applying; a similar stack does not make every requirement interchangeable.",
      "Show a project where you owned an API, database design or reliability improvement. Explain your contribution and how you tested it.",
      "Check the employer’s requirements for distributed systems, security and on-call work. Apply through the official listing.",
    ],
    editorialComplete: true,
  },
  "frontend-jobs": {
    description:
      "Explore frontend engineering jobs in India. Review official web-development openings, framework requirements and employer application links.",
    title: "Frontend engineer jobs in India",
    track: "software",
    role: "Frontend Engineer",
    intro:
      "Find frontend engineering roles working on web interfaces and product experiences in India. Review the official description for the actual framework, accessibility and browser requirements.",
    guidance: [
      "Choose portfolio examples that demonstrate usable interfaces, responsive layouts and clear handling of loading and errors.",
      "Distinguish professional experience from personal projects when describing React, JavaScript or other frontend tools.",
      "Review design collaboration and performance responsibilities, then use the company’s official Apply link.",
    ],
    editorialComplete: true,
  },
  "full-stack-jobs": {
    description:
      "Browse full-stack engineering jobs in India, spanning frontend and backend development. Read official requirements and apply to employers.",
    title: "Full-stack engineer jobs in India",
    track: "software",
    role: "Full Stack Engineer",
    intro:
      "Browse full-stack roles that span application interfaces and backend services. The balance varies by employer: use the original description to understand where your experience fits.",
    guidance: [
      "Describe one feature you delivered across the interface, API and persistence layers, including tests and deployment responsibilities.",
      "Check whether the employer expects equal depth across the stack or a stronger frontend or backend focus.",
      "Compare mandatory experience with your own before applying. A relevance score does not verify every qualification.",
    ],
    editorialComplete: true,
  },
  "data-engineering-jobs": {
    description:
      "Find data engineering jobs in India covering pipelines, platforms and reliable datasets. Review official requirements and employer Apply links.",
    title: "Data engineering jobs in India",
    track: "data",
    role: "Data Engineer",
    intro:
      "Discover data engineering roles building pipelines, data platforms and dependable datasets. These listings use the Data Engineer taxonomy; analyst and data science roles have their own discovery filters.",
    guidance: [
      "Read the requirements for SQL, orchestration, storage and cloud platforms individually; employers may require production experience with specific tools.",
      "Explain the scale, quality checks and reliability of a pipeline you built or maintained, using numbers you can substantiate.",
      "Check ownership expectations for governance and operations before applying directly to the employer.",
    ],
    editorialComplete: true,
  },
  "devops-jobs": {
    description:
      "Explore DevOps jobs in India focused on cloud infrastructure and delivery automation. Read employer requirements and apply on official hiring sites.",
    title: "DevOps engineer jobs in India",
    track: "cloud-infra",
    role: "DevOps Engineer",
    intro:
      "Find DevOps engineering roles focused on delivery infrastructure and operational automation. Review each employer’s cloud environment, incident responsibilities and India work arrangements.",
    guidance: [
      "Use examples of deployment automation, infrastructure as code or safer release processes that you personally implemented.",
      "Check the official requirements for cloud providers, containers and operational experience, including any on-call schedule.",
      "Separate certifications from hands-on experience in your application. Follow the official company link to apply.",
    ],
    editorialComplete: true,
  },
  "qa-jobs": {
    description:
      "Browse quality engineering, software testing and SDET jobs in India. Read official requirements and apply directly to the hiring employer.",
    title: "QA and software testing jobs in India",
    track: "qa",
    intro:
      "Explore the QA track, including quality engineering, software testing and SDET openings. Employers differ in their mix of manual testing, automation and coding responsibilities.",
    guidance: [
      "Read whether the role emphasizes exploratory testing, automation frameworks or software development in test.",
      "Show how your testing identified a risk or improved release confidence, with a reproducible example rather than unsupported claims.",
      "Check required programming and experience requirements and apply on the employer’s official hiring page.",
    ],
    editorialComplete: true,
  },
  "fresher-jobs": {
    description:
      "Explore tech jobs in India with explicit employer evidence allowing freshers or no required experience. Review qualifications and apply directly.",
    title: "Tech jobs for freshers in India",
    earlyCareer: "fresher",
    intro:
      "Start with roles whose employer evidence explicitly allows freshers or states no mandatory experience. Missing experience requirements do not qualify for this page, and a junior title alone is not enough.",
    guidance: [
      "Review degree, graduation-year and location requirements on the official description; no-experience eligibility does not mean every qualification is satisfied.",
      "Describe your own contribution to coursework and projects, including what you tested and learned.",
      "Create your profile honestly with zero experience if appropriate. Review Stretch roles separately from verified Profile matches.",
    ],
    editorialComplete: true,
  },
  "internship-jobs": {
    description:
      "Find tech internships in India with explicit employer internship evidence. Review eligibility, duration and location requirements before applying.",
    title: "Engineering and tech internships in India",
    earlyCareer: "internship",
    intro:
      "Browse roles with explicit employer internship evidence and confirmed India eligibility. An internship can still have mandatory skills, student-status or prior experience requirements; read the original listing before applying.",
    guidance: [
      "Check internship duration, work arrangement, student eligibility and any employer-stated deadline.",
      "Choose projects that demonstrate relevant fundamentals and explain which work you completed yourself.",
      "Use the official Apply link. REERHUB does not promise a stipend, conversion to employment or an offer.",
    ],
    editorialComplete: true,
  },
};
export const landingQuery = (
  landing: Landing,
): Record<string, string | number> => ({
  limit: 10,
  ...(landing.track ? { techTrack: landing.track } : {}),
  ...(landing.role ? { techRole: landing.role } : {}),
  ...(landing.earlyCareer ? { earlyCareer: landing.earlyCareer } : {}),
});
export const editorialReady = (
  landing: Landing,
  inventory?: { activeRoles: number; employers: number },
) =>
  !landing.earlyCareer ||
  (landing.editorialComplete &&
    !!inventory &&
    inventory.activeRoles >= 5 &&
    inventory.employers >= 2);
