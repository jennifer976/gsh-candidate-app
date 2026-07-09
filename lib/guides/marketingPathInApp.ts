import type { Router } from "expo-router";
import { resolveJobsCountryHubPath } from "@/lib/guides/countryHubInApp";
import { navigateGuideLink } from "@/lib/guides/navigateGuideLink";
import { getPillarPageByPath } from "@/lib/guides/seo/getPillarByPath";

/**
 * Resolves public-site style paths to in-app screens. Does not open the marketing website.
 */
export function navigateMarketingPath(router: Router, rawPath: string): void {
  const noHash = rawPath.trim().split("#")[0] ?? rawPath;
  const path = noHash.split("?")[0] ?? noHash;

  const hub = resolveJobsCountryHubPath(path);
  if (hub) {
    if (hub.kind === "appGuide") {
      router.push(`/guides/country/${hub.slug}`);
    } else {
      router.push("/(tabs)/jobs");
    }
    return;
  }

  if (getPillarPageByPath(path)) {
    router.push({ pathname: "/guides/topic", params: { q: encodeURIComponent(path) } });
    return;
  }

  if (path === "/tools/visa-wizard") {
    router.push("/visa-wizard");
    return;
  }
  if (path === "/tools/visa-checker") {
    router.push("/visa-checker");
    return;
  }
  if (path === "/tools/currency-converter") {
    router.push("/currency-converter");
    return;
  }
  if (path === "/tools/relocation-worksheets") {
    router.push("/relocation-worksheets");
    return;
  }
  if (path === "/compare-countries") {
    router.push("/compare-countries");
    return;
  }

  if (path.startsWith("/jobs") || path.startsWith("/partners")) {
    navigateGuideLink(router, path);
    return;
  }

  router.push("/guides");
}
