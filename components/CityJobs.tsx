import { Suspense } from "react";
import Link from "next/link";
import JobBrowser from "@/components/JobBrowser";
import JobCard from "@/components/JobCard";
import { listJobsWithMeta } from "@/lib/reerhub";

// Thin markets (< 5 roles) get an "expanding soon" panel plus recommended
// roles instead of a near-empty list.
const THIN_THRESHOLD = 5;

function FiltersBarSkeleton() {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-card">
      <div className="skeleton h-10 w-full rounded-xl" />
      <div className="flex gap-2 mt-3">
        <div className="skeleton h-8 w-24 rounded-lg" />
        <div className="skeleton h-8 w-24 rounded-lg" />
        <div className="skeleton h-8 w-24 rounded-lg" />
      </div>
    </div>
  );
}

export default async function CityJobs({
  title,
  blurb,
  city,
  remoteOnly = false,
  heading,
}: {
  title: string;
  blurb: string;
  city?: string;
  remoteOnly?: boolean;
  heading: string;
}) {
  const filter: Record<string, string> = remoteOnly
    ? { remoteType: "remote" }
    : { city: city || "" };
  let total = 0;
  try {
    total = (await listJobsWithMeta({ ...filter, limit: 1 })).total;
  } catch {
    total = 0;
  }

  return (
    <div>
      <section className="bg-white border-b border-slate-200/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-8">
          <h1 className="font-display text-3xl sm:text-[40px] leading-[1.15] font-bold text-slate-900 tracking-tight mb-3">
            {title}
          </h1>
          <p className="text-slate-500 text-base sm:text-lg max-w-xl leading-relaxed">
            {blurb}
          </p>
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {total >= THIN_THRESHOLD ? (
          <Suspense fallback={<FiltersBarSkeleton />}>
            <JobBrowser
              heading={heading}
              showFilters
              initialFilters={
                remoteOnly ? { remoteType: "remote" } : { city: city || "" }
              }
            />
          </Suspense>
        ) : (
          <ExpandingSoon location={city || "Remote"} />
        )}
      </section>
    </div>
  );
}

async function ExpandingSoon({ location }: { location: string }) {
  let recommended: Awaited<ReturnType<typeof listJobsWithMeta>>["jobs"] = [];
  try {
    recommended = (await listJobsWithMeta({ limit: 6 })).jobs;
  } catch {
    recommended = [];
  }

  return (
    <div>
      <div className="bg-white border border-slate-200/80 rounded-2xl p-8 sm:p-10 shadow-card text-center mb-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-electric mb-2">
          Expanding soon
        </p>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-3">
          We&apos;re growing coverage in {location}
        </h2>
        <p className="text-slate-500 max-w-lg mx-auto leading-relaxed mb-6">
          Few open roles here right now. Meanwhile, these recommended openings
          from top product companies are hiring across India.
        </p>
        <Link
          href="/jobs"
          className="inline-flex items-center justify-center px-6 py-2.5 bg-electric text-white rounded-xl font-semibold text-sm hover:bg-electric-dark transition-all"
        >
          Browse all roles
        </Link>
      </div>
      {recommended.length > 0 && (
        <>
          <h2 className="font-bold text-slate-900 text-xl mb-4">
            Recommended roles
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommended.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
