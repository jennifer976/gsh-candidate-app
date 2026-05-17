import { getApiOrigin } from "@/lib/config";

function uploadsPathname(pathname: string): string | null {
  const idx = pathname.indexOf("/uploads/");
  if (idx >= 0) return pathname.slice(idx);
  if (pathname.startsWith("/uploads/")) return pathname;
  return null;
}

function toApiUploadUrl(pathname: string, search = ""): string {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${getApiOrigin()}${path}${search}`;
}

/**
 * Turn API upload paths (`/uploads/...`) into absolute URLs for React Native Image.
 * Rewrites stale marketing-site or localhost hosts to the configured API origin.
 */
export function resolveUploadAssetUrl(url?: string | null): string {
  if (!url?.trim()) return "";
  let raw = url.trim();
  if (raw.startsWith("//")) raw = `https:${raw}`;

  if (/^https?:\/\//i.test(raw)) {
    try {
      const parsed = new URL(raw);
      const uploadPath = uploadsPathname(parsed.pathname);
      if (uploadPath) {
        return toApiUploadUrl(uploadPath, parsed.search);
      }
    } catch {
      return raw;
    }
    return raw;
  }

  const bare = raw.replace(/^\/+/, "");
  if (bare.startsWith("uploads/")) {
    return toApiUploadUrl(`/${bare}`);
  }

  const origin = getApiOrigin();
  const path = raw.startsWith("/") ? raw : `/${raw}`;
  return `${origin}${path}`;
}
