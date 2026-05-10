/** Keep `seoPillarPages.ts` + `relocationSpokePages.ts` in sync with `global_sponsor_hub-fe/src/data/` when web content changes. */
import { ALL_RELOCATION_GUIDE_PAGES } from "./relocationSpokePages";
import { ALL_SEO_PILLAR_PAGES } from "./seoPillarPages";
import type { SeoPillarPageConfig } from "./seoPillarTypes";

/** Normalize to pathname only (matches `SeoPillarPageConfig.path`). */
export function normalizeGuidePath(href: string): string {
  const noHash = href.trim().split("#")[0] ?? "";
  return noHash.split("?")[0] ?? noHash;
}

/** Full pillar article from the same data as global_sponsor_hub-fe (website guides). */
export function getPillarPageByPath(href: string): SeoPillarPageConfig | undefined {
  const path = normalizeGuidePath(href);
  return ALL_SEO_PILLAR_PAGES.find((p) => p.path === path) ?? ALL_RELOCATION_GUIDE_PAGES.find((p) => p.path === path);
}
