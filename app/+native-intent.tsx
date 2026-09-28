import { resolvePublicRoute } from "@/lib/public-route-parity";

/**
 * Expo / EAS install pages open the APK with an intent path like
 * `/accounts/.../projects/.../builds/...`. Those are not GSH deep links —
 * treating them as marketing URLs opens the website in-app (404) and forces
 * the user to tap Done before they see login.
 */
function isInstallerOrDevClientPath(path: string): boolean {
  const value = path.trim();
  if (!value) return false;
  return (
    /expo\.dev|exp\.host|expo-development-client|u\.expo\.dev/i.test(value) ||
    /\/accounts\/[^/]+\/projects\//i.test(value) ||
    /\/projects\/[^/]+\/builds\//i.test(value)
  );
}

/**
 * Rewrites HTTPS universal/app links before Expo Router resolves a filesystem
 * route. This keeps cold-start links aligned with notification navigation.
 */
export function redirectSystemPath({
  path,
  initial,
}: {
  path: string;
  initial: boolean;
}): string {
  if (isInstallerOrDevClientPath(path)) {
    return "/";
  }

  const resolution = resolvePublicRoute(path);
  if (!resolution) return path;

  // On cold start, never open the marketing site for unknown paths — only
  // follow explicit native mappings. Otherwise installer leftovers and odd
  // Android intents dump users into a website 404 overlay.
  if (resolution.kind === "fallback") {
    if (initial) return "/";
    return `/web-fallback?url=${encodeURIComponent(resolution.url)}`;
  }

  return resolution.route;
}
