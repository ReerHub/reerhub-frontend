"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import CompanyLogo from "@/components/CompanyLogo";
import Icon from "@/components/ui/Icon";
import type { Company } from "@/lib/reerhub";
import styles from "./MatchJourney.module.css";

export default function MatchJourney({ companies }: { companies: Company[] }) {
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.1 },
    );
    if (root.current) observer.observe(root.current);
    const visibility = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  return (
    <div
      ref={root}
      className={styles.journey}
      data-paused={paused || !inView || !pageVisible}
    >
      <div className={styles.toolbar}>
        <button
          type="button"
          onClick={() => setPaused((value) => !value)}
          aria-pressed={paused}
          className={styles.pause}
        >
          {paused ? "Play animation" : "Pause animation"}
        </button>
      </div>
      <div className={styles.stage} aria-hidden="true">
        <div className={styles.stepLabels}>
          <span>
            <b>01</b> Official company openings
          </span>
          <span>
            <b>02</b> Your profile signals
          </span>
          <span>
            <b>03</b> A focused Pro shortlist
          </span>
        </div>
        <svg
          className={styles.connections}
          viewBox="0 0 600 180"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            d="M210 40C250 40 255 90 300 90M210 90H300M210 140C250 140 255 90 300 90M300 90H408"
            stroke="#bfdbfe"
            strokeWidth="1.5"
          />
          {[40, 90, 140, 90].map((y, index) => (
            <circle
              key={index}
              cx="0"
              cy="0"
              r="3"
              fill="#2563eb"
              className={styles.signal}
              style={
                {
                  "--signal-path":
                    index === 3
                      ? 'path("M300 90H408")'
                      : y === 90
                        ? 'path("M210 90H300")'
                        : `path("M210 ${y}C250 ${y} 255 90 300 90")`,
                  "--signal-delay": index === 3 ? "4s" : `${index * 0.35}s`,
                } as CSSProperties
              }
            />
          ))}
        </svg>
        <div className={styles.market}>
          {companies.slice(0, 15).map((company) => (
            <div
              key={company._id}
              className={styles.source}
              title={company.name}
            >
              <CompanyLogo name={company.name} logoUrl={company.logoUrl} />
            </div>
          ))}
          {!companies.length &&
            ["Official roles", "Career pages", "Fresh openings"].map(
              (label) => (
                <span key={label} className={styles.sourceLabel}>
                  {label}
                </span>
              ),
            )}
        </div>
        <div className={styles.engine}>
          <Icon name="spark" className="h-6 w-6" />
          <span>Profile fit</span>
          <small>Skills · role · location</small>
        </div>
        <div className={styles.shortlist}>
          <strong>75%+ profile relevance</strong>
          <span>Illustrative ranked matches</span>
          {[
            { role: "Backend Engineer", score: 86 },
            { role: "Platform Engineer", score: 82 },
            { role: "Software Engineer", score: 78 },
          ].map((match, index) => (
            <div
              key={match.role}
              className={styles.rankedRow}
              style={{ "--row-delay": `${index * 0.25}s` } as CSSProperties}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <b>{match.role}</b>
              <strong>{match.score}%</strong>
            </div>
          ))}
        </div>
      </div>
      <p className={styles.caption}>
        Illustration only—not a live scan. Scores describe profile relevance,
        not hiring probability.
      </p>
    </div>
  );
}
