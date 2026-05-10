import { getMarketingSiteUrl } from "@/lib/config";

/** Absolute URL on www (or staging via EXPO_PUBLIC_SITE_URL). */
export function marketingUrl(path: string): string {
  const base = getMarketingSiteUrl().replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
