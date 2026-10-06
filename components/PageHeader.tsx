import Link from "next/link";
import Icon from "@/components/ui/Icon";
import type { ReactNode } from "react";
export default function PageHeader({
  title,
  description,
  children,
  back,
}: {
  title: string;
  description: string;
  children?: ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <section className="page-heading">
      <div className="page-container py-10 sm:py-14">
        {back && (
          <Link
            href={back.href}
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary"
          >
            <Icon name="arrow" className="h-4 w-4 rotate-180" />
            {back.label}
          </Link>
        )}
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-5xl">
              {title}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
              {description}
            </p>
          </div>
          {children}
        </div>
      </div>
    </section>
  );
}
