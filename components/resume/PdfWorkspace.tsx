"use client";
import { useConfirm } from "./ConfirmationProvider";
import { useEffect, useRef, useState } from "react";
import { Download, LoaderCircle, ZoomIn, ZoomOut } from "lucide-react";
import { recordMetric } from "@/lib/resume/metrics";
import type { ResumeDocument } from "@/lib/resume/document";
export default function PdfWorkspace({
  document: doc,
  title,
  example,
}: {
  document: ResumeDocument;
  title: string;
  example: boolean;
}) {
  const ask = useConfirm();
  const [blob, setBlob] = useState<Blob | null>(null);
  const [renderedDoc, setRenderedDoc] = useState<ResumeDocument | null>(null);
  const [error, setError] = useState("");
  const [previewError, setPreviewError] = useState("");
  const [rendering, setRendering] = useState(false);
  const [zoom, setZoom] = useState(1);
  const host = useRef<HTMLDivElement>(null);
  const generation = useRef(0);
  useEffect(() => {
    let cancelled = false;
    const ticket = ++generation.current;
    const timer = setTimeout(() => {
      setRendering(true);
      Promise.all([import("@react-pdf/renderer"), import("./ResumePdf")])
        .then(async ([{ pdf }, { ResumePdf, registerFonts }]) => {
          registerFonts(window.location.origin);
          const output = await pdf(<ResumePdf document={doc} />).toBlob();
          if (!cancelled && ticket === generation.current) {
            setBlob(output);
            setRenderedDoc(doc);
            setError("");
          }
        })
        .catch(() => {
          if (!cancelled)
            setError(
              "The PDF could not be generated. Check your text and try again.",
            );
        })
        .finally(() => {
          if (!cancelled) setRendering(false);
        });
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [doc]);
  useEffect(() => {
    let disposed = false;
    let task: { destroy: () => void } | undefined;
    const canvases = host.current;
    if (!blob || !canvases) return;
    async function draw() {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc =
          "/resume-assets/pdf.worker.min.mjs";
        const data = await blob!.arrayBuffer();
        const loading = pdfjs.getDocument({ data: new Uint8Array(data) });
        task = loading;
        const pdf = await loading.promise;
        if (disposed) return;
        const fragment = document.createDocumentFragment();
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          if (disposed) return;
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.setAttribute(
            "aria-label",
            `Resume page ${i} of ${pdf.numPages}`,
          );
          canvas.setAttribute("role", "img");
          const context = canvas.getContext("2d")!;
          await page.render({ canvasContext: context, canvas, viewport })
            .promise;
          fragment.append(canvas);
        }
        if (!disposed) {
          canvases!.replaceChildren(fragment);
          setPreviewError("");
        }
      } catch {
        if (!disposed)
          setPreviewError(
            "The preview could not load. You can still try downloading the PDF.",
          );
      }
    }
    void draw();
    return () => {
      disposed = true;
      task?.destroy();
    };
  }, [blob]);
  async function download() {
    if (!blob || rendering || renderedDoc !== doc || error) return;
    if (
      example &&
      !(await ask(
        "This resume contains an example. Download it as an example? Replace all sample facts before using it to apply.",
      ))
    )
      return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/[^a-zA-Z0-9 _-]/g, "").trim() || "Resume"}.pdf`;
    a.click();
    recordMetric("pdf_downloaded");
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <section className="preview-pane" aria-label="Live resume preview">
      <div className="preview-toolbar">
        <span>
          <span className="dot" /> LIVE PREVIEW{" "}
          {rendering && <LoaderCircle size={14} className="spin" />}
        </span>
        <div className="zoom-controls">
          <button
            aria-label="Zoom out"
            onClick={() => setZoom((z) => Math.max(0.65, z - 0.1))}
          >
            <ZoomOut size={16} />
          </button>
          <span>{Math.round(zoom * 100)}%</span>
          <button
            aria-label="Zoom in"
            onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))}
          >
            <ZoomIn size={16} />
          </button>
        </div>
        <button
          className="button primary small"
          onClick={download}
          disabled={!blob || rendering || renderedDoc !== doc || !!error}
        >
          <Download size={15} /> Download PDF
        </button>
      </div>
      {example && (
        <p className="example-notice">
          Illustrative example — replace all sample facts before applying.
        </p>
      )}
      {(error || previewError) && (
        <p className="notice error" role="alert">
          {error || previewError}
        </p>
      )}
      <div className="paper-scroller">
        <div
          className="pdf-pages"
          style={{ width: `${zoom * 100}%` }}
          ref={host}
        />
        {!blob && !error && (
          <p className="loading-preview">Preparing your page…</p>
        )}
        <details className="accessible-preview">
          <summary>Read preview as text</summary>
          <h2>{doc.contact.name || "Your name"}</h2>
          <p>{doc.contact.headline}</p>
          <p>
            {[doc.contact.location, doc.contact.email, doc.contact.phone]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {doc.sections
            .filter((s) => s.visible)
            .map((s) => (
              <section key={s.id}>
                <h3>{s.heading}</h3>
                <p>{s.text}</p>
                {s.items.map((i) => (
                  <article key={i.id}>
                    <h4>{i.title}</h4>
                    <p>
                      {[i.subtitle, i.location, i.start, i.end]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    <ul>
                      {i.bullets.filter(Boolean).map((b, n) => (
                        <li key={n}>{b}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </section>
            ))}
        </details>
      </div>
      <p className="preview-note">
        {doc.presentation.paper === "A4" ? "A4" : "US Letter"} · Selectable text
        · No watermark
      </p>
    </section>
  );
}
