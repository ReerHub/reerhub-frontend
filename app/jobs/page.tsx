import { pageMetadata } from "@/lib/seo";
import Link from "@/components/AppLink";
import { Suspense } from "react";
import ServerJobBrowser from "@/components/ServerJobBrowser";
import PageHeader from "@/components/PageHeader";
import Icon from "@/components/ui/Icon";
import { locationScopeFromParams } from "@/lib/location-scope";
export const metadata = pageMetadata(
  "Tech Jobs in India",
  "Engineering and AI jobs with confirmed India eligibility, from official employer sources.",
  "/jobs",
);
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const locationScope = locationScopeFromParams(
    new URLSearchParams(
      Object.entries(params).filter(
        (entry): entry is [string, string] => entry[1] !== undefined,
      ),
    ),
  );
  return (
    <div>
      <PageHeader
        title="Tech jobs in India"
        description="Engineering and AI jobs with confirmed India eligibility, from official employer sources."
      >
        <span className="inline-flex items-center gap-2 text-xs font-semibold text-teal-800">
          <Icon name="shield" className="h-4 w-4" />
          Official sources. Direct applications.
        </span>
      </PageHeader>
      <section className="page-container py-8 sm:py-10">
        <nav aria-label="Job categories" className="mb-7 flex flex-wrap gap-2">
          {[
            ["/jobs", "All roles"],
            ["/engineering-jobs", "Engineering"],
            ["/ai-jobs", "AI / ML"],
            ["/remote-jobs", "Remote"],
          ].map(([href, label]) => (
            <Link href={href} key={href} className="btn-secondary text-xs">
              {label}
            </Link>
          ))}
        </nav>
        <Suspense fallback={<div className="skeleton h-56 rounded-2xl" />}>
          <ServerJobBrowser
            heading="All open roles"
            locationScope={locationScope}
          />
        </Suspense>
      </section>
    </div>
  );
}
