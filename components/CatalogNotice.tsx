import type { CatalogMetadata } from "@/lib/reerhub";

export function catalogInitializing(data: CatalogMetadata | null | undefined) {
  return (
    !!data?.catalogStatus &&
    data.catalogStatus !== "ready" &&
    data.catalogHasVerifiedJobs === false
  );
}
export default function CatalogNotice({
  data,
}: {
  data?: CatalogMetadata | null;
}) {
  if (!data?.catalogStatus || data.catalogStatus === "ready") return null;
  return (
    <p
      role="status"
      className="my-5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-6 text-slate-700"
    >
      {catalogInitializing(data)
        ? data.catalogStatus === "attention"
          ? "Our first job information update is delayed. Please check back shortly."
          : "We’re preparing our first verified openings. Please check back shortly."
        : data.catalogStatus === "attention"
          ? "Some job information updates are delayed."
          : "We’re updating job information. You can continue browsing."}
    </p>
  );
}
