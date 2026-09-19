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

export const metadata: Metadata = {
  title: "All Tech Jobs in India | ReerHub",
  description:
    "Browse all engineering and AI roles from India's top product companies — indexed daily from official career pages.",
};

export default function JobsPage() {
  return (
    <div>
      <SubHero title="All tech jobs">
        Every open engineering and AI role, indexed from official company pages.
      </SubHero>
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <Suspense fallback={<FiltersBarSkeleton />}>
          <JobBrowser heading="All open roles" />
        </Suspense>
      </section>
    </div>
  );
}
