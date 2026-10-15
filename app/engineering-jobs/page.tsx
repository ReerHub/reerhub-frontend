import { pageMetadata } from "@/lib/seo";
import Link from "@/components/AppLink";
import { Suspense } from "react";
import ServerJobBrowser from "@/components/ServerJobBrowser";
import PageHeader from "@/components/PageHeader";
import Icon from "@/components/ui/Icon";
export const metadata = pageMetadata(
  "Software Engineering Jobs in India",
  "Software engineering openings from official company sources. Explore roles across backend, frontend, and full-stack engineering.",
  "/engineering-jobs",
);
export default function Page() {
  return (
    <div>
      <PageHeader
        title="Software engineering jobs in India"
        description="Software engineering openings from official company sources. Explore roles across backend, frontend, and full-stack engineering."
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
        <nav
          aria-label="Engineering roles"
          className="mb-7 flex flex-wrap gap-2"
        >
          {[
            ["/backend-jobs", "Backend"],
            ["/frontend-jobs", "Frontend"],
            ["/full-stack-jobs", "Full-stack"],
            ["/data-engineering-jobs", "Data engineering"],
            ["/devops-jobs", "DevOps"],
            ["/qa-jobs", "QA and testing"],
          ].map(([href, label]) => (
            <Link href={href} key={href} className="btn-secondary text-xs">
              {label}
            </Link>
          ))}
        </nav>
        <Suspense fallback={<div className="skeleton h-56 rounded-2xl" />}>
          <ServerJobBrowser
            track="software"
            heading="Software engineering roles"
          />
        </Suspense>
      </section>
    </div>
  );
}
