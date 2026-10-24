import Link from "next/link";
import Brand from "@/components/resume/Brand";
import { ArrowRight, Check } from "lucide-react";
import { publicMetadata, safeJsonLd, breadcrumb, SITE } from "@/lib/resume/seo";
export const metadata = publicMetadata(
  "Free single-column resume templates",
  "Choose Classic, Modern or Technical. All templates are free with A4 and US Letter pages, selectable text and watermark-free PDF downloads.",
  "/templates",
);
export default function Templates() {
  return (
    <>
      <header className="marketing-nav">
        <Brand />
        <Link className="button dark small" href="/resume/editor">
          Start building <ArrowRight size={16} />
        </Link>
      </header>
      <main id="main-content" className="templates-main">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLd([
              breadcrumb("Templates", "/templates"),
              {
                "@context": "https://schema.org",
                "@type": "ItemList",
                name: "Free REERHUB resume templates",
                itemListElement: ["Classic", "Modern", "Technical"].map(
                  (name, index) => ({
                    "@type": "ListItem",
                    position: index + 1,
                    name,
                    url: `${SITE}/templates#${name.toLowerCase()}`,
                  }),
                ),
              },
            ]),
          }}
        />
        <nav className="public-breadcrumb" aria-label="Breadcrumb">
          <Link href="/resume">Resume Builder</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Templates</span>
        </nav>
        <span className="eyebrow">A FRAME FOR YOUR STORY</span>
        <h1>
          Good design.
          <br />
          Great possibilities.
        </h1>
        <p>
          Three considered templates. Every one free. Choose a starting
          point—you can change it any time.
        </p>
        <div className="template-grid">
          {(["classic", "modern", "technical"] as const).map((t, index) => (
            <Link
              href={`/resume/editor?template=${t}`}
              id={t}
              key={t}
              className={`template-card ${t}`}
            >
              <div className="template-paper">
                <h2>Alex Morgan</h2>
                <span>SOFTWARE ENGINEER</span>
                {["PROFILE", "EXPERIENCE", "PROJECTS", "EDUCATION"].map((s) => (
                  <div key={s}>
                    <span className="template-section-title">{s}</span>
                    <i />
                    <i />
                    <i className="short" />
                  </div>
                ))}
              </div>
              <div className="template-description">
                <h2>{t[0].toUpperCase() + t.slice(1)}</h2>
                <p>
                  {
                    [
                      "Timeless type. A clear, familiar structure.",
                      "A confident heading. A considered accent.",
                      "Precise hierarchy. Built for technical detail.",
                    ][index]
                  }
                </p>
                <span>
                  <Check size={14} /> Free · PDF export
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
