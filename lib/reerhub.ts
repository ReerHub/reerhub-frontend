export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// Single source of truth for the API origin. NEXT_PUBLIC_SERVER_URL is kept
// as a deprecated alias so old imports keep working.
export const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, "") ||
  "http://localhost:8000";

export type TechTrack =
  | "software"
  | "ai-ml"
  | "data"
  | "cloud-infra"
  | "mobile"
  | "security"
  | "qa"
  | "systems"
  | "eng-management";

export const TECH_TRACKS: { value: TechTrack; label: string }[] = [
  { value: "software", label: "Software" },
  { value: "ai-ml", label: "AI / ML" },
  { value: "data", label: "Data" },
  { value: "cloud-infra", label: "Cloud / Infra" },
  { value: "mobile", label: "Mobile" },
  { value: "security", label: "Security" },
  { value: "qa", label: "QA" },
  { value: "systems", label: "Systems" },
  { value: "eng-management", label: "Eng Mgmt" },
];

export type Job = {
  _id: string;
  title: string;
  normalizedTitle?: string;
  description?: string;
  department?: string;
  employmentType?: string;
  remoteType?: string;
  seniority?: string;
  techTrack?: TechTrack;
  techRole?: string;
  taxonomyVersion?: number;
  isIndiaRole?: boolean;
  locations: { city?: string; state?: string; country?: string }[];
  skills: string[];
  applicationUrl: string;
  sourceUrl: string;
  postedAt?: string;
  firstSeenAt: string;
  status: string;
  companyId: { _id: string; name: string; slug: string; logoUrl?: string };
};

export type CompanySource = {
  name: string;
  type: string;
  careersUrl: string;
  lastSuccessfulSyncAt?: string;
};

export type Company = {
  _id: string;
  name: string;
  slug: string;
  website: string;
  careersUrl: string;
  logoUrl?: string;
  industry?: string;
  activeJobs?: number;
  totalJobs?: number;
  sources?: CompanySource[];
};

export class NotFoundError extends Error {
  status: number;

  constructor(status: number, path: string) {
    super(`API ${status}: ${path}`);
    this.name = "NotFoundError";
    this.status = status;
  }
}

async function get<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  if (res.status === 404) throw new NotFoundError(404, path);
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  const json = await res.json();
  return json.data as T;
}

export const listJobsWithMeta = async (
  params: Record<string, string | number> = {},
): Promise<{ jobs: Job[]; total: number; totalPages: number }> => {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== "" && value !== undefined) search.set(key, String(value));
  }
  const query = search.toString();
  const res = await fetch(`${API_BASE}/jobs${query ? `?${query}` : ""}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`API ${res.status}: /jobs`);
  const json = await res.json();
  return {
    jobs: json.data as Job[],
    total: json.pagination?.total ?? 0,
    totalPages: json.pagination?.totalPages ?? 0,
  };
};

export const getJob = (jobId: string) => get<Job>(`/jobs/${jobId}`);

export const listCompanies = () => get<Company[]>("/companies");

export const getCompany = (slug: string) => get<Company>(`/companies/${slug}`);

export const listCompanyJobs = (companyId: string, limit = 50) =>
  listJobsWithMeta({ companyId, limit });
