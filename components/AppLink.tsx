"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";
import { memberHref } from "@/lib/workspace";
export default function AppLink(props: ComponentProps<typeof Link>) {
  const pathname = usePathname();
  return (
    <Link
      {...props}
      href={
        pathname.startsWith("/dashboard") && typeof props.href === "string"
          ? memberHref(props.href)
          : props.href
      }
    />
  );
}
