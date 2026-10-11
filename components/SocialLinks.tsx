import { SOCIAL_LINKS } from "@/lib/social-links";

export default function SocialLinks() {
  return (
    <nav aria-label="REERHUB social media" className="mt-6">
      <p className="mb-2 text-xs font-semibold text-blue-100">
        Connect with us
      </p>
      <ul className="flex max-w-xs flex-wrap gap-2">
        {SOCIAL_LINKS.map(({ label, url }) => (
          <li key={label}>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`REERHUB on ${label} (opens in a new tab)`}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/20 px-3 text-sm text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              {label}
              <span aria-hidden="true" className="text-blue-200">
                ↗
              </span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
