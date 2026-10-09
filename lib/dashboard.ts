export type ScoreTier = 90 | 75 | 50 | 25 | 0;
export function dashboardView(requested: string | null, pro: boolean) {
  if (requested === "saved" || requested === "discover") return requested;
  return pro ? "matches" : "discover";
}
export function nextMatchTier(
  current: ScoreTier,
  counts: Record<string, number>,
): ScoreTier | null {
  return (
    ([90, 75, 50, 25, 0] as ScoreTier[]).find(
      (tier) =>
        tier < current && (counts[tier === 0 ? "all" : String(tier)] || 0) > 0,
    ) ?? null
  );
}
export function countsAfterHide(counts: Record<string, number>, score: number) {
  return Object.fromEntries(
    Object.entries(counts).map(([tier, count]) => [
      tier,
      tier === "all" || score >= Number(tier) ? Math.max(0, count - 1) : count,
    ]),
  );
}
export function experienceLabel(experience?: { min?: number; max?: number }) {
  const min = experience?.min,
    max = experience?.max;
  if (Number.isFinite(min) && Number.isFinite(max))
    return min === max
      ? `${min} years experience`
      : `${min}–${max} years experience`;
  if (Number.isFinite(min)) return `${min}+ years experience`;
  if (Number.isFinite(max)) return `Up to ${max} years experience`;
  return "";
}
