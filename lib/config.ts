import Constants from "expo-constants";

/** API origin only — client appends `/api/v1`. */
export function normalizeApiOrigin(raw?: string | null): string {
  const fallback = "https://api.globalsponsorhub.com";
  const s = (raw?.trim() || fallback).replace(/\/+$/, "");
  return s.replace(/\/api\/v1\/?$/i, "");
}

export function getApiOrigin(): string {
  const extra = Constants.expoConfig?.extra as { apiUrl?: string } | undefined;
  const fromEnv =
    typeof process.env.EXPO_PUBLIC_API_URL === "string"
      ? process.env.EXPO_PUBLIC_API_URL
      : undefined;
  return normalizeApiOrigin(extra?.apiUrl ?? fromEnv);
}

export function getApiV1BaseUrl(): string {
  return `${getApiOrigin()}/api/v1`;
}

/** Public marketing site (deep links, “open in browser”). */
export function getMarketingSiteUrl(): string {
  const extra = Constants.expoConfig?.extra as { siteUrl?: string } | undefined;
  const env =
    typeof process.env.EXPO_PUBLIC_SITE_URL === "string" ? process.env.EXPO_PUBLIC_SITE_URL.trim() : "";
  return (extra?.siteUrl || env || "https://www.globalsponsorhub.com").replace(/\/+$/, "");
}

/**
 * Same value as `MOBILE_APP_REGISTRATION_KEY` on the API — lets candidate signup succeed when
 * Turnstile is enforced on the server. Optional in dev when the API has no Turnstile secret.
 */
export function getMobileRegistrationKey(): string | undefined {
  const extra = Constants.expoConfig?.extra as { mobileRegistrationKey?: string } | undefined;
  const fromEnv =
    typeof process.env.EXPO_PUBLIC_GSH_MOBILE_REGISTRATION_KEY === "string"
      ? process.env.EXPO_PUBLIC_GSH_MOBILE_REGISTRATION_KEY.trim()
      : "";
  const v = (fromEnv || extra?.mobileRegistrationKey || "").trim();
  return v || undefined;
}
