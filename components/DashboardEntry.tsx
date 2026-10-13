"use client";
import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { memberHref } from "@/lib/workspace";
import Overview from "@/components/MemberOverview";
import PageLoading from "@/components/PageLoading";
function Entry() {
  const params = useSearchParams(),
    router = useRouter();
  const { user, loading } = useAuth();
  const here = `/dashboard${params.size ? `?${params}` : ""}`;
  const destination = memberHref(here);
  useEffect(() => {
    if (!loading && user && destination !== here)
      router.replace(destination + window.location.hash);
  }, [user, loading, destination, here, router]);
  if (loading || !user || destination !== here) return <PageLoading />;
  return <Overview />;
}
export default function DashboardEntry() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Entry />
    </Suspense>
  );
}
