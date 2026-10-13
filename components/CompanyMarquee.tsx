"use client";

import Link from "@/components/AppLink";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import CompanyLogo from "./CompanyLogo";
import type { Company } from "@/lib/reerhub";
import styles from "./CompanyMarquee.module.css";

export default function CompanyMarquee({
  companies,
}: {
  companies: Pick<Company, "_id" | "name" | "slug" | "logoUrl">[];
}) {
  const root = useRef<HTMLElement>(null);
  const [paused, setPaused] = useState(false);
  const [active, setActive] = useState(false);
  const unique = [
    ...new Map(companies.map((company) => [company._id, company])).values(),
  ];
  const moving = unique.length > 3;
  useEffect(() => {
    let visible = false;
    const update = () => setActive(visible && !document.hidden);
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        update();
      },
      { threshold: 0.1 },
    );
    if (root.current) observer.observe(root.current);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, [companies.length]);
  if (!unique.length) return null;
  return (
    <section
      ref={root}
      className={styles.marquee}
      data-paused={paused || !active}
      data-moving={moving}
      aria-labelledby="company-strip-title"
      style={
        { "--duration": `${Math.max(40, unique.length * 5)}s` } as CSSProperties
      }
    >
      <div className={styles.heading}>
        <div>
          <p id="company-strip-title">
            A world of companies. Your next possibility.
          </p>
          <small>
            From our company directory · not partnerships or endorsements
          </small>
        </div>
        {moving && (
          <button
            type="button"
            aria-pressed={paused}
            onClick={() => setPaused((value) => !value)}
          >
            {paused ? "Play company animation" : "Pause company animation"}
          </button>
        )}
      </div>
      <div
        className={styles.viewport}
        tabIndex={moving ? 0 : undefined}
        aria-label="Company directory logos"
      >
        <div className={styles.track}>
          <ul className={styles.group}>
            {unique.map((company) => (
              <li key={company._id}>
                <Link
                  href={`/companies/${company.slug}`}
                  prefetch={false}
                  className={styles.company}
                >
                  <CompanyLogo name={company.name} logoUrl={company.logoUrl} />
                  <span>{company.name}</span>
                  <span className={styles.arrow} aria-hidden="true">
                    ↗
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {moving && (
            <ul
              className={`${styles.group} ${styles.clone}`}
              aria-hidden="true"
            >
              {unique.map((company) => (
                <li key={company._id}>
                  <div className={styles.company}>
                    <CompanyLogo
                      name={company.name}
                      logoUrl={company.logoUrl}
                    />
                    <span>{company.name}</span>
                    <span className={styles.arrow}>↗</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <Link href="/companies" className={styles.directory}>
        Explore all companies <span aria-hidden="true">↗</span>
      </Link>
    </section>
  );
}
