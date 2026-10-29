const THREE_DAYS_MS = 72 * 60 * 60 * 1000;

export type NudgeInput = {
  signedIn: boolean;
  percent: number;
  shownThisSession: boolean;
  notNowAt: number | null;
  now: number;
};

export function shouldShowNudge({
  signedIn,
  percent,
  shownThisSession,
  notNowAt,
  now,
}: NudgeInput): boolean {
  if (!signedIn) return false;
  if (percent >= 100) return false;
  if (shownThisSession) return false;
  if (notNowAt != null && now - notNowAt < THREE_DAYS_MS) return false;
  return true;
}

export function nudgeText(percent: number): string {
  return `Your profile is ${percent}% done.`;
}

export function nudgeStorageKey(userId: string): string {
  return `profileNudge:notNowAt:${userId}`;
}

export const NUDGE_COOLDOWN_MS = THREE_DAYS_MS;
