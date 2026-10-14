import type { ReactNode } from "react";
import PrivacyPreferencesButton from "@/components/PrivacyPreferencesButton";
import Link from "@/components/AppLink";
import styles from "./PublicPages.module.css";
export default function LegalDocument({
  title,
  updated,
  sections,
  children,
}: {
  title: string;
  updated: string;
  sections: { id: string; label: string }[];
  children: ReactNode;
}) {
  return (
    <article className={styles.page}>
      <header className={styles.hero}>
        <p>REERHUB TECHNOLOGIES</p>
        <h1>{title}</h1>
        <p>Last updated: {updated}</p>
      </header>
      <div className={styles.legalLayout}>
        <nav aria-label="On this page">
          <p>ON THIS PAGE</p>
          {sections.map((section) => (
            <Link href={`#${section.id}`} key={section.id}>
              {section.label}
            </Link>
          ))}
        </nav>
        <div className={styles.legalBody}>
          {children}
          {title === "Privacy policy" && (
            <div className="btn-secondary">
              <PrivacyPreferencesButton />
            </div>
          )}
          <p className={styles.legalHelp}>
            Need a little clarity? <Link href="/contact">Contact support</Link>.
          </p>
        </div>
      </div>
    </article>
  );
}
