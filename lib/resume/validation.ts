import { z } from "zod";
import type { ResumeDocument } from "./document";
const text = (max = 200) => z.string().max(max);
const link = z.union([
  z.literal(""),
  z
    .url()
    .max(500)
    .refine((value) => /^https?:\/\//.test(value)),
]);
const entry = z
  .object({
    id: text(80).min(1),
    title: text(),
    subtitle: text(),
    location: text(),
    start: text(40),
    end: text(40),
    url: link,
    bullets: z.array(text(1500)).max(20),
  })
  .strict();
export const documentSchema = z
  .object({
    schemaVersion: z.literal(1),
    example: z.boolean(),
    contact: z
      .object({
        name: text(120),
        headline: text(),
        email: text(254),
        phone: text(60),
        location: text(),
        website: link,
        linkedin: link,
        github: link,
      })
      .strict(),
    sections: z
      .array(
        z
          .object({
            id: text(80).min(1),
            type: z.enum([
              "summary",
              "experience",
              "projects",
              "education",
              "skills",
              "certifications",
              "achievements",
            ]),
            heading: text(80).min(1),
            visible: z.boolean(),
            text: text(6000),
            items: z.array(entry).max(30),
          })
          .strict(),
      )
      .max(12),
    presentation: z
      .object({
        template: z.enum(["classic", "modern", "technical"]),
        accent: z.enum(["violet", "ink", "blue", "forest"]),
        spacing: z.enum(["compact", "comfortable"]),
        paper: z.enum(["A4", "LETTER"]),
      })
      .strict(),
  })
  .strict()
  .refine(
    (d) =>
      new Set(d.sections.map((s) => s.id)).size === d.sections.length &&
      d.sections.every(
        (s) => new Set(s.items.map((i) => i.id)).size === s.items.length,
      ),
  )
  .refine((d) => new TextEncoder().encode(JSON.stringify(d)).length <= 80000);
// A device draft can contain unfinished headings/URLs while the candidate types.
// Keep its shape and size bounded without discarding valid work in progress.
const localDocumentSchema = documentSchema.safeExtend({
  contact: documentSchema.shape.contact.safeExtend({
    website: text(500),
    linkedin: text(500),
    github: text(500),
  }),
  sections: z
    .array(
      documentSchema.shape.sections.element.safeExtend({
        heading: text(80),
        items: z.array(entry.safeExtend({ url: text(500) })).max(30),
      }),
    )
    .max(12),
});
export function parseDraft(
  value: unknown,
): { title: string; document: ResumeDocument; example: boolean } | null {
  // Early v1 device drafts kept the example marker only on the wrapper.
  if (
    value &&
    typeof value === "object" &&
    "document" in value &&
    "example" in value
  ) {
    const draft = value as { document: unknown; example: unknown };
    if (
      draft.document &&
      typeof draft.document === "object" &&
      !("example" in draft.document) &&
      typeof draft.example === "boolean"
    )
      value = {
        ...value,
        document: { ...draft.document, example: draft.example },
      };
  }
  const result = z
    .object({
      title: text(120),
      document: localDocumentSchema,
      example: z.boolean(),
    })
    .strict()
    .safeParse(value);
  return result.success ? result.data : null;
}
