import { getApiOrigin } from "@/lib/config";

/**
 * Turn API upload paths (`/uploads/...`) into absolute URLs for React Native Image.
 * Mirrors web `publicUploadAssetUrl`.
 */
export function resolveUploadAssetUrl(url?: string | null): string {
  if (!url?.trim()) return "";
  let raw = url.trim();
  if (raw.startsWith("//")) raw = `https:${raw}`;

  if (/^https?:\/\//i.test(raw)) {
    try {
      const parsed = new URL(raw);
      if (parsed.pathname.startsWith("/uploads/")) {
        return `${getApiOrigin()}${parsed.pathname}${parsed.search}`;
      }
    } catch {
      return raw;
    }
    return raw;
  }

  const origin = getApiOrigin();
  const path = raw.startsWith("/") ? raw : `/${raw}`;
  return `${origin}${path}`;
}
