import { getMarketingSiteUrl } from "@/lib/config";

/**
 * Absolute URL on www (or staging via EXPO_PUBLIC_SITE_URL).
 * `path` may include a query string, e.g. `/jobs/external?job=…`
 */
export function marketingUrl(path: string): string {
  const base = getMarketingSiteUrl().replace(/\/+$/, "");
  const raw = path.startsWith("/") ? path : `/${path}`;
  return new URL(`${base}${raw}`).toString();
}
