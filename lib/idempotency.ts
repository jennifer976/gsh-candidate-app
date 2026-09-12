import AsyncStorage from "@react-native-async-storage/async-storage";

const PREFIX = "gsh:pending-idempotency:v1:";

function randomPart(): string {
  const cryptoLike = globalThis.crypto as { randomUUID?: () => string } | undefined;
  if (cryptoLike?.randomUUID) return cryptoLike.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

const storageKey = (scope: string) => `${PREFIX}${scope.replace(/[^A-Za-z0-9:_-]/g, "_").slice(0, 180)}`;

/** Reuses the same key until success is confirmed, including after an app restart. */
export async function getOrCreateIdempotencyKey(scope: string): Promise<string> {
  const key = storageKey(scope);
  try {
    const existing = await AsyncStorage.getItem(key);
    if (existing) return existing;
    const created = `mobile:${scope}:${randomPart()}`.slice(0, 240);
    await AsyncStorage.setItem(key, created);
    return created;
  } catch {
    return `mobile:${scope}:${randomPart()}`.slice(0, 240);
  }
}

export async function clearIdempotencyKey(scope: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(storageKey(scope));
  } catch {
    // Cleanup is best effort; the server still deduplicates a retained key.
  }
}

/** Introduction transitions are one-shot and stable across retries/restarts. */
export function introductionTransitionIdempotencyKey(
  introductionId: string,
  status: "consented" | "declined",
): string {
  return `mobile:introduction:${introductionId}:${status}`.slice(0, 240);
}
