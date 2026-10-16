import { extractResumeRequest } from "./auth";
export type ResumeDraft = {
  extractionVersion: number;
  pages: number;
  facts: {
    skills: string[];
    roleCandidates: string[];
    experience: {
      minYears: number | null;
      maxYears: number | null;
      status: string;
    };
    employmentIntervals: { start: string; end: string }[];
    excludedIntervalCount: number;
    textQuality: string;
  };
};
export async function extractResume(
  file: File,
  signal: AbortSignal,
): Promise<ResumeDraft> {
  if (
    file.size > 5 * 1024 * 1024 ||
    !file.size ||
    !file.name.toLowerCase().endsWith(".pdf")
  )
    throw new Error("Choose a PDF up to 5 MB and 10 pages.");
  const form = new FormData();
  form.append("resume", file);
  return extractResumeRequest<ResumeDraft>(form, signal);
}
