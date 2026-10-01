import type { Metadata } from "next";
import { Suspense } from "react";
import JobBrowser from "@/components/JobBrowser";

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

function SubHero({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white border-b border-slate-200/70">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-8">
        <h1 className="font-display text-3xl sm:text-[40px] leading-[1.15] font-bold text-slate-900 tracking-tight mb-3">
          {title}
        </h1>
        <p className="text-slate-500 text-base sm:text-lg max-w-xl leading-relaxed">
          {children}
        </p>
      </div>
    </section>
  );
}

export const revalidate = 86400;

export const metadata: Metadata = {
  alternates: { canonical: "/engineering-jobs" },
  title: "Engineering Jobs in India | ReerHub",
  description:
    "Software engineering roles — SDE, backend, frontend, DevOps, data — from India's top product companies, indexed from official career pages.",
};

export default function EngineeringPage() {
  return (
    <div>
      <SubHero title="Engineering jobs">
        SDE, backend, frontend, mobile, DevOps, and data roles from top product
        companies.
      </SubHero>
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <Suspense fallback={<FiltersBarSkeleton />}>
          <JobBrowser
            initialCategory="software"
            heading="Software engineering roles"
          />
        </Suspense>
      </section>
    </div>
  );
}
