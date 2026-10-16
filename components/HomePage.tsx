import Link from "@/components/AppLink";
import { HomeAccountAction, HomeGuestNote } from "./HomeAccountAction";
import HomeJobPreview from "./HomeJobPreview";
import CompanyLogo from "@/components/CompanyLogo";
import HomeHeroScene from "./HomeHeroScene";
import HomeFeaturePreview from "./HomeFeaturePreview";
import CompanyMarquee from "./CompanyMarquee";
import {
  topHiringCompanies,
  homepageCompanies,
  knownCompanyOpenings,
} from "@/lib/home-companies";
import styles from "./HomePage.module.css";
import CatalogNotice, { catalogInitializing } from "./CatalogNotice";
import { type Company, type HomeSnapshot } from "@/lib/reerhub";
import { PLANS, billingPlanHref } from "@/lib/billing-plans";
export default function HomePage({
  data,
  logoCompanies,
  directory,
}: {
  data: HomeSnapshot | null;
  directory: Company[] | null;
  logoCompanies: Pick<Company, "_id" | "name" | "slug" | "logoUrl">[];
}) {
  const jobs = (data?.jobs || []).slice(0, 3),
    companies = data?.companies || [];
  const featured = topHiringCompanies(companies).slice(0, 8);
  const companyPreview = homepageCompanies(directory ?? companies);
  const countLabel = (value: number | undefined) =>
    typeof value === "number" && Number.isFinite(value) && value >= 0
      ? value.toLocaleString("en-IN")
      : "—";
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
              data-public-search="true"
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
            <Link href="/how-it-works" className="btn-secondary mt-4">
              See how it works <span aria-hidden="true">↗</span>
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
        className={`${styles.contentSection} page-container`}
        aria-labelledby="current-openings"
      >
        <CatalogNotice data={data} />
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>THE OPPORTUNITY BOARD</p>
            <h2 id="current-openings">Good work is out there.</h2>
            <p className={styles.sectionDescription}>
              {data
                ? `${data.totalJobs.toLocaleString("en-IN")} active technical ${data.totalJobs === 1 ? "role" : "roles"}. Your next step could be one of them.`
                : "Live opening counts are temporarily unavailable."}
            </p>
          </div>
          <Link href="/jobs" className="btn-primary">
            View all jobs <span aria-hidden="true">↗</span>
          </Link>
        </div>
        {jobs.length > 0 && (
          <p className={styles.previewLabel}>
            A few current openings <span>From official employer sources</span>
          </p>
        )}
        <div className={styles.openingGrid}>
          {jobs.length ? (
            jobs.map((job) => <HomeJobPreview key={job._id} job={job} />)
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
        <div className={styles.exploreRow}>
          <nav aria-label="Explore opportunities">
            <span>Explore opportunities</span>
            {[
              ["/engineering-jobs", "Engineering"],
              ["/ai-jobs", "AI & machine learning"],
              ["/data-engineering-jobs", "Data engineering"],
              ["/fresher-jobs", "Freshers"],
              ["/internship-jobs", "Internships"],
            ].map(([href, label]) => (
              <Link key={href} href={href}>
                {label} <span aria-hidden="true">↗</span>
              </Link>
            ))}
          </nav>
          <HomeGuestNote>
            <p>
              Browse freely.{" "}
              <Link href="/login?next=/jobs">
                Sign in to save your shortlist.
              </Link>
            </p>
          </HomeGuestNote>
        </div>
      </section>
      <section
        id="community-feedback"
        className={`${styles.feedbackSection} page-container`}
        aria-label="Community feedback"
      >
        <dl className={styles.catalogStats} aria-label="ReerHub at a glance">
          {[
            [countLabel(data?.totalCompanies), "Companies in our catalog"],
            [countLabel(data?.totalJobs), "Active technical roles"],
            ["Free", "Apply at the official source"],
            ["India-first", "Built for your next tech role"],
          ].map(([value, label]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        {!data && (
          <p className={styles.feedbackNote}>
            Live catalog counts are temporarily unavailable.
          </p>
        )}
        <div className={styles.feedbackGrid}>
          <figure className={styles.feedbackCard}>
            <figcaption>
              <span className={styles.feedbackAvatar} aria-hidden="true">
                MP
              </span>
              <span>
                <strong>Meraj Pathan</strong>
                <small>Feedback shared directly</small>
              </span>
            </figcaption>
            <blockquote>
              “This is the best website I’ve found. A website like this is
              really needed nowadays.”
            </blockquote>
            <p className={styles.feedbackCardNote}>
              Encouragement that keeps us building.
            </p>
          </figure>
          <figure
            className={`${styles.feedbackCard} ${styles.feedbackCardLavender}`}
          >
            <figcaption>
              <span className={styles.feedbackAvatar} aria-hidden="true">
                FS
              </span>
              <span>
                <strong>Faraz Shaikh</strong>
                <small>Feedback shared directly</small>
              </span>
            </figcaption>
            <blockquote>
              “This website really helped me find relevant job openings and
              avoid jobs that weren’t a fit.”
            </blockquote>
            <p className={styles.feedbackCardNote}>
              More relevance. A little less searching.
            </p>
          </figure>
        </div>
      </section>
      <section
        className={styles.companySection}
        aria-labelledby="home-companies-title"
      >
        <div className="page-container">
          <div className={styles.sectionHeading}>
            <div>
              <h2 id="home-companies-title">
                Real companies. Real possibilities.
              </h2>
              <p className={styles.sectionDescription}>
                Explore the companies behind the openings. Find a team you’d
                like to get to know.
              </p>
            </div>
            <Link href="/companies" className="btn-secondary">
              View all companies <span aria-hidden="true">↗</span>
            </Link>
          </div>
          {directory === null && (
            <p className="mb-5 text-sm text-slate-600" role="status">
              The full company directory is temporarily unavailable.
              {companyPreview.length
                ? " Showing companies from the available openings snapshot."
                : " Please try the directory again shortly."}
            </p>
          )}
          <div className={styles.companyGrid}>
            {companyPreview.map((company) => {
              const count = knownCompanyOpenings(company);
              return (
                <Link
                  key={company._id}
                  href={`/companies/${company.slug}`}
                  prefetch={false}
                  className={styles.companyTile}
                >
                  <span className={styles.companyArrow} aria-hidden="true">
                    ↗
                  </span>
                  <CompanyLogo name={company.name} logoUrl={company.logoUrl} />
                  <span className={styles.companyName}>{company.name}</span>
                  <span className={styles.companyCount}>
                    {count === null
                      ? "Explore company"
                      : count === 0
                        ? "No current openings"
                        : `${count} ${count === 1 ? "opening" : "openings"}`}
                  </span>
                </Link>
              );
            })}
          </div>
          {directory !== null && companyPreview.length === 0 && (
            <p className="surface-panel p-7">
              No companies are available in the directory right now. Please
              check back soon.
            </p>
          )}
          <p className={styles.companyDisclaimer}>
            Company listings identify employer sources. They don’t imply
            partnerships or endorsements.
          </p>
          <div id="how-pro-works" className={styles.demoLink}>
            <p>A little clarity for your next move.</p>
            <Link href="/how-it-works">
              See how ReerHub works <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
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
            <HomeFeaturePreview kind="discover" />
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
            <HomeFeaturePreview kind="profile" />
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
            <HomeFeaturePreview kind="save" />
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
            <Link
              key={plan.id}
              href={billingPlanHref(plan.id)}
              className={`surface-panel p-6 ${styles.planLink}`}
              aria-label={`Continue with ${plan.name} Pro, ${plan.price} ${plan.per}`}
            >
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
              <span className={styles.planAction}>
                Continue with {plan.name.toLowerCase()}
                <span aria-hidden="true">↗</span>
              </span>
            </Link>
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
      <div className="page-container pb-14">
        <Link href="/faq" className="btn-secondary">
          Questions before your next step? Read our FAQs ↗
        </Link>
      </div>
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
