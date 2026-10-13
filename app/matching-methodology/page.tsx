import EditorialPage from "@/components/EditorialPage";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata(
  "How Job Verification and Matching Work",
  "Understand REERHUB’s India eligibility, source dates, experience requirements, relevance scores and Pro recommendation groups.",
  "/matching-methodology",
);
export default function MethodologyPage() {
  return (
    <EditorialPage
      title="Clarity behind every match."
      eyebrow="HOW MATCHING WORKS"
    >
      <p className="mt-6 text-lg leading-8 text-slate-600">
        Our goal is useful discovery with clear evidence. A relevance score
        helps you prioritize reading; it is not a hiring probability or a check
        of every qualification.
      </p>
      <h2 className="mt-9 text-2xl font-bold">Which roles are published?</h2>
      <p className="mt-4 leading-8 text-slate-600">
        Public discovery includes active technical roles with confirmed India
        eligibility, active company identity and an unarchived source.
        Explicitly India-eligible remote and multi-country roles can qualify. An
        unqualified “Remote” label, worldwide availability or an unclear
        location does not prove India eligibility. Employer-stated expired
        deadlines exclude active publication and Apply prompts.
      </p>
      <h2 className="mt-9 text-2xl font-bold">What do the dates mean?</h2>
      <p className="mt-4 leading-8 text-slate-600">
        Posted means a verified original employer publication date. Employer
        update is separate. First seen is when REERHUB first observed a listing.
        Last checked records its observed presence in an official feed, not a
        new posting or a guarantee that an application page remains open.
      </p>
      <p className="mt-4 leading-8 text-slate-600">
        Scheduled feed checks start at 06:00 and 20:00 IST with staggered source
        starts. Availability can change between checks. Failed feeds preserve
        verified jobs; later information corrections appear progressively while
        browsing remains available. Daily emails wait until the latest
        verification pass completes.
      </p>
      <h2 className="mt-9 text-2xl font-bold">How experience is evaluated</h2>
      <p className="mt-4 leading-8 text-slate-600">
        We use explicit employer requirement evidence, keeping mandatory,
        preferred and ambiguous statements separate. We do not infer a minimum
        from a senior title, a company’s age or graduation-year text. A stated
        minimum is mandatory. A range’s upper value is informational unless
        explicitly a maximum. Unknown experience never becomes zero experience
        required.
      </p>
      <h2 className="mt-9 text-2xl font-bold">
        The three recommendation groups
      </h2>
      <dl className="mt-5 space-y-5">
        <div>
          <dt className="font-semibold">Profile matches</dt>
          <dd className="mt-2 leading-7 text-slate-600">
            Your stated experience satisfies the verified mandatory requirement.
            Other qualifications still need your review.
          </dd>
        </div>
        <div>
          <dt className="font-semibold">Stretch roles</dt>
          <dd className="mt-2 leading-7 text-slate-600">
            There is an explicit experience gap. We show it beside the positive
            relevance evidence.
          </dd>
        </div>
        <div>
          <dt className="font-semibold">Needs review</dt>
          <dd className="mt-2 leading-7 text-slate-600">
            Mandatory experience is missing, ambiguous or not verified. Read the
            original requirements.
          </dd>
        </div>
      </dl>
      <h2 className="mt-9 text-2xl font-bold">What makes a strong match?</h2>
      <p className="mt-4 leading-8 text-slate-600">
        Ranking considers canonical skill overlap, tech track, selected roles
        and applicable city/work preferences. Experience adds evidence when
        verified and satisfied. Strong matches need Profile matches membership,
        at least 75% relevance and at least two evidence signals, including a
        skill or selected role. Stretch roles and Needs review never enter daily
        emails or public strong-match examples.
      </p>
      <p className="mt-4 leading-8 text-slate-600">
        Each group ranks the eligible catalog and shows up to fifty results.
        “Not relevant” hides a role from your recommendations and emails. Public
        examples use clearly fictional profiles and real current openings; they
        reveal no member profiles.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/profile" className="btn-primary">
          Complete your profile
        </Link>
        <Link href="/jobs" className="btn-secondary">
          Browse jobs
        </Link>
        <Link href="/contact" className="btn-secondary">
          Report a listing issue
        </Link>
      </div>
    </EditorialPage>
  );
}
