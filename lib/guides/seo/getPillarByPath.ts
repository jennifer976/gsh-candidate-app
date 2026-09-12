import catalog from "@/data/editorialGuides.en.json";
import { getLocalizedGuide } from "./localizedGuides";
/** English snapshots are generated from the website; complete translations override them. */
import { ALL_RELOCATION_GUIDE_PAGES } from "./relocationSpokePages";
import { ALL_SEO_PILLAR_PAGES } from "./seoPillarPages";
import type { SeoPillarPageConfig } from "./seoPillarTypes";

/** Normalize to pathname only (matches `SeoPillarPageConfig.path`). */
export function normalizeGuidePath(href: string): string {
  const noHash = href.trim().split("#")[0] ?? "";
  return noHash.split("?")[0] ?? noHash;
}

/** Full pillar article from the same data as global_sponsor_hub-fe (website guides). */
export function getPillarPageByPath(href: string, locale = "en"): SeoPillarPageConfig | undefined {
  const path = normalizeGuidePath(href);
  return getLocalizedGuide(path, locale) ?? ALL_SEO_PILLAR_PAGES.find((p) => p.path === path) ?? ALL_RELOCATION_GUIDE_PAGES.find((p) => p.path === path);
}

/** Preserve old app links while using the website's current destinations. */
export function getRetiredGuideDestination(href: string): string | undefined {
  return (catalog.redirects as Record<string, string>)[normalizeGuidePath(href)];
}
