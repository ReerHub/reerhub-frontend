import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { Suspense } from "react";
import ServerJobBrowser from "@/components/ServerJobBrowser";
import PageHeader from "@/components/PageHeader";
import Icon from "@/components/ui/Icon";
export const metadata = pageMetadata(
  "AI & Machine Learning Jobs in India",
  "Explore AI and machine learning jobs in India, from applied ML to LLM engineering. Read official role details and apply directly to the company.",
  "/ai-jobs",
);
export default function Page() {
  return (
    <div>
      <PageHeader
        title="Work at the edge of what’s next."
        description="Explore AI and machine learning roles from official hiring pages, from applied ML to LLM engineering."
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
          <ServerJobBrowser track="ai-ml" heading="AI & ML roles" />
        </Suspense>
      </section>
    </div>
  );
}
