"use client";

import { useEffect, useRef, useState } from "react";
import CompanyLogo from "./CompanyLogo";
import type { Company } from "@/lib/reerhub";
import styles from "./HomePage.module.css";

export default function HomeHeroScene({ companies }: { companies: Company[] }) {
  const root = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [active, setActive] = useState(false);
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
  }, []);
  return (
    <div
      ref={root}
      className={styles.scene}
      data-paused={paused || !active}
      aria-label="Illustration: company openings connect with your profile to form a Pro shortlist"
    >
      <div className={styles.sceneArt} aria-hidden="true">
        <div className={styles.orbit} />
        <div className={styles.orbitInner} />
        <div className={styles.sceneCaption}>
          <span /> POSSIBILITY, MEET DIRECTION
        </div>
        <div className={styles.sourceStack}>
          <small>FROM OFFICIAL SOURCES</small>
          {companies.length
            ? companies.slice(0, 3).map((company) => (
                <div key={company._id} className={styles.sourceCard}>
                  <CompanyLogo name={company.name} logoUrl={company.logoUrl} />
                  <div>
                    <strong>{company.name}</strong>
                    <span>
                      {company.activeJobs} current{" "}
                      {company.activeJobs === 1 ? "opening" : "openings"}
                    </span>
                  </div>
                  <b>↗</b>
                </div>
              ))
            : [
                "Company career pages",
                "Official tech openings",
                "India opportunities",
              ].map((name, i) => (
                <div key={name} className={styles.sourceCard}>
                  <b>{["⌘", "↗", "✳"][i]}</b>
                  <div>
                    <strong>{name}</strong>
                    <span>Discover directly from sources</span>
                  </div>
                </div>
              ))}
        </div>
        <svg className={styles.scenePaths} viewBox="0 0 1000 440" fill="none">
          <path
            d="M250 145C380 145 365 235 490 235M250 235H490M250 325C380 325 365 235 490 235M560 235C650 235 670 195 750 195"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="5 7"
          />
          <circle
            className={styles.traveler}
            cx="390"
            cy="235"
            r="5"
            fill="#7352ef"
          />
          <circle
            className={styles.travelerTwo}
            cx="650"
            cy="220"
            r="5"
            fill="#f48066"
          />
        </svg>
        <div className={styles.profileCore}>
          <span>✳</span>
          <strong>Your unique fit</strong>
          <small>Skills · experience · preferences</small>
          <div>
            <b>React</b>
            <b>Engineering</b>
            <b>India</b>
          </div>
        </div>
        <div className={styles.resultCard}>
          <div className={styles.resultTop}>
            <span>✦ YOUR NEXT CHAPTER</span>
            <b>↗</b>
          </div>
          <small>ILLUSTRATIVE PRO SHORTLIST</small>
          <h3>
            Work that fits
            <br />
            your direction.
          </h3>
          <div className={styles.fitRow}>
            <span>Skills aligned</span>
            <b>✓</b>
          </div>
          <div className={styles.fitRow}>
            <span>Experience reviewed</span>
            <b>✓</b>
          </div>
          <div className={styles.fitRow}>
            <span>Your preferences</span>
            <b>✓</b>
          </div>
          <p>Explore the evidence. Make your move.</p>
        </div>
        <div className={styles.floatingTag}>↗ A fresh start</div>
        <div className={styles.floatingTagTwo}>♡ Room to grow</div>
      </div>
      <div className={styles.sceneControls}>
        <span>
          A possibility, illustrated. Your actual matches use employer evidence.
        </span>
        <button
          type="button"
          aria-pressed={paused}
          onClick={() => setPaused((value) => !value)}
        >
          {paused ? "Play animation" : "Pause animation"}
        </button>
      </div>
    </div>
  );
}
