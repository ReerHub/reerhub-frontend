import type { ResumeDocument } from "./document";

export type ReviewFinding = {
  id: string;
  title: string;
  detail: string;
  section: string;
};
const normalized = (value: string) =>
  value.trim().replace(/\s+/g, " ").toLocaleLowerCase("en");
const populated = (section: ResumeDocument["sections"][number]) =>
  Boolean(
    section.text.trim() ||
    section.items.some(
      (item) =>
        item.title.trim() ||
        item.subtitle.trim() ||
        item.bullets.some((bullet) => bullet.trim()),
    ),
  );

export function reviewResume(document: ResumeDocument): ReviewFinding[] {
  const findings: ReviewFinding[] = [];
  const add = (id: string, title: string, detail: string, section: string) =>
    findings.push({ id, title, detail, section });
  if (!document.contact.name.trim())
    add(
      "name",
      "Add your name",
      "Give the reader a clear name at the top of your resume.",
      "contact",
    );
  if (!document.contact.email.trim() && !document.contact.phone.trim())
    add(
      "contact",
      "Add a way to contact you",
      "Include an email address or phone number you want employers to use.",
      "contact",
    );
  if (document.example)
    add(
      "example",
      "Replace the example facts",
      "Review every example detail and confirm it describes your own experience before sending.",
      "contact",
    );
  const visible = document.sections.filter((section) => section.visible);
  if (
    !visible.some(
      (section) =>
        (section.type === "experience" || section.type === "projects") &&
        section.items.some(
          (item) =>
            item.title.trim() && item.bullets.some((bullet) => bullet.trim()),
        ),
    )
  )
    add(
      "evidence",
      "Show work you have done",
      "Add an experience or project with a title and a concrete description. Student and personal projects count.",
      "projects",
    );
  const seen = new Set<string>();
  for (const section of visible) {
    if (!populated(section)) {
      add(
        `empty-${section.id}`,
        `Finish or hide ${section.heading || section.type}`,
        "This section is empty and will be omitted from the PDF. Add relevant content or hide it to keep your editor focused.",
        section.id,
      );
      continue;
    }
    for (const item of section.items) {
      if (!item.title.trim())
        add(
          `title-${item.id}`,
          `Add a title in ${section.heading || section.type}`,
          "Name the role, project, qualification or achievement so its context is clear.",
          section.id,
        );
      if (
        ["experience", "education", "certifications"].includes(section.type) &&
        !item.start.trim() &&
        !item.end.trim()
      )
        add(
          `dates-${item.id}`,
          `Review dates for ${item.title || section.heading}`,
          "Add accurate dates where relevant. Leave them out if they are not applicable; never guess.",
          section.id,
        );
      for (const [index, bullet] of item.bullets.entries()) {
        const text = normalized(bullet);
        if (!text) continue;
        if (seen.has(text))
          add(
            `repeat-${item.id}-${index}`,
            "Review a repeated bullet",
            `“${bullet.slice(0, 100)}${bullet.length > 100 ? "…" : ""}” appears more than once. Keep it where it best supports your story.`,
            section.id,
          );
        seen.add(text);
        if (bullet.trim().split(/\s+/).length > 45)
          add(
            `long-${item.id}-${index}`,
            "Make a long bullet easier to scan",
            `A bullet in ${item.title || section.heading} has more than 45 words. Consider splitting or shortening it while keeping the facts.`,
            section.id,
          );
      }
    }
  }
  return findings;
}

// An explicit tech vocabulary, not a general-purpose ATS parser or semantic matcher.
export const techTerms: ReadonlyArray<{
  label: string;
  aliases: readonly string[];
}> = [
  { label: "JavaScript", aliases: ["javascript", "java script"] },
  { label: "TypeScript", aliases: ["typescript", "type script"] },
  { label: "React", aliases: ["react", "react.js", "reactjs"] },
  { label: "Next.js", aliases: ["next.js", "nextjs"] },
  { label: "Node.js", aliases: ["node.js", "nodejs", "node js"] },
  { label: "Python", aliases: ["python"] },
  { label: "Java", aliases: ["java"] },
  { label: "C++", aliases: ["c++", "cpp"] },
  { label: "C#", aliases: ["c#", "csharp", "c sharp"] },
  { label: "Go", aliases: ["golang", "go"] },
  { label: "Rust", aliases: ["rust"] },
  { label: "SQL", aliases: ["sql"] },
  { label: "PostgreSQL", aliases: ["postgresql", "postgres"] },
  { label: "MySQL", aliases: ["mysql"] },
  { label: "MongoDB", aliases: ["mongodb", "mongo db"] },
  { label: "Redis", aliases: ["redis"] },
  { label: "HTML", aliases: ["html", "html5"] },
  { label: "CSS", aliases: ["css", "css3"] },
  { label: "Git", aliases: ["git"] },
  { label: "Docker", aliases: ["docker"] },
  { label: "Kubernetes", aliases: ["kubernetes", "k8s"] },
  { label: "AWS", aliases: ["aws", "amazon web services"] },
  { label: "Azure", aliases: ["azure"] },
  { label: "Google Cloud", aliases: ["google cloud", "gcp"] },
  { label: "Terraform", aliases: ["terraform"] },
  { label: "GraphQL", aliases: ["graphql"] },
  { label: "REST", aliases: ["rest", "restful"] },
  {
    label: "CI/CD",
    aliases: [
      "ci/cd",
      "ci cd",
      "continuous integration",
      "continuous delivery",
    ],
  },
  { label: "Machine learning", aliases: ["machine learning"] },
  { label: "PyTorch", aliases: ["pytorch"] },
  { label: "TensorFlow", aliases: ["tensorflow"] },
  { label: "Figma", aliases: ["figma"] },
  { label: "Accessibility", aliases: ["accessibility", "wcag", "a11y"] },
  {
    label: "Testing",
    aliases: [
      "unit testing",
      "integration testing",
      "automated testing",
      "test automation",
    ],
  },
];
const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function hasAlias(text: string, aliases: readonly string[]) {
  return aliases.some((alias) =>
    new RegExp(
      `(?:^|[^\\p{L}\\p{N}_+#])${escape(alias)}(?=$|[^\\p{L}\\p{N}_+#])`,
      "iu",
    ).test(text),
  );
}
export function exportedContent(document: ResumeDocument): string {
  return document.sections
    .filter((section) => section.visible)
    .map((section) =>
      [
        section.text,
        ...section.items.flatMap((item) => [
          item.title,
          item.subtitle,
          ...item.bullets,
        ]),
      ].join("\n"),
    )
    .join("\n");
}
export function compareJobKeywords(
  document: ResumeDocument,
  jobDescription: string,
) {
  const content = exportedContent(document);
  const terms = techTerms.filter((term) =>
    hasAlias(jobDescription, term.aliases),
  );
  return {
    included: terms
      .filter((term) => hasAlias(content, term.aliases))
      .map((term) => term.label),
    notMentioned: terms
      .filter((term) => !hasAlias(content, term.aliases))
      .map((term) => term.label),
  };
}
