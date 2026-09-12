import type { Router } from "expo-router";
import { resolveJobsCountryHubPath } from "@/lib/guides/countryHubInApp";
import { resolvePublicRoute } from "@/lib/public-route-parity";
import { openExternalUrlInApp } from "@/lib/openMarketingBrowser";

/** Preserve the intended destination, including the country on job searches. */
export function navigateGuideLink(router: Router, href: string): void {
  const path = href.trim().split("#")[0];
  const base = path.split("?")[0] || path;
  if (base === "/jobs") {
    const query = new URLSearchParams(path.split("?")[1] ?? "");
    const params = { location: query.get("location") || "", benefit: query.get("benefit") || "", workMode: query.get("workMode") || "" };
    router.push({pathname: "/(tabs)/jobs", params}); return;
  }
  if (base === "/specialists" || base.startsWith("/partners")) { router.push("/partners"); return; }
  if (base === "/relocation-perks") { router.push("/relocation-perks"); return; }
  if (base === "/companies") { router.push("/companies"); return; }
  const hub = resolveJobsCountryHubPath(base);
  if (hub?.kind === "appGuide") { router.push(`/guides/country/${hub.slug}`); return; }
  const target = resolvePublicRoute(href);
  if (target?.kind === "native") router.push(target.route);
  else if (target?.kind === "fallback") openExternalUrlInApp(target.url);
}
