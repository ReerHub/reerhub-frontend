import Link from "@/components/AppLink";
import { notFound } from "next/navigation";
import { cache, Suspense } from "react";
import { JOB_LANDINGS, landingQuery, editorialReady } from "@/lib/seo-landings";
import { pageMetadata } from "@/lib/seo";
import { listJobsWithMeta, DataUnavailableError } from "@/lib/reerhub";
import JobBrowser from "@/components/JobBrowser";
import PageHeader from "@/components/PageHeader";
const readInventory = cache(async (slug: string) => {
  const landing = JOB_LANDINGS[slug];
  if (!landing) return null;
  try {
    return await listJobsWithMeta(landingQuery(landing));
  } catch (error) {
    if (error instanceof DataUnavailableError) return null;
    throw error;
  }
});
export function generateStaticParams() {
  return Object.keys(JOB_LANDINGS).map((jobLanding) => ({ jobLanding }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ jobLanding: string }>;
}) {
  const { jobLanding: slug } = await params;
  const landing = JOB_LANDINGS[slug];
  if (!landing) return { robots: { index: false, follow: false } };
  const data =
    landing.earlyCareer || landing.skill
      ? await readInventory(slug)
      : undefined;
  const launched =
    data === null || editorialReady(landing, data?.editorialInventory);
  return {
    ...pageMetadata(landing.title, landing.description, `/${slug}`),
    ...(!launched ? { robots: { index: false, follow: true } } : {}),
  };
}
export default async function LandingPage({
  params,
}: {
  params: Promise<{ jobLanding: string }>;
}) {
  const { jobLanding: slug } = await params;
  const landing = JOB_LANDINGS[slug];
  if (!landing) notFound();
  const data = await readInventory(slug);
  const total = data?.totalAvailable ?? data?.total;
  const companies = [
    ...new Map(
      (data?.jobs || []).map((job) => [job.companyId.slug, job.companyId]),
    ).values(),
  ];
  return (
    <div>
      <PageHeader
        title={landing.title}
        description={landing.intro}
        back={{ href: "/jobs", label: "All tech jobs" }}
      />
      <section className="page-container py-9">
        <p className="mb-5 text-sm text-slate-600">
          {total === undefined
            ? "Current opening counts are temporarily unavailable."
            : `${total} active ${landing.earlyCareer ? "evidence-qualified " : ""}openings. Details and official Apply links are public.`}
        </p>
        {(landing.earlyCareer || landing.skill) &&
          data &&
          !editorialReady(landing, data?.editorialInventory) && (
            <p className="mb-5 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm leading-7">
              We’re expanding our coverage of these roles. Review the available
              openings below and check each employer’s requirements before
              applying.
            </p>
          )}
        <Suspense fallback={<p>Loading job filters…</p>}>
          <JobBrowser
            heading="Current official openings"
            initialCategory={landing.track}
            initialFilters={{
              ...(landing.skill ? { skills: landing.skill } : {}),
              ...(landing.role ? { techRole: landing.role } : {}),
              ...(landing.earlyCareer
                ? { earlyCareer: landing.earlyCareer }
                : {}),
            }}
            initialData={data || undefined}
          />
        </Suspense>
        <section className="mt-12 max-w-3xl">
          <h2 className="text-2xl font-bold">Prepare your application</h2>
          <ul className="mt-5 space-y-4 text-slate-600">
            {landing.guidance.map((text) => (
              <li key={text} className="leading-8">
                {text}
              </li>
            ))}
          </ul>
          <p className="mt-5 leading-7 text-slate-600">
            Employer requirements are the source of truth. Our{" "}
            <Link href="/matching-methodology" className="underline">
              matching methodology
            </Link>{" "}
            explains verified experience, relevance scores and uncertainty.
          </p>
        </section>
        <nav
          aria-label="Related jobs and employers"
          className="mt-10 flex flex-wrap gap-3"
        >
          <Link href="/bengaluru-jobs" className="btn-secondary">
            Bengaluru
          </Link>
          <Link href="/hyderabad-jobs" className="btn-secondary">
            Hyderabad
          </Link>
          <Link href="/pune-jobs" className="btn-secondary">
            Pune
          </Link>
          {Object.entries(JOB_LANDINGS)
            .filter(([, item]) => item.skill)
            .map(([key, item]) => (
              <Link key={key} href={`/${key}`} className="btn-secondary">
                {item.skill} jobs
              </Link>
            ))}
          <Link href="/remote-jobs" className="btn-secondary">
            Remote in India
          </Link>
          {companies.slice(0, 6).map((company) => (
            <Link
              href={`/companies/${company.slug}`}
              key={company.slug}
              className="btn-secondary"
            >
              {company.name}
            </Link>
          ))}
        </nav>
      </section>
    </div>
  );
}
