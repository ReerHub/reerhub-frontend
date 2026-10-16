import type { Job } from "./reerhub";
export function experienceLabel(
  job: Pick<
    Job,
    "requirementStatus" | "experience" | "experienceMaximumRequired"
  >,
) {
  const { min, max } = job.experience || {};
  if (
    job.requirementStatus !== "verified" ||
    typeof min !== "number" ||
    !Number.isFinite(min) ||
    min < 0
  )
    return null;
  return job.experienceMaximumRequired &&
    typeof max === "number" &&
    Number.isFinite(max) &&
    max >= min
    ? `${min}–${max} years required`
    : `${min}+ years required`;
}
export function salaryLabel(salary: Job["salary"]) {
  if (
    !salary ||
    !/^[A-Z]{3}$/.test(salary.currency || "") ||
    !["hour", "month", "year"].includes(salary.period || "")
  )
    return null;
  const valid = (v: unknown): v is number =>
    typeof v === "number" && Number.isFinite(v) && v >= 0;
  if (
    (salary.min !== undefined && !valid(salary.min)) ||
    (salary.max !== undefined && !valid(salary.max))
  )
    return null;
  if (!valid(salary.min) && !valid(salary.max)) return null;
  if (valid(salary.min) && valid(salary.max) && salary.min > salary.max)
    return null;
  const number = (n: number) =>
    n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
  const range =
    valid(salary.min) && valid(salary.max)
      ? salary.min === salary.max
        ? number(salary.min)
        : `${number(salary.min)}–${number(salary.max)}`
      : valid(salary.min)
        ? `from ${number(salary.min)}`
        : `up to ${number(salary.max!)}`;
  return `${salary.currency} ${range} / ${salary.period}`;
}
export function cardSkills(job: Job) {
  return [
    ...new Set([...(job.matchedSkills || []), ...(job.skills || [])]),
  ].slice(0, Math.max(2, job.matchedSkills?.length || 0));
}
