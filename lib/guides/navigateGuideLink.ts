import type { Router } from "expo-router";

/**
 * Maps partner/job paths into in-app routes. Never opens the marketing website.
 */
export function navigateGuideLink(router: Router, href: string): void {
  const path = href.trim().split("#")[0];
  const base = path.split("?")[0] || path;

  if (base === "/partners" || base === "/partners/" || base.startsWith("/partners/")) {
    router.push("/partners");
    return;
  }
  if (base === "/jobs" || base === "/jobs/" || base.startsWith("/jobs")) {
    router.push("/(tabs)");
    return;
  }

  router.push("/(tabs)");
}
