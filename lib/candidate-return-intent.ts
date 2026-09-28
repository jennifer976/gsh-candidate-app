import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Router } from "expo-router";
import { createEmployerFollow, createJobSearchAlert, saveJob } from "./api-client";

const STORAGE_KEY = "gsh:candidate:return-intent:v1";
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export type CandidatePendingAction =
  | { kind: "save_job"; jobId: string }
  | { kind: "follow_employer"; employerUserId: string }
  | { kind: "apply_job"; jobId: string }
  | { kind: "create_alert"; name: string; filters: Record<string, unknown> };

export type CandidateReturnIntent = {
  returnTo: string;
  action?: CandidatePendingAction;
  createdAt: number;
};

const SAFE_ROUTE_PREFIXES = [
  "/(tabs)/",
  "/job/",
  "/external-job/",
  "/company/",
  "/companies",
  "/employer-follows",
  "/alerts",
  "/matches",
  "/notification-feed",
  "/relocation-perks",
  "/saved",
  "/resources",
  "/saved-resources",
  "/mobility-profile",
  "/agency-introductions",
  "/relocation-help",
  "/conversation/",
  "/application-tracker",
  "/tools",
  "/tools-resources",
  "/guides",
  "/countries",
  "/country/",
  "/guide/",
  "/relocating/",
  "/trust/",
  "/partners",
] as const;

const cleanId = (value: unknown) =>
  typeof value === "string" && /^[A-Za-z0-9_-]{1,160}$/.test(value.trim())
    ? value.trim()
    : "";

/**
 * Native return intents are deliberately narrower than arbitrary app routes.
 * Reject authority separators, controls, auth loops, and unknown screens.
 */
export function safeCandidateReturnIntent(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const candidate = value.trim();
  if (
    !candidate.startsWith("/") ||
    candidate.startsWith("//") ||
    candidate.includes("\\") ||
    /[\u0000-\u001f\u007f]/.test(candidate)
  ) {
    return null;
  }
  const path = candidate.split(/[?#]/, 1)[0] || "/";
  if (path === "/" || path.startsWith("/login") || path.startsWith("/register") || path.startsWith("/verify")) {
    return null;
  }
  return SAFE_ROUTE_PREFIXES.some((prefix) => path === prefix || path.startsWith(prefix))
    ? candidate
    : null;
}

export function parsePendingCandidateAction(
  kind: unknown,
  targetId: unknown,
): CandidatePendingAction | undefined {
  const target = cleanId(targetId);
  if (!target) return undefined;
  if (kind === "save_job") return { kind, jobId: target };
  if (kind === "follow_employer") return { kind, employerUserId: target };
  if (kind === "apply_job") return { kind, jobId: target };
  return undefined;
}

function validAction(value: unknown): value is CandidatePendingAction {
  if (!value || typeof value !== "object") return false;
  const action = value as Record<string, unknown>;
  if (action.kind === "save_job" || action.kind === "apply_job") return Boolean(cleanId(action.jobId));
  if (action.kind === "follow_employer") return Boolean(cleanId(action.employerUserId));
  if (action.kind === "create_alert") {
    return (
      typeof action.name === "string" &&
      action.filters != null &&
      typeof action.filters === "object" &&
      !Array.isArray(action.filters)
    );
  }
  return false;
}

export async function persistCandidateReturnIntent(
  returnTo: unknown,
  action?: CandidatePendingAction,
): Promise<CandidateReturnIntent | null> {
  const safe = safeCandidateReturnIntent(returnTo);
  if (!safe) return null;
  let retainedAction = action;
  if (!retainedAction) {
    try {
      const currentRaw = await AsyncStorage.getItem(STORAGE_KEY);
      const current = currentRaw ? JSON.parse(currentRaw) as Partial<CandidateReturnIntent> : null;
      if (current && safeCandidateReturnIntent(current.returnTo) === safe && validAction(current.action)) {
        retainedAction = current.action;
      }
    } catch {
      // A fresh route-only intent is still safe when previous storage is unreadable.
    }
  }
  const intent: CandidateReturnIntent = {
    returnTo: safe,
    ...(retainedAction ? { action: retainedAction } : {}),
    createdAt: Date.now(),
  };
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(intent));
  } catch {
    // Authentication remains available when local storage is unavailable.
  }
  return intent;
}

export async function readCandidateReturnIntent(): Promise<CandidateReturnIntent | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CandidateReturnIntent>;
    const returnTo = safeCandidateReturnIntent(parsed.returnTo);
    const createdAt = Number(parsed.createdAt);
    if (!returnTo || !Number.isFinite(createdAt) || Date.now() - createdAt > MAX_AGE_MS) {
      await AsyncStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return {
      returnTo,
      createdAt,
      ...(validAction(parsed.action) ? { action: parsed.action } : {}),
    };
  } catch {
    return null;
  }
}

export async function clearCandidateReturnIntent(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // Best-effort cleanup only.
  }
}

async function executeAction(action: CandidatePendingAction): Promise<string> {
  if (action.kind === "save_job") {
    await saveJob(action.jobId);
    return `/job/${encodeURIComponent(action.jobId)}`;
  }
  if (action.kind === "follow_employer") {
    await createEmployerFollow(action.employerUserId);
    return `/company/employer/${encodeURIComponent(action.employerUserId)}`;
  }
  if (action.kind === "apply_job") {
    return `/job/${encodeURIComponent(action.jobId)}`;
  }
  await createJobSearchAlert(action.name || "My search", action.filters);
  return "/alerts";
}

/**
 * Consume once after a validated candidate session and onboarding. Failed
 * writes remain pending so a network retry cannot silently lose the intent.
 */
export async function resumeCandidateReturnIntent(
  router: Router,
  fallback = "/(tabs)/home",
): Promise<{ completed: boolean; error?: string }> {
  const intent = await readCandidateReturnIntent();
  if (!intent) return { completed: false };
  try {
    const route = intent.action ? await executeAction(intent.action) : intent.returnTo;
    await clearCandidateReturnIntent();
    router.replace(route as never);
    return { completed: true };
  } catch (error: unknown) {
    const message =
      error && typeof error === "object" && "message" in error
        ? String((error as { message: unknown }).message)
        : "Could not finish the requested action.";
    router.replace((intent.returnTo || fallback) as never);
    return { completed: false, error: message };
  }
}
