import test from "node:test";
import assert from "node:assert/strict";
import { renderToBuffer } from "@react-pdf/renderer";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { ResumePdf, registerFonts } from "../../components/resume/ResumePdf";
import { exampleDocument } from "../../lib/resume/document";
import { writeFile } from "node:fs/promises";
registerFonts(`${process.cwd()}/public`);
for (const template of ["classic", "modern", "technical"] as const)
  for (const paper of ["A4", "LETTER"] as const)
    test(`${template} ${paper} exports selectable text, link annotations and ordered multi-page content`, async () => {
      const doc = exampleDocument("experienced");
      doc.presentation = { ...doc.presentation, template, paper };
      doc.contact.name = "Zoë García";
      doc.contact.website =
        "https://example.com/" + "portfolio-path-".repeat(18);
      const section = doc.sections.find((s) => s.type === "experience")!;
      section.items = Array.from({ length: 18 }, (_, index) => ({
        ...section.items[0],
        id: `item-${index}`,
        title: `Role ${index + 1}`,
        bullets: [
          "Developed accessible interfaces with React and TypeScript.",
          "Collaborated with teammates to test and release reliable software.",
        ],
      }));
      const bytes = await renderToBuffer(<ResumePdf document={doc} />);
      assert.ok(bytes.length > 5000);
      const pdf = await getDocument({
        data: new Uint8Array(bytes),
        useSystemFonts: false,
      }).promise;
      assert.ok(pdf.numPages > 1);
      const all: string[] = [];
      let links = 0;
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        all.push(
          content.items
            .map((item) => ("str" in item ? item.str : ""))
            .join(" "),
        );
        links += (await page.getAnnotations()).filter((a) => a.url).length;
        const viewport = page.getViewport({ scale: 1 });
        assert.ok(
          Math.abs(viewport.width - (paper === "A4" ? 595.28 : 612)) < 1,
        );
        for (const item of content.items)
          if ("str" in item && item.str.trim()) {
            assert.ok(
              item.transform[5] >= 0 && item.transform[5] <= viewport.height,
              `Text outside page: ${item.str}`,
            );
          }
      }
      const text = all.join(" ");
      assert.match(text, /Zoë García/);
      assert.ok(text.indexOf("Role 1") < text.indexOf("Role 18"));
      assert.ok(links > 0);
      await pdf.cleanup();
      if (template === "modern" && paper === "A4")
        await writeFile("/tmp/reerhub-resume-verified.pdf", bytes);
    });
