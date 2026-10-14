"use client";

import { usePathname } from "next/navigation";
import Link from "@/components/AppLink";
import { pageBreadcrumbs, type BreadcrumbItem } from "@/lib/breadcrumbs";
import { memberHref } from "@/lib/workspace";

export default function Breadcrumbs({
  origin,
  items,
  contained = false,
}: {
  origin?: string;
  items?: BreadcrumbItem[];
  contained?: boolean;
}) {
  const pathname = usePathname();
  const member = pathname.startsWith("/dashboard");
  const trail = items
    ? items.map((item, index) =>
        member
          ? {
              name: index === 0 ? "Overview" : item.name,
              path: memberHref(item.path),
            }
          : item,
      )
    : pageBreadcrumbs(pathname);
  if (!trail) return null;
  const schema =
    !member && origin
      ? {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: trail.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: new URL(item.path, origin).href,
          })),
        }
      : null;
  return (
    <div className={contained ? "mb-6" : "page-container pt-6"}>
      <nav aria-label="Breadcrumb">
        <ol className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm leading-6 text-slate-600">
          {trail.map((item, index) => (
            <li key={item.path} className="flex min-w-0 items-center gap-2">
              {index > 0 && (
                <span aria-hidden="true" className="text-slate-400">
                  /
                </span>
              )}
              {index === trail.length - 1 ? (
                <span
                  aria-current="page"
                  className="break-words font-medium text-ink"
                >
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.path}
                  className="rounded-sm hover:text-primary-deep focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                >
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
          }}
        />
      )}
    </div>
  );
}
