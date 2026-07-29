import type { Router } from "expo-router";
import { openExternalUrlInApp } from "@/lib/openMarketingBrowser";
import { resolvePublicRoute } from "@/lib/public-route-parity";

/**
 * Routes notification `link` payloads into in-app screens when possible; other https links open in the in-app WebView sheet.
 */
export function navigateFromPushLink(router: Router, link: string): boolean {
  const resolution = resolvePublicRoute(link);
  if (!resolution) return false;
  if (resolution.kind === "native") router.push(resolution.route as never);
  else openExternalUrlInApp(resolution.url);
  return true;
}
