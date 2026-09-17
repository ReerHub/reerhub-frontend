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
    <section className="relative overflow-hidden bg-[#0B1730]">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(600px 300px at 50% -50px, rgba(59,130,246,0.25), transparent), radial-gradient(500px 260px at 85% 20%, rgba(99,102,241,0.18), transparent)",
        }}
        aria-hidden
      />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-8 text-center">
        <h1 className="text-3xl sm:text-[40px] leading-[1.15] font-bold text-white tracking-tight mb-3">
          {title}
        </h1>
        <p className="text-white/70 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
          {children}
        </p>
      </div>
    </section>
  );
}

export const metadata: Metadata = {
  title: "AI & ML Jobs in India | ReerHub",
  description:
    "AI, machine learning, and data science roles from India's top product companies, indexed from official career pages.",
};

export default function AIPage() {
  return (
    <div>
      <SubHero title="AI & ML jobs">
        Machine learning, LLM, and data science roles from top product
        companies.
      </SubHero>
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <Suspense fallback={<FiltersBarSkeleton />}>
          <JobBrowser initialCategory="ai-ml" heading="AI & ML roles" />
        </Suspense>
      </section>
    </div>
  );
}
