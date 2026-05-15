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
      router.push("/(tabs)");
    }
    return;
  }

  if (getPillarPageByPath(path)) {
    router.push({ pathname: "/guides/topic", params: { q: encodeURIComponent(path) } });
    return;
  }

  if (path.startsWith("/jobs") || path.startsWith("/partners")) {
    navigateGuideLink(router, path);
    return;
  }

  router.push("/guides");
}
