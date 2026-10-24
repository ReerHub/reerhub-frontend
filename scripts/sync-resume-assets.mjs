import { copyFile, mkdir } from "node:fs/promises";

const root = new URL("../", import.meta.url);
await mkdir(new URL("public/resume-assets/fonts/", root), { recursive: true });
await copyFile(
  new URL("node_modules/pdfjs-dist/build/pdf.worker.min.mjs", root),
  new URL("public/resume-assets/pdf.worker.min.mjs", root),
);
for (const [pkg, family] of [
  ["noto-sans", "NotoSans"],
  ["noto-serif", "NotoSerif"],
]) {
  for (const [weight, label] of [
    [400, "Regular"],
    [700, "Bold"],
  ]) {
    await copyFile(
      new URL(
        `node_modules/@fontsource/${pkg}/files/${pkg}-latin-${weight}-normal.woff`,
        root,
      ),
      new URL(`public/resume-assets/fonts/${family}-${label}.woff`, root),
    );
  }
  await copyFile(
    new URL(`node_modules/@fontsource/${pkg}/LICENSE`, root),
    new URL(`public/resume-assets/fonts/${family}-LICENSE.txt`, root),
  );
}
