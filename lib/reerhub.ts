// Browser uses same-origin /api/v1 (Next rewrite proxies to the backend,
// so the backend URL never ships in client JS). Server components/SSR use
// server-only API_URL directly.
const SERVER_API_BASE = process.env.API_URL || "http://localhost:8000/api/v1";
import { sharedRead } from "./read-sharing";

export const API_BASE =
  typeof window === "undefined" ? SERVER_API_BASE : "/api/v1";

// Single source of truth for the API origin (server-only).
export const SERVER_URL =
  SERVER_API_BASE.replace(/\/api\/v1\/?$/, "") || "http://localhost:8000";

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
  // Teaser shape for anonymous readers: gated fields are omitted and an
  // excerpt is served instead (backend strips without a session).
  excerpt?: string;
  department?: string;
  employmentType?: string;
  remoteType?: string;
  seniority?: string;
  techTrack?: TechTrack;
  techRole?: string;
  taxonomyVersion?: number;
  isIndiaRole?: boolean;
  locations: { city?: string; state?: string; country?: string }[];
  skills?: string[];
  applicationUrl?: string;
  sourceUrl: string;
  postedAt?: string;
  firstSeenAt: string;
  status: string;
  companyId: {
    _id: string;
    name: string;
    slug: string;
    logoUrl?: string;
    website?: string;
    careersUrl?: string;
  };
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
    cache: "no-store",
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
  signal?: AbortSignal,
): Promise<{ jobs: Job[]; total: number; totalPages: number }> => {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== "" && value !== undefined) search.set(key, String(value));
  }
  const query = search.toString();
  const res = await fetch(`${API_BASE}/jobs${query ? `?${query}` : ""}`, {
    cache: "no-store",
    signal,
  });
  if (!res.ok) throw new Error(`API ${res.status}: /jobs`);
  const json = await res.json();
  return {
    jobs: json.data as Job[],
    total: json.pagination?.total ?? 0,
    totalPages: json.pagination?.totalPages ?? 0,
  };
};

export const getJob = (jobId: string, init?: RequestInit) =>
  get<Job>(`/jobs/${jobId}`, init);

export const listCompanies = () =>
  typeof window === "undefined"
    ? get<Company[]>("/companies")
    : sharedRead("companies", () => get<Company[]>("/companies"));
export type HomeSnapshot = {
  jobs: Job[];
  companies: Company[];
  totalCompanies: number;
  totalJobs: number;
  snapshotAt: string;
};
export const getHome = () => get<HomeSnapshot>("/home");
export type CompanyPage = {
  summary?: { totalCompanies: number; totalJobs: number };
  data: Company[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
export const listCompanyPage = async (
  params: Record<string, string | number>,
  signal?: AbortSignal,
): Promise<CompanyPage> => {
  const res = await fetch(
    `${API_BASE}/companies?${new URLSearchParams(Object.entries(params).map(([key, value]) => [key, String(value)]))}`,
    { cache: "no-store", signal },
  );
  if (!res.ok) throw new Error("Could not load companies");
  return res.json();
};

export const getCompany = (slug: string) => get<Company>(`/companies/${slug}`);

export const listCompanyJobs = (companyId: string, limit = 50) =>
  listJobsWithMeta({ companyId, limit });

// SEO slug URLs: /jobs/{title}-{company}-{id} (backend untouched — the
// trailing 24-hex id is the lookup key; bare ids keep working and
// canonical-redirect to the slug form).
export const slugify = (value: string) =>
  (value || "job")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "job";

export const jobSlug = (job: {
  title: string;
  companyId?: { name?: string } | null;
  _id: string;
}) =>
  `${slugify(job.title)}-${slugify(job.companyId?.name || "company")}-${job._id}`;

export const parseJobSlug = (slug: string): string | null => {
  const hit = /-([a-f0-9]{24})$/.exec(slug || "");
  return hit ? hit[1] : null;
};

export const jobUrl = (job: {
  title: string;
  companyId?: { name?: string } | null;
  _id: string;
}) => `/jobs/${jobSlug(job)}`;
