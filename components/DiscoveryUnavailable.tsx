export default function DiscoveryUnavailable({ href }: { href: string }) {
  return (
    <div role="alert" className="page-container py-12">
      <h1 className="text-2xl font-bold text-slate-900">
        Job information is temporarily unavailable.
      </h1>
      <p className="my-4 text-slate-600">
        Please try again shortly to load the latest openings.
      </p>
      <a className="btn-secondary" href={href}>
        Try again
      </a>
    </div>
  );
}
