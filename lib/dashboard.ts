export type ScoreTier = 90 | 75 | 50 | 25 | 0;
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
export function experienceLabel(
  experience?: { min?: number; max?: number },
  maximumRequired = false,
) {
  const min = experience?.min,
    max = experience?.max;
  if (Number.isFinite(min) && Number.isFinite(max) && maximumRequired)
    return `${min}–${max} years required`;
  if (Number.isFinite(min))
    return min === 0
      ? "No minimum experience required"
      : `Minimum ${min} years`;
  if (Number.isFinite(max) && maximumRequired) return `Maximum ${max} years`;
  return "";
}
