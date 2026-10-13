export function workspaceLinks(pro: boolean) {
  return [
    ...(pro
      ? [
          {
            href: "/dashboard?view=matches",
            label: "Your matches",
            icon: "spark" as const,
          },
        ]
      : []),
    {
      href: "/dashboard?view=discover",
      label: "Discover jobs",
      icon: "briefcase" as const,
    },
    {
      href: "/dashboard?view=saved",
      label: "Saved roles",
      icon: "bookmark" as const,
    },
    { href: "/profile", label: "Profile & preferences", icon: "user" as const },
    {
      href: "/billing",
      label: pro ? "Manage Pro" : "Explore Pro",
      icon: "grid" as const,
    },
  ];
}
