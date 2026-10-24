import { authenticatedRequest } from "@/lib/auth";
export type User = { id: string; name: string };
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
/** Capture the document owner before any asynchronous CSRF/refresh work. */
export async function api<T>(
  path: string,
  init: RequestInit = {},
  expectedOwner?: string,
): Promise<T> {
  try {
    return await authenticatedRequest<T>(path, {
      ...init,
      cache: "no-store",
      headers: {
        ...init.headers,
        ...(path.startsWith("/resumes")
          ? { "x-resume-owner": expectedOwner || "guest" }
          : {}),
      },
    });
  } catch (error) {
    const failure = error as Error & { status?: number };
    throw new ApiError(
      failure.status || 0,
      failure.message || "Please try again.",
    );
  }
}
export const json = (method: string, body?: unknown): RequestInit => ({
  method,
  ...(body === undefined ? {} : { body: JSON.stringify(body) }),
});
