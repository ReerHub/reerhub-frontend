import EditorialPage from "@/components/EditorialPage";
import Link from "@/components/AppLink";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata(
  "Contact REERHUB Support",
  "Contact REERHUB for job listing questions, account help and subscription support. Find direct links to billing controls and product policies.",
  "/contact",
);
export default function ContactPage() {
  return (
    <EditorialPage title="A real person. A little help." eyebrow="LET’S TALK">
      <p className="mt-6 text-lg leading-8 text-slate-600">
        For listing corrections, account questions or subscription support,
        email{" "}
        <a href="mailto:support@reerhub.com" className="font-medium underline">
          support@reerhub.com
        </a>
        .
      </p>
      <h2 className="mt-9 text-2xl font-bold">Help us understand the issue</h2>
      <p className="mt-4 leading-8 text-slate-600">
        For a job issue, include the REERHUB listing link and the employer’s
        official link. For billing, describe the issue and your selected plan.
        Do not send passwords, sign-in links, payment-card details or
        authentication codes.
      </p>
      <h2 className="mt-9 text-2xl font-bold">Useful next steps</h2>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link href="/faq" className="btn-secondary">
          Frequently asked questions
        </Link>
        <Link href="/billing" className="btn-primary">
          Manage subscription
        </Link>
        <Link href="/profile" className="btn-secondary">
          Profile and email preferences
        </Link>
        <Link href="/matching-methodology" className="btn-secondary">
          Matching methodology
        </Link>
        <Link href="/terms" className="btn-secondary">
          Terms
        </Link>
        <Link href="/privacy" className="btn-secondary">
          Privacy
        </Link>
      </div>
      <p className="mt-6 text-sm leading-7 text-slate-600">
        REERHUB TECHNOLOGIES operates the product. Applications are handled by
        each employer; REERHUB cannot confirm an employer’s application outcome.
      </p>
    </EditorialPage>
  );
}
