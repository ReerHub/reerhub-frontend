import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import JobBrowser from "@/components/JobBrowser";
import PageHeader from "@/components/PageHeader";
import Icon from "@/components/ui/Icon";
export const metadata: Metadata = {
  title: "Find your next tech role. | ReerHub",
  description:
    "Official openings from companies hiring in India. Search by what you build, where you want to work, and what comes next.",
  alternates: { canonical: "/jobs" },
};
export default function Page() {
  return (
    <div>
      <PageHeader
        title="Find your next tech role."
        description="Official openings from companies hiring in India. Search by what you build, where you want to work, and what comes next."
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
          <JobBrowser heading="All open roles" />
        </Suspense>
      </section>
    </div>
  );
}
