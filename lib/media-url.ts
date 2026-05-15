import { getApiOrigin } from "@/lib/config";

/**
 * Turn API upload paths (`/uploads/...`) into absolute URLs for React Native Image.
 * Mirrors web `publicUploadAssetUrl`.
 */
export function resolveUploadAssetUrl(url?: string | null): string {
  if (!url?.trim()) return "";
  const u = url.trim();
  if (/^https?:\/\//i.test(u)) return u;
  const origin = getApiOrigin();
  const path = u.startsWith("/") ? u : `/${u}`;
  if (path.startsWith("/api/")) return `${origin}${path}`;
  // Upload routes are mounted at /api/v1/uploads (not API root /uploads).
  if (path.startsWith("/uploads/")) return `${origin}/api/v1${path}`;
  return `${origin}${path}`;
}
