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
  // Static files are served at `{origin}/uploads` (see API `app.use("/uploads", ...)`).
  return `${origin}${path}`;
}
