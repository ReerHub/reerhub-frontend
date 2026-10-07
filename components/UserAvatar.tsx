"use client";

import Image from "next/image";
import { useState } from "react";

export default function UserAvatar({
  name,
  avatarUrl,
}: {
  name?: string;
  avatarUrl?: string;
}) {
  const [failedUrl, setFailedUrl] = useState<string>();
  if (!avatarUrl || failedUrl === avatarUrl) {
    return (
      <span
        className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-soft text-sm font-bold text-primary-deep"
        aria-hidden="true"
      >
        {(name?.trim() || "U").charAt(0).toUpperCase()}
      </span>
    );
  }
  return (
    <Image
      src={avatarUrl}
      alt=""
      width={32}
      height={32}
      unoptimized
      referrerPolicy="no-referrer"
      onError={() => setFailedUrl(avatarUrl)}
      className="h-8 w-8 rounded-full object-cover"
    />
  );
}
