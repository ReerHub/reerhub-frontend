import Image from "next/image";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  MapPin,
  ArrowRight,
} from "lucide-react";
export default function JobsPromotion({ jobsUrl }: { jobsUrl: string }) {
  return (
    <section
      className="jobs-promotion"
      aria-labelledby="jobs-promotion-heading"
    >
      <div className="jobs-promotion-copy">
        <a
          href={`${jobsUrl}/`}
          className="parent-product-brand"
          aria-label="REERHUB job portal"
        >
          <Image src="/reerhub-icon-logo.png" width={34} height={34} alt="" />
          <span>
            <strong>REERHUB</strong>
            <small>TECH JOBS. REAL POSSIBILITIES.</small>
          </span>
        </a>
        <span className="eyebrow">YOUR NEXT CHAPTER DOESN’T END HERE</span>
        <h2 id="jobs-promotion-heading">
          A resume that feels like you.
          <br />A role that could, too.
        </h2>
        <p>
          Take your next step with REERHUB. Discover engineering, AI and data
          openings in India, sourced from official company career pages. Read
          the details. Apply directly to the employer.
        </p>
        <a className="button primary" href={`${jobsUrl}/jobs`}>
          Explore tech jobs <ArrowUpRight size={18} />
        </a>
        <span className="jobs-promotion-note">
          Free to browse and apply. Pro matching is optional.
        </span>
      </div>
      <div className="jobs-promotion-art">
        <span className="eyebrow">FIND YOUR DIRECTION</span>
        <a className="jobs-path" href={`${jobsUrl}/jobs`}>
          <span>
            <BriefcaseBusiness size={20} />
          </span>
          <p>
            Official openings<small>Go straight to the source.</small>
          </p>
          <ArrowRight size={18} />
        </a>
        <a className="jobs-path" href={`${jobsUrl}/how-it-works`}>
          <span>
            <MapPin size={20} />
          </span>
          <p>
            Built for India
            <small>Review location and work-mode requirements.</small>
          </p>
          <ArrowRight size={18} />
        </a>
        <div
          className="jobs-category-links"
          aria-label="Explore job categories"
        >
          <a href={`${jobsUrl}/engineering-jobs`}>
            Engineering <ArrowUpRight size={14} />
          </a>
          <a href={`${jobsUrl}/ai-jobs`}>
            AI &amp; machine learning <ArrowUpRight size={14} />
          </a>
          <a href={`${jobsUrl}/companies`}>
            Explore companies <ArrowUpRight size={14} />
          </a>
        </div>
        <p className="jobs-promotion-separation">
          One REERHUB account. Your resume and matching profile stay separate.
        </p>
      </div>
    </section>
  );
}
