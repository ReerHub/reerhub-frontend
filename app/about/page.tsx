import EditorialPage from "@/components/EditorialPage";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata(
  "About REERHUB",
  "REERHUB helps freshers and experienced engineers discover official tech jobs in India and apply directly to employers.",
  "/about",
);
export default function AboutPage() {
  return (
    <EditorialPage title="A better starting point." eyebrow="THE REERHUB STORY">
      <p className="mt-6 text-lg leading-8 text-slate-600">
        REERHUB means Real Effective Engineering Roles Hub. We help freshers and
        experienced engineers find technical roles with confirmed India
        eligibility, sourced from official company hiring pages.
      </p>
      <h2 className="mt-9 text-2xl font-bold">
        From discovery to a direct application
      </h2>
      <p className="mt-4 leading-8 text-slate-600">
        Browse role details and follow the official Apply link without paying. A
        free account adds complete browsing, saved roles and a profile. Pro adds
        private profile-ranked recommendations and daily shortlists when
        verified strong matches are available.
      </p>
      <h2 className="mt-9 text-2xl font-bold">Employer evidence comes first</h2>
      <p className="mt-4 leading-8 text-slate-600">
        An employer’s original listing remains the source of truth. We show
        observation dates and distinguish verified requirements from
        uncertainty. Directory listings and company logos identify sources; they
        do not imply partnerships or endorsements. We do not guarantee
        interviews, offers or employment.
      </p>
      <h2 className="mt-9 text-2xl font-bold">Business and support</h2>
      <p className="mt-4 leading-8 text-slate-600">
        REERHUB is operated by REERHUB TECHNOLOGIES, a registered sole
        proprietorship. For product or subscription questions, contact{" "}
        <a className="underline" href="mailto:support@reerhub.com">
          support@reerhub.com
        </a>
        .
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/jobs" className="btn-primary">
          Browse jobs
        </Link>
        <Link href="/matching-methodology" className="btn-secondary">
          Read our methodology
        </Link>
        <Link href="/billing" className="btn-secondary">
          Plans and trial terms
        </Link>
      </div>
    </EditorialPage>
  );
}
