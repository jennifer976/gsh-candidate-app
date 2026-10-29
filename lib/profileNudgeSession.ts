import AsyncStorage from "@react-native-async-storage/async-storage";
import { nudgeStorageKey } from "@/lib/profileNudge";

/** Module-level: tip shown at most once per app process (resets on full close / sign out). */
let shownThisSession = false;

export function getNudgeShownThisSession(): boolean {
  return shownThisSession;
}

export function markNudgeShownThisSession(): void {
  shownThisSession = true;
}

export function resetNudgeSession(): void {
  shownThisSession = false;
}

export async function readNotNowAt(userId: string): Promise<number | null> {
  try {
    const raw = await AsyncStorage.getItem(nudgeStorageKey(userId));
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export async function writeNotNowAt(userId: string, at: number): Promise<void> {
  await AsyncStorage.setItem(nudgeStorageKey(userId), String(at));
}
