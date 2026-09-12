import type { Job, JobMatchNotificationRow } from "@/types/models";

export type NormalizedJobMatch = {
  id: string;
  jobId: string;
  job: Partial<Job> | null;
  source: "saved_search" | "followed_employer";
  read: boolean;
  matchReasons: string[];
  createdAt?: string;
};

const idFrom = (value: unknown): string => {
  if (typeof value === "string") return value.trim();
  if (!value || typeof value !== "object") return "";
  const row = value as Record<string, unknown>;
  return String(row.id ?? row._id ?? "").trim();
};

export function normalizeJobMatch(row: JobMatchNotificationRow): NormalizedJobMatch | null {
  const id = idFrom(row.id) || idFrom(row._id);
  const populatedJob =
    row.job && typeof row.job === "object"
      ? row.job
      : row.jobId && typeof row.jobId === "object"
        ? row.jobId
        : null;
  const jobId = idFrom(row.jobId) || idFrom(populatedJob);
  if (!id || !jobId) return null;
  return {
    id,
    jobId,
    job: populatedJob as Partial<Job> | null,
    source: row.source === "followed_employer" ? "followed_employer" : "saved_search",
    read: row.read === true,
    matchReasons: Array.isArray(row.matchReasons)
      ? row.matchReasons.filter((reason): reason is string => typeof reason === "string" && Boolean(reason.trim())).slice(0, 6)
      : [],
    createdAt: typeof row.createdAt === "string" ? row.createdAt : undefined,
  };
}

export function normalizeJobMatches(rows: JobMatchNotificationRow[]): NormalizedJobMatch[] {
  return rows.map(normalizeJobMatch).filter((row): row is NormalizedJobMatch => row !== null);
}

export const matchSourceLabel = (source: NormalizedJobMatch["source"]) =>
  source === "followed_employer" ? "From an employer you follow" : "From a saved search";
