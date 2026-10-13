import Link from "next/link";
import type { ReactNode } from "react";

export default function EditorialPage({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow: string;
  children: ReactNode;
}) {
  return (
    <article className="editorial-page page-container">
      <header className="editorial-intro">
        <div>
          <p className="page-heading-kicker">{eyebrow}</p>
          <h1>{title}</h1>
        </div>
      </header>
      <div className="editorial-body">
        <div>{children}</div>
        <aside>
          <p className="workspace-label">BUILT FOR YOUR NEXT CHAPTER</p>
          <h2>Good work starts with a little clarity.</h2>
          <p className="my-5 text-sm leading-7 text-slate-600">
            Explore real openings. Understand the details. Take your next step
            directly with the employer.
          </p>
          <Link href="/jobs">
            Explore tech jobs{" "}
            <span className="ml-auto" aria-hidden="true">
              ↗
            </span>
          </Link>
          <Link href="/companies">
            Meet the companies{" "}
            <span className="ml-auto" aria-hidden="true">
              ↗
            </span>
          </Link>
          <Link href="/contact">
            Talk to us{" "}
            <span className="ml-auto" aria-hidden="true">
              ↗
            </span>
          </Link>
        </aside>
      </div>
    </article>
  );
}
