import { accountMetadata } from "@/lib/seo";
export const metadata = accountMetadata(
  "Page not found",
  "This ReerHub page is unavailable. Explore current official tech openings or return to the homepage.",
);
import Link from "@/components/AppLink";
export default function NotFound() {
  return (
    <section className="state-page page-container">
      <div>
        <span className="state-symbol" aria-hidden="true">
          404
        </span>
        <h1>A different path ahead.</h1>
        <p className="text-slate-600 leading-7">
          This page isn’t here. Your next opportunity might be.
        </p>
        <Link href="/jobs" className="btn-primary mt-7">
          Explore tech jobs
        </Link>
        <Link
          href="/"
          className="mt-4 block min-h-11 text-sm text-primary-deep"
        >
          Back to home
        </Link>
      </div>
    </section>
  );
}
