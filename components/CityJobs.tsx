import { Suspense } from "react";
import Link from "next/link";
import ServerJobBrowser from "@/components/ServerJobBrowser";
import JobCard from "@/components/JobCard";
import { listJobsWithMeta } from "@/lib/reerhub";
import PageHeader from "@/components/PageHeader";
import DiscoveryPrompt from "@/components/DiscoveryPrompt";

// Show every available city-specific role. Only empty markets get a clearly
// labelled expanding-coverage panel with alternative suggestions.

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
      <PageHeader
        title={title}
        description={blurb}
        back={{ href: "/jobs", label: "All tech jobs" }}
      />
      <section className="page-container py-10">
        {total > 0 ? (
          <Suspense fallback={<FiltersBarSkeleton />}>
            <ServerJobBrowser
              heading={heading}
              city={city}
              remoteOnly={remoteOnly}
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
          Few open roles here right now. Meanwhile, these other openings from
          top product companies are hiring across India.
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
            Explore other openings in India
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommended.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        </>
      )}
      <Suspense>
        <DiscoveryPrompt count={recommended.length} />
      </Suspense>
    </div>
  );
}
