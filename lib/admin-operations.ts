export type OperationsKind = "changes" | "syncs" | "emails" | "sources";
export type OperationsSummary = {
  day: string;
  timezone: string;
  generatedAt: string;
  changes: Record<string, number>;
  syncs: Record<string, number>;
  deliveries: Record<string, number>;
  digestRun?: {
    status: string;
    startedAt: string;
    completedAt?: string;
    summary?: {
      evaluated: number;
      sent: number;
      failed: number;
      reviewRequired: number;
      skipped: Record<string, number>;
    };
  } | null;
  scheduler: {
    enabled: boolean;
    sourceTimes: string[];
    digestTime: string;
    tasks: {
      key: string;
      dueAt: string;
      lastCompletedAt?: string;
      claimedUntil?: string;
    }[];
  };
};
type JobRef = {
  _id: string;
  title: string;
  companyId?: { name: string };
  sourceId?: { name: string };
};
export type OperationsRow = {
  _id: string;
  type?: string;
  status?: string;
  name?: string;
  jobId?: JobRef | null;
  jobIds?: JobRef[];
  userId?: { name: string; email: string } | null;
  companyId?: { name: string } | null;
  sourceId?: { name: string } | null;
  detectedAt?: string;
  startedAt?: string;
  completedAt?: string;
  attemptedAt?: string;
  deliveredAt?: string;
  lastAttemptedSyncAt?: string;
  lastSuccessfulSyncAt?: string;
  nextScheduledSyncAt?: string;
  syncClaimedUntil?: string;
  stats?: Record<string, number>;
  errors?: string[];
  warnings?: string[];
  changes?: Record<string, { old?: unknown; new?: unknown }>;
};
export const operationsToday = (now = new Date()) =>
  new Date(now.getTime() + 19800000).toISOString().slice(0, 10);
export const operationsTime = (value?: string) =>
  !value || !Number.isFinite(new Date(value).getTime())
    ? "Not recorded"
    : new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Kolkata",
      }).format(new Date(value));
export const operationLabel = (value: string) =>
  ({
    created: "Added",
    updated: "Updated",
    reopened: "Reopened",
    closed: "Closed",
    delivered: "SMTP accepted",
    sending: "Sending",
    review: "Needs review",
    running: "Running",
    success: "Successful",
    partial: "Partial",
    failed: "Failed",
    completed: "Completed",
    unverifiedEmail: "Unverified email",
    preference: "Email preference",
    incompleteProfile: "Incomplete profile",
    existingDelivery: "Existing delivery claim",
    noQualifiedUnseenMatches: "No qualifying unseen matches",
    reviewRequired: "Needs review",
  })[value] || value.replace(/([A-Z])/g, " $1").replaceAll("_", " ");
