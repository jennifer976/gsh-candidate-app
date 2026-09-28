import type { Router } from "expo-router";
import { resolveJobsCountryHubPath } from "@/lib/guides/countryHubInApp";
import { guideRoute } from "@/lib/guides/guideRoute";
import { getPillarPageByPath, getRetiredGuideDestination } from "@/lib/guides/seo/getPillarByPath";
import { resolvePublicRoute } from "@/lib/public-route-parity";
import { openExternalUrlInApp } from "@/lib/openMarketingBrowser";

/** Opens a website path in the matching app screen, keeping the country on job searches. */
export function navigateGuideLink(router: Router, href: string): void {
  const path = href.trim().split("#")[0];
  const base = path.split("?")[0] || path;
  const retired = getRetiredGuideDestination(base);
  if (retired) { navigateGuideLink(router, retired); return; }
  if (base === "/jobs") {
    const query = new URLSearchParams(path.split("?")[1] ?? "");
    const params = { location: query.get("location") || "", benefit: query.get("benefit") || "", workMode: query.get("workMode") || "" };
    router.push({pathname: "/(tabs)/jobs", params}); return;
  }
  if (base === "/specialists" || base.startsWith("/partners")) { router.push("/partners"); return; }
  const hub = resolveJobsCountryHubPath(base);
  if (hub) { router.push(hub.kind === "country" ? `/country/${hub.slug}` : "/(tabs)/jobs"); return; }
  if (getPillarPageByPath(base)) { router.push(guideRoute(base)); return; }
  const target = resolvePublicRoute(href);
  if (target?.kind === "native") router.push(target.route as never);
  else if (target?.kind === "fallback") openExternalUrlInApp(target.url);
}
