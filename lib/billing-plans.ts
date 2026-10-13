export type PlanId = "pro-weekly" | "pro-monthly" | "pro-quarterly";

export const PLANS: {
  id: PlanId;
  name: string;
  price: string;
  per: string;
  badge?: string;
  blurb: string;
  saving: string;
}[] = [
  {
    id: "pro-weekly",
    name: "Weekly",
    price: "₹49",
    per: "/ week",
    blurb: "Low commitment. Try Pro week by week.",
    saving: "Most flexible",
  },
  {
    id: "pro-monthly",
    name: "Monthly",
    price: "₹149",
    per: "/ month",
    badge: "Recommended",
    blurb: "The sensible default for an active search.",
    saving: "Just ~₹35 / week",
  },
  {
    id: "pro-quarterly",
    name: "Quarterly",
    price: "₹299",
    per: "/ 3 months",
    badge: "Best value",
    blurb: "Stay covered for a full search cycle.",
    saving: "Save 33% vs monthly · ~₹100 / mo",
  },
];
