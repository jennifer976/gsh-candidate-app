import type { Router } from "expo-router";
import { getMarketingSiteUrl } from "@/lib/config";
import { openExternalUrlInApp } from "@/lib/openMarketingBrowser";
import { resolvePublicRoute } from "@/lib/public-route-parity";

/**
 * Routes notification `link` payloads into in-app screens when possible; other https links open in the in-app WebView sheet.
 */
/** Profile reminders and “update your profile” links should open the in-app profile, not the website sign-in. */
function profileUpdateRoute(link: string): string | null {
  let url: URL;
  try {
    url = /^https?:\/\//i.test(link)
      ? new URL(link)
      : new URL(link.startsWith("/") ? link : `/${link}`, getMarketingSiteUrl());
  } catch {
    return null;
  }
  const next = [
    url.searchParams.get("callbackUrl"),
    url.searchParams.get("redirect"),
    url.searchParams.get("returnTo"),
    url.searchParams.get("next"),
    url.pathname,
  ]
    .filter((value): value is string => Boolean(value))
    .join(" ");
  if (/\/candidate\/profile(?:\/edit)?/i.test(next) || /\/auth\/login/i.test(url.pathname) && /profile/i.test(next)) {
    return "/(tabs)/profile";
  }
  return null;
}

export function navigateFromPushLink(router: Router, link: string): boolean {
  if (!isGovernedPushLink(link)) return false;
  const profileRoute = profileUpdateRoute(link);
  if (profileRoute) {
    router.push(profileRoute as never);
    return true;
  }
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
