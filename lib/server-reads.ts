import "server-only";
import { cache } from "react";
import { getCompany, getJob } from "./reerhub";
// Request-scoped only: do not stack a second freshness TTL over the API cache.
export const readCompany = cache((slug: string) => getCompany(slug));
export const readJob = cache((id: string) => getJob(id));
