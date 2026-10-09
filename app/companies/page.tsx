import PageHeader from "@/components/PageHeader";
import CompanyDirectory from "@/components/CompanyDirectory";
import { listCompanyPage } from "@/lib/reerhub";
import { Suspense } from "react";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata(
  "Product Companies Hiring in India",
  "Explore companies hiring engineering, AI and data talent in India. Browse their official openings and find the team behind your next tech role.",
  "/companies",
);
export const dynamic = "force-dynamic";
export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const query = params.q || "",
    hiring = params.hiring === "true",
    page = Math.max(1, Number.parseInt(params.page || "1", 10) || 1);
  const initialData = await listCompanyPage({
    page,
    limit: 50,
    q: query,
    hiring: String(hiring),
  });
  const companies = initialData.data;
  const roles = companies.reduce((sum, c) => sum + (c.activeJobs || 0), 0);
  return (
    <div>
      <PageHeader
        title="Find the team behind your next role."
        description="Explore the companies in our catalog. Every opening comes from a company’s own career page."
      >
        <div className="flex gap-8">
          <div>
            <p className="font-display text-3xl font-bold text-ink">
              {initialData.summary?.totalCompanies ??
                initialData.pagination.total}
            </p>
            <p className="mt-1 text-xs text-slate-600">Companies indexed</p>
          </div>
          <div>
            <p className="font-display text-3xl font-bold text-primary">
              {initialData.summary?.totalJobs ?? roles}
            </p>
            <p className="mt-1 text-xs text-slate-600">Open tech roles</p>
          </div>
        </div>
      </PageHeader>
      <section className="page-container py-10">
        <Suspense fallback={<p>Loading companies…</p>}>
          <CompanyDirectory
            initialData={initialData}
            initialKey={JSON.stringify([query, hiring, page])}
          />
        </Suspense>
      </section>
    </div>
  );
}
