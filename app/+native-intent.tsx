import { resolvePublicRoute } from "@/lib/public-route-parity";

/**
 * Rewrites HTTPS universal/app links before Expo Router resolves a filesystem
 * route. This keeps cold-start links aligned with notification navigation.
 */
export function redirectSystemPath({ path }: { path: string; initial: boolean }): string {
  const resolution = resolvePublicRoute(path);
  if (!resolution) return path;
  return resolution.kind === "native"
    ? resolution.route
    : `/web-fallback?url=${encodeURIComponent(resolution.url)}`;
}
