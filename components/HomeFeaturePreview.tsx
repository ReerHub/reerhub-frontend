import styles from "./HomePage.module.css";

export default function HomeFeaturePreview({
  kind,
}: {
  kind: "discover" | "profile" | "save";
}) {
  return (
    <div
      className={`${styles.featurePreview} ${styles[kind]}`}
      aria-hidden="true"
    >
      {kind === "discover" ? (
        <div className={styles.miniWindow}>
          <div className={styles.miniChrome}>
            <i />
            <i />
            <i />
            <span>Discover your next role</span>
          </div>
          <div className={styles.miniSearch}>
            <span>⌕</span> Role, skill or company <b>↗</b>
          </div>
          <div className={styles.miniFilters}>
            <span>Engineering</span>
            <span>Data & AI</span>
            <span>India</span>
          </div>
          <div className={styles.miniResult}>
            <span>⌘</span>
            <div>
              <b>Explore official openings</b>
              <small>Company source · direct application</small>
            </div>
            <span>↗</span>
          </div>
        </div>
      ) : kind === "profile" ? (
        <>
          <div className={styles.miniOrbit} />
          <span className={styles.skillChip}>React</span>
          <span className={styles.skillChip}>Node.js</span>
          <span className={styles.skillChip}>Your experience</span>
          <div className={styles.miniProfile}>
            <span>✳</span>
            <b>Uniquely you</b>
            <small>Skills. Experience. Direction.</small>
          </div>
          <div className={styles.preferenceChip}>
            <span>✓</span> Your preferences, connected
          </div>
        </>
      ) : (
        <>
          <div className={styles.savedSheet} />
          <div className={styles.savedSheet} />
          <div className={styles.miniShortlist}>
            <div>
              <span>YOUR SHORTLIST</span>
              <b>♡</b>
            </div>
            <strong>Keep the possibilities.</strong>
            <div className={styles.savedRow}>
              <span>✦</span>
              <div>
                <b>A role worth a closer look</b>
                <small>Saved for your next step</small>
              </div>
              <span>✓</span>
            </div>
            <div className={styles.savedRow}>
              <span>↗</span>
              <div>
                <b>Room for something new</b>
                <small>Come back when you’re ready</small>
              </div>
              <span>✓</span>
            </div>
          </div>
        </>
      )}
      <small className={styles.previewNote}>Illustrative product preview</small>
    </div>
  );
}
