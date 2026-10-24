import Image from "next/image";
import Link from "next/link";
import BrandWordmark from "@/components/BrandWordmark";
import styles from "./ResumeBuilderPromotion.module.css";

const builder = "/resume";

export default function ResumeBuilderPromotion() {
  return (
    <section
      className={styles.section}
      aria-labelledby="resume-builder-heading"
    >
      <div className={styles.surface}>
        <div className={styles.copy}>
          <a className={styles.brand} href={builder}>
            <Image src="/reerhub-icon-logo.png" width={32} height={32} alt="" />
            <span>
              <BrandWordmark />
              <small>RESUME BUILDER</small>
            </span>
          </a>
          <p className={styles.eyebrow}>YOUR STORY. READY FOR WHAT’S NEXT.</p>
          <h2 id="resume-builder-heading">
            Great experience.
            <br />
            Beautifully presented.
          </h2>
          <p className={styles.description}>
            Meet REERHUB Resume Builder. Turn your skills, projects and
            experience into a resume you’re proud to send. Start with a clear
            structure. Make every word yours.
          </p>
          <a href={`${builder}/editor`} className={styles.primary}>
            Build my resume <span aria-hidden="true">↗</span>
          </a>
          <div className={styles.details}>
            <span>Free PDF downloads</span>
            <span>No sign-up needed</span>
            <span>No watermark</span>
          </div>
          <Link href={`${builder}/templates`} className={styles.secondary}>
            Explore the three free templates <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className={styles.art}>
          <div className={styles.paper} aria-label="Illustrative resume layout">
            <span className={styles.sample}>ILLUSTRATIVE EXAMPLE</span>
            <p className={styles.role}>SOFTWARE ENGINEER</p>
            <p className={styles.name}>
              Alex Morgan<span>.</span>
            </p>
            <p className={styles.location}>
              Bengaluru, India · alex@example.com
            </p>
            <div className={styles.rule} />
            <p className={styles.label}>SUMMARY</p>
            <p>
              Engineer building thoughtful, accessible software with React and
              TypeScript.
            </p>
            <p className={styles.label}>EXPERIENCE</p>
            <strong>Software Engineer</strong>
            <p className={styles.location}>Example Company · 2023 – Present</p>
            <p>
              Built accessible interfaces and simplified everyday workflows with
              the design team.
            </p>
            <p className={styles.label}>PROJECTS</p>
            <strong>Campus resource exchange</strong>
            <p>
              A searchable directory connecting students to shared resources.
            </p>
            <p className={styles.label}>SKILLS</p>
            <p>TypeScript · React · Node.js · SQL</p>
          </div>
          <div className={styles.caption}>
            <span aria-hidden="true">✓</span> Your experience. Your words. Your
            next step.
          </div>
        </div>
      </div>
    </section>
  );
}
