import Link from "next/link";
import { HomeAccountAction, HomeGuestNote } from "./HomeAccountAction";
import JobCard from "@/components/JobCard";
import CompanyLogo from "@/components/CompanyLogo";
import LiveMatchingExample from "./LiveMatchingExample";
import MatchJourney from "@/components/MatchJourney";
import HomeHeroScene from "./HomeHeroScene";
import CompanyMarquee from "./CompanyMarquee";
import { topHiringCompanies } from "@/lib/home-companies";
import styles from "./HomePage.module.css";
import CatalogNotice, { catalogInitializing } from "./CatalogNotice";
import { type Company, type HomeSnapshot } from "@/lib/reerhub";
import { JOB_LANDINGS } from "@/lib/seo-landings";
import { PLANS } from "@/lib/billing-plans";
const ANSWERS = [
  [
    "Can I browse and apply for free?",
    "Yes. Job details and official Apply links are public. A free account unlocks complete browsing, saved jobs and your profile.",
  ],
  [
    "Are there jobs for freshers?",
    "Our fresher page includes only explicit employer evidence allowing freshers or no required experience. Internships have their own page. A missing experience requirement is never treated as zero.",
  ],
  [
    "What does a match score mean?",
    "It measures relevance to a profile, using skill, role and preference evidence. Profile matches meet verified experience requirements; Stretch roles have a gap; Needs review means requirements are uncertain. Scores do not predict hiring.",
  ],
  [
    "How often are sources checked?",
    "Scheduled source checks run twice daily, starting at 06:00 and 20:00 IST with staggered starts. Failures preserve previously verified jobs. Each listing shows its last observed feed check; this is not a guarantee the employer still accepts applications.",
  ],
  [
    "When does a Pro trial become paid?",
    "The trial lasts seven days. Recurring charges start afterward; Razorpay may show a separate authorization amount. Cancel renewal before the trial ends to prevent the first recurring charge. Subscription payments are non-refundable.",
  ],
];
export default function HomePage({
  data,
  logoCompanies,
}: {
  data: HomeSnapshot | null;
  logoCompanies: Pick<Company, "_id" | "name" | "slug" | "logoUrl">[];
}) {
  const jobs = data?.jobs || [],
    companies = data?.companies || [];
  const featured = topHiringCompanies(companies).slice(0, 8);
  return (
    <div className={`${styles.home} homepage-redesign`}>
      <section className={`${styles.hero} border-b border-slate-200`}>
        <div className={`${styles.heroGrid} page-container py-12 sm:py-16`}>
          <div className={styles.heroCopy}>
            <p className={styles.heroEyebrow}>
              <span className={styles.statusDot} /> Your next chapter starts
              here
            </p>
            <h1 className="font-display font-bold text-ink">
              Big ambitions.{" "}
              <span className={styles.highlight}>Better possibilities.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Find your next tech role in India. Explore real company openings,
              discover where your skills belong, and take a step toward work
              that moves you.
            </p>
            <form
              action="/jobs"
              method="get"
              role="search"
              aria-label="Search tech jobs in India"
              className={styles.searchBar}
            >
              <label className="text-sm font-medium text-slate-700">
                Keyword or role
                <input
                  name="q"
                  type="search"
                  placeholder="Backend, React, data engineering…"
                  className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 px-3"
                />
              </label>
              <label className="text-sm font-medium text-slate-700">
                City
                <select
                  name="city"
                  aria-label="City"
                  className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 px-3"
                >
                  <option value="">All India</option>
                  {[
                    "Bengaluru",
                    "Hyderabad",
                    "Pune",
                    "Chennai",
                    "Delhi",
                    "Mumbai",
                  ].map((city) => (
                    <option key={city}>{city}</option>
                  ))}
                </select>
              </label>
              <button type="submit" className="btn-primary self-end">
                Browse jobs
              </button>
            </form>
            <Link href="#how-pro-works" className="btn-secondary mt-4">
              See how Pro works <span aria-hidden="true">↗</span>
            </Link>
            <p className="mt-4 text-sm text-slate-600">
              Free to explore. Direct to the source. Yours to discover.
            </p>
          </div>
          <HomeHeroScene companies={featured} />
        </div>
        <div className={styles.heroRibbon} aria-hidden="true">
          <span>ENGINEERING</span>
          <b>✳</b>
          <span>DATA & AI</span>
          <b>✳</b>
          <span>YOUR NEXT CHAPTER</span>
          <b>✳</b>
          <span>BUILT FOR POSSIBILITY</span>
        </div>
      </section>
      <CompanyMarquee companies={logoCompanies} />
      <section
        className={`${styles.contentSection} page-container py-10 sm:py-14`}
        aria-labelledby="current-openings"
      >
        <CatalogNotice data={data} />
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className={styles.eyebrow}>THE OPPORTUNITY BOARD</p>
            <h2
              id="current-openings"
              className="text-3xl font-bold tracking-tight text-ink"
            >
              Good work is out there.
            </h2>
            <p className="mt-3 text-slate-600">
              {data
                ? `${data.totalJobs.toLocaleString("en-IN")} active technical ${data.totalJobs === 1 ? "role" : "roles"} in the verified catalog.`
                : "Live opening counts are temporarily unavailable."}
            </p>
          </div>
          <Link href="/jobs" className="btn-secondary">
            View all jobs
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {jobs.length ? (
            jobs.map((job) => <JobCard key={job._id} job={job} />)
          ) : !data ? (
            <p className="surface-panel col-span-full p-7">
              Live openings are temporarily unavailable.{" "}
              <Link href="/jobs" className="underline">
                Try discovery again
              </Link>
              .
            </p>
          ) : catalogInitializing(data) ? null : (
            <p className="surface-panel col-span-full p-7">
              No active verified roles right now. You can still{" "}
              <Link href="/companies" className="underline">
                explore company sources
              </Link>
              .
            </p>
          )}
        </div>
        <nav
          aria-label="Choose a career path"
          className="mt-7 flex flex-wrap gap-3"
        >
          <Link href="/fresher-jobs" className="btn-secondary">
            Fresher opportunities
          </Link>
          <Link href="/internship-jobs" className="btn-secondary">
            Internships
          </Link>
          <Link href="/jobs" className="btn-secondary">
            Browse all experience levels
          </Link>
        </nav>
        <HomeGuestNote>
          <p className="mt-5 text-sm leading-7 text-slate-600">
            Preview openings freely.{" "}
            <Link href="/login?next=/jobs" className="underline">
              Create a free account
            </Link>{" "}
            for complete browsing and saved roles.
          </p>
        </HomeGuestNote>
        <nav
          aria-label="Browse by engineering role"
          className="mt-7 flex flex-wrap gap-3"
        >
          {Object.entries(JOB_LANDINGS)
            .filter(([, page]) => !page.earlyCareer)
            .map(([slug, page]) => (
              <Link href={`/${slug}`} key={slug} className="btn-secondary">
                {page.title.replace(" jobs in India", "")}
              </Link>
            ))}
        </nav>
      </section>
      <section className={`${styles.companySection} py-10 sm:py-14`}>
        <div className="page-container">
          <h2 className="text-3xl font-bold text-ink">
            Real companies. Real possibilities.
          </h2>
          <p className="mt-4 max-w-3xl leading-8 text-slate-600">
            Confirmed India locations, source links and visible feed-check dates
            help you review a role. Companies below have current openings; these
            are directory listings, not partners or endorsements.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
            {featured.map((company) => (
              <Link
                key={company._id}
                href={`/companies/${company.slug}`}
                prefetch={false}
                className={`${styles.companyTile} surface-panel flex min-w-0 flex-col items-center gap-3 p-4 text-center`}
              >
                <CompanyLogo name={company.name} logoUrl={company.logoUrl} />
                <span className="text-sm font-semibold">{company.name}</span>
                <span className="text-xs text-slate-600">
                  {company.activeJobs}{" "}
                  {company.activeJobs === 1 ? "opening" : "openings"}
                </span>
              </Link>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link href="/companies" className="underline text-primary">
              Explore employers
            </Link>
            <Link href="/about" className="underline text-primary">
              About REERHUB
            </Link>
            <Link
              href="/matching-methodology"
              className="underline text-primary"
            >
              How verification and matching work
            </Link>
          </div>
        </div>
      </section>
      <section
        id="how-pro-works"
        className={`${styles.matchingSection} page-container scroll-mt-24 py-10 sm:py-14`}
      >
        <p className={styles.eyebrow}>A LITTLE CLARITY GOES A LONG WAY</p>
        <h2 className="text-3xl font-bold text-ink">
          Less searching. More direction.
        </h2>
        <p className="mt-4 max-w-3xl leading-8 text-slate-600">
          This fictional profile uses real openings and the same scoring engine
          as Pro. Public examples include only verified Profile matches at 75%
          or above. A score measures relevance; it does not verify every
          qualification.
        </p>
        <div className="mt-7 grid gap-6 lg:grid-cols-2">
          <LiveMatchingExample examples={data?.matchingExamples} />
          <div className="surface-panel p-6">
            <h3 className="text-xl font-semibold">
              Build your profile before evaluating Pro
            </h3>
            <ol className="mt-4 space-y-4 leading-7 text-slate-600">
              <li>
                1. Choose your track, skills, experience and location
                preferences.
              </li>
              <li>
                2. Pro separates verified Profile matches, Stretch roles and
                Needs review.
              </li>
              <li>
                3. Read the employer’s description and apply directly. Daily
                emails include up to five verified strong matches when
                available.
              </li>
            </ol>
            <Link href="/profile" className="btn-primary mt-6">
              Complete your profile
            </Link>
            <Link href="/billing" className="btn-secondary mt-3 ml-0 sm:ml-3">
              See Pro plans
            </Link>
          </div>
        </div>
        <details open className="mt-7 surface-panel p-5">
          <summary className="min-h-11 cursor-pointer text-lg font-semibold">
            How it works: illustrative matching journey
          </summary>
          <p className="my-4 text-sm leading-7 text-slate-600">
            The animation below explains the workflow. Its scores are
            illustrative; the live example above uses actual current evidence.
          </p>
          <MatchJourney companies={companies} />
        </details>
      </section>
      <section className={`${styles.benefits} page-container`}>
        <div className={styles.benefitHeading}>
          <p className={styles.eyebrow}>MADE FOR YOUR MOMENT</p>
          <h2>
            A career is personal.
            <br />
            Your search should be, too.
          </h2>
        </div>
        <div className={styles.benefitGrid}>
          <article className={styles.benefit}>
            <span aria-hidden="true">↗</span>
            <small>EXPLORE WITH CONFIDENCE</small>
            <h3>
              Straight to
              <br />
              the opportunity.
            </h3>
            <p>
              Real openings from official company career sources. Read the
              details and apply directly.
            </p>
            <Link href="/jobs">Find your next role ↗</Link>
          </article>
          <article className={styles.benefit}>
            <span aria-hidden="true">✳</span>
            <small>MAKE IT YOURS</small>
            <h3>
              Your skills.
              <br />
              Your direction.
            </h3>
            <p>
              Build a profile around your skills, experience and preferences.
              Give your next move a clearer starting point.
            </p>
            <Link href="/profile">Build your profile ↗</Link>
          </article>
          <article className={styles.benefit}>
            <span aria-hidden="true">♡</span>
            <small>KEEP THE POSSIBILITIES</small>
            <h3>
              Found something
              <br />
              that feels right?
            </h3>
            <p>
              A free account lets you save roles worth coming back to. Take your
              next step at your own pace.
            </p>
            <HomeAccountAction
              className="btn-secondary"
              guest="Start your shortlist ↗"
            />
          </article>
        </div>
      </section>
      <section className={`${styles.freePro} py-10 sm:py-14`}>
        <div className="page-container">
          <h2 className="text-3xl font-bold text-ink">
            Free discovery. Optional Pro direction.
          </h2>
          <div className="mt-7 grid gap-6 md:grid-cols-2">
            <div className="surface-panel p-6">
              <h3 className="text-xl font-semibold">Free</h3>
              <p className="mt-3 leading-8 text-slate-600">
                Public details and official Apply links. A free account adds
                complete browsing, filters, saved roles and your profile.
              </p>
              <HomeAccountAction
                className="btn-secondary mt-5"
                guest="Create a free account"
              />
            </div>
            <div className="surface-panel p-6">
              <h3 className="text-xl font-semibold">Pro</h3>
              <p className="mt-3 leading-8 text-slate-600">
                Private ranked recommendations, match reasons, experience gaps,
                feedback and a daily email with up to five verified strong
                Profile matches.
              </p>
              <HomeAccountAction
                pro
                className="btn-primary mt-5"
                guest="Explore Pro plans"
              />
            </div>
          </div>
        </div>
      </section>
      <section
        id="home-pricing"
        className={`${styles.pricing} page-container py-10 sm:py-14`}
      >
        <h2 className="text-3xl font-bold text-ink">
          Choose a Pro billing cycle
        </h2>
        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {PLANS.map((plan) => (
            <div key={plan.id} className="surface-panel p-6">
              <h3 className="font-semibold">{plan.name}</h3>
              <p className="mt-3 text-3xl font-bold">
                {plan.price}
                <span className="ml-2 text-sm font-normal text-slate-600">
                  {plan.per}
                </span>
              </p>
              <p className="mt-3 text-sm text-slate-600">
                Seven-day trial. Same Pro features.
              </p>
            </div>
          ))}
        </div>
        <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-600">
          Recurring billing starts after your trial. Review any payment-method
          authorization amount at checkout. Subscription payments are
          non-refundable; cancel renewal to prevent future charges while keeping
          remaining access.
        </p>
        <Link href="/billing" className="btn-primary mt-5">
          Pricing and trial terms
        </Link>
      </section>
      <section
        className={`${styles.faq} page-container pb-14`}
        aria-labelledby="home-answers"
      >
        <h2 id="home-answers" className="text-3xl font-bold text-ink">
          Answers before you start
        </h2>
        <div className="mt-6 space-y-3">
          {ANSWERS.map(([question, answer]) => (
            <details key={question} className="surface-panel p-5">
              <summary className="min-h-11 cursor-pointer font-semibold">
                {question}
              </summary>
              <p className="mt-3 max-w-4xl leading-8 text-slate-600">
                {answer}
              </p>
            </details>
          ))}
        </div>
        <Link href="/contact" className="btn-secondary mt-6">
          Contact support
        </Link>
      </section>
      <section className={styles.closing}>
        <div className="page-container">
          <p className={styles.eyebrow}>THERE’S MORE AHEAD OF YOU</p>
          <h2>
            Your next chapter.
            <br />
            <span>Make it a good one.</span>
          </h2>
          <p>You bring the ambition. We’ll help you find the possibilities.</p>
          <Link href="/jobs" className="btn-primary">
            Explore tech jobs <span aria-hidden="true">↗</span>
          </Link>
          <small>India-first discovery. Free to browse and apply.</small>
        </div>
      </section>
    </div>
  );
}
