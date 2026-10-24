export const sectionTypes = [
  "summary",
  "experience",
  "projects",
  "education",
  "skills",
  "certifications",
  "achievements",
] as const;
export type SectionType = (typeof sectionTypes)[number];
export type Entry = {
  id: string;
  title: string;
  subtitle: string;
  location: string;
  start: string;
  end: string;
  url: string;
  bullets: string[];
};
export type Section = {
  id: string;
  type: SectionType;
  heading: string;
  visible: boolean;
  text: string;
  items: Entry[];
};
export type ResumeDocument = {
  schemaVersion: 1;
  example: boolean;
  contact: {
    name: string;
    headline: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    linkedin: string;
    github: string;
  };
  sections: Section[];
  presentation: {
    template: "classic" | "modern" | "technical";
    accent: "violet" | "ink" | "blue" | "forest";
    spacing: "compact" | "comfortable";
    paper: "A4" | "LETTER";
  };
};
export type Resume = {
  id: string;
  title: string;
  document: ResumeDocument;
  version: number;
  updatedAt: string;
};
export type ResumeSummary = Pick<
  Resume,
  "id" | "title" | "version" | "updatedAt"
>;
export const labels: Record<SectionType, string> = {
  summary: "Summary",
  experience: "Experience",
  projects: "Projects",
  education: "Education",
  skills: "Skills",
  certifications: "Certifications",
  achievements: "Achievements",
};
export const colors = {
  violet: "#6d4aff",
  ink: "#292b31",
  blue: "#2455a4",
  forest: "#21624e",
};
export const newEntry = (): Entry => ({
  id: crypto.randomUUID(),
  title: "",
  subtitle: "",
  location: "",
  start: "",
  end: "",
  url: "",
  bullets: [],
});
export const newSection = (type: SectionType): Section => ({
  id: crypto.randomUUID(),
  type,
  heading: labels[type],
  visible: true,
  text: "",
  items: [],
});
export function blankDocument(): ResumeDocument {
  return {
    schemaVersion: 1,
    example: false,
    contact: {
      name: "",
      headline: "",
      email: "",
      phone: "",
      location: "",
      website: "",
      linkedin: "",
      github: "",
    },
    sections: sectionTypes.map((type) => ({
      id: type,
      type,
      heading: labels[type],
      visible: true,
      text: "",
      items: [],
    })),
    presentation: {
      template: "modern",
      accent: "violet",
      spacing: "comfortable",
      paper: "A4",
    },
  };
}
export function exampleDocument(
  kind: "student" | "career-change" | "experienced",
): ResumeDocument {
  const doc = blankDocument();
  doc.example = true;
  doc.contact = {
    ...doc.contact,
    name: "Alex Morgan",
    headline:
      kind === "student"
        ? "Computer Science Student"
        : kind === "career-change"
          ? "Software Developer"
          : "Software Engineer",
    email: "alex@example.com",
    location: "Bengaluru, India",
    github: "https://github.com/example",
  };
  doc.sections[0].text =
    kind === "student"
      ? "Computer science student interested in building thoughtful, accessible software. Experience developing web applications through coursework and personal projects."
      : kind === "career-change"
        ? "Software developer transitioning from operations, combining practical problem solving with hands-on experience building web applications."
        : "Software engineer building reliable web applications with TypeScript, React and Node.js. Enjoys turning complex requirements into clear, maintainable products.";
  doc.sections.find((s) => s.type === "skills")!.text =
    "TypeScript, React, Node.js, SQL, Git, Testing";
  doc.sections.find((s) => s.type === "projects")!.items = [
    {
      id: "example-project",
      title: "Campus resource exchange",
      subtitle: "Personal project",
      location: "",
      start: "2025",
      end: "2026",
      url: "",
      bullets: [
        "Built a searchable resource directory using React and a Node.js API.",
        "Added automated tests for account access and search filters.",
      ],
    },
  ];
  doc.sections.find((s) => s.type === "education")!.items = [
    {
      id: "example-education",
      title: "B.Tech in Computer Science",
      subtitle: "Example Institute of Technology",
      location: "India",
      start: "2022",
      end: "2026",
      url: "",
      bullets: [],
    },
  ];
  if (kind !== "student")
    doc.sections.find((s) => s.type === "experience")!.items = [
      {
        id: "example-work",
        title:
          kind === "career-change"
            ? "Operations Associate"
            : "Software Engineer",
        subtitle: "Example Company",
        location: "Bengaluru",
        start: "2023",
        end: "Present",
        url: "",
        bullets:
          kind === "career-change"
            ? [
                "Collaborated across teams to document workflows and resolve recurring operational issues.",
              ]
            : [
                "Developed accessible interfaces and API integrations with React and TypeScript.",
                "Worked with design and engineering teammates to improve release quality.",
              ],
      },
    ];
  return doc;
}
export const GUEST_KEY = "reerhub-resume-guest-v1";
export function safeLink(value: string) {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}
export function resumeFacts(doc: ResumeDocument) {
  return doc.sections
    .filter((s) => s.visible)
    .map((s) =>
      [
        s.heading,
        s.text,
        ...s.items.map((i) =>
          [i.title, i.subtitle, i.start, i.end, ...i.bullets].join(" · "),
        ),
      ].join("\n"),
    )
    .join("\n\n");
}
