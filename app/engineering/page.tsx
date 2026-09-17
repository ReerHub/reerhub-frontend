import type { Metadata } from "next";
import JobBrowser from "@/components/JobBrowser";

export const metadata: Metadata = {
  title: "Engineering Jobs in India | ReerHub",
  description:
    "Software engineering roles — SDE, backend, frontend, DevOps, data — from India's top product companies, indexed from official career pages.",
};

export default function EngineeringPage() {
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
            Engineering jobs
          </h1>
          <p className="text-white/70 text-base sm:text-lg max-w-xl mx-auto">
            SDE, backend, frontend, mobile, DevOps, and data roles from top
            product companies.
          </p>
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <JobBrowser
          initialCategory="software"
          heading="Software engineering roles"
        />
      </section>
    </div>
  );
}
