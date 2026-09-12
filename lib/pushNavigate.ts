import type { Router } from "expo-router";
import { getMarketingSiteUrl } from "@/lib/config";
import { openExternalUrlInApp } from "@/lib/openMarketingBrowser";
import { resolvePublicRoute } from "@/lib/public-route-parity";

/**
 * Routes notification `link` payloads into in-app screens when possible; other https links open in the in-app WebView sheet.
 */
export function navigateFromPushLink(router: Router, link: string): boolean {
  if (!isGovernedPushLink(link)) return false;
  const resolution = resolvePublicRoute(link);
  if (!resolution) return false;
  if (resolution.kind === "native") router.push(resolution.route as never);
  else openExternalUrlInApp(resolution.url);
  return true;
}

export function isGovernedPushLink(link: string): boolean {
  const value = link.trim();
  if (!value || value.startsWith("//") || value.includes("\\")) return false;
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  if (/^gsh-candidate:\/\//i.test(value)) return true;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) return false;
    const expected = new URL(getMarketingSiteUrl()).hostname.replace(/^www\./, "").toLowerCase();
    return url.hostname.replace(/^www\./, "").toLowerCase() === expected;
  } catch {
    return false;
  }
}
