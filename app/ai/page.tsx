import type { Metadata } from "next";
import { Suspense } from "react";
import JobBrowser from "@/components/JobBrowser";

function FiltersBarSkeleton() {
  return (
    <div className="bg-white dark:bg-[#0B1A33] border border-[#E2E8F0] dark:border-white/10 rounded-2xl p-4 sm:p-5">
      <div className="skeleton h-10 w-full rounded-lg" />
      <div className="flex gap-2 mt-3">
        <div className="skeleton h-8 w-24 rounded-md" />
        <div className="skeleton h-8 w-24 rounded-md" />
        <div className="skeleton h-8 w-24 rounded-md" />
      </div>
    </div>
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
      <section className="relative overflow-hidden bg-[#07152E]">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(600px 300px at 50% -50px, rgba(45,212,191,0.18), transparent), radial-gradient(500px 260px at 85% 20%, rgba(99,102,241,0.22), transparent)",
          }}
          aria-hidden
        />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-8 text-center">
          <h1 className="text-3xl sm:text-[40px] leading-[1.15] font-bold text-white tracking-tight mb-3">
            AI & ML jobs
          </h1>
          <p className="text-white/70 text-base sm:text-lg max-w-xl mx-auto">
            Machine learning, LLM, and data science roles from top product
            companies.
          </p>
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <Suspense fallback={<FiltersBarSkeleton />}>
          <JobBrowser initialCategory="ai-ml" heading="AI & ML roles" />
        </Suspense>
      </section>
    </div>
  );
}
