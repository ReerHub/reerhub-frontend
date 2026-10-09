"use client";
import Link from "next/link";
import { useAuth } from "./AuthProvider";
export function HomeAccountAction({
  className,
  guest,
  pro = false,
}: {
  className: string;
  guest: string;
  pro?: boolean;
}) {
  const { user } = useAuth();
  const href = pro
    ? user?.membership?.isPro
      ? "/dashboard"
      : "/billing"
    : user
      ? "/dashboard"
      : "/login?next=/dashboard";
  const text = pro
    ? user?.membership?.isPro
      ? "Open my matches"
      : guest
    : user
      ? "Open my dashboard"
      : guest;
  return (
    <Link href={href} className={className}>
      {text}
    </Link>
  );
}
export function HomeGuestNote({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user ? null : children;
}
