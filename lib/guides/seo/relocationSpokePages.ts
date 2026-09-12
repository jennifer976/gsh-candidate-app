// Generated content comes from the website. See scripts/sync-editorial-guides.cjs.
import catalog from "@/data/editorialGuides.en.json";
import type { SeoPillarPageConfig } from "./seoPillarTypes";
export const ALL_RELOCATION_GUIDE_PAGES: SeoPillarPageConfig[] = catalog.relocation;
export const RELOCATION_GUIDE_SLUGS = ALL_RELOCATION_GUIDE_PAGES.map(p => p.path.split("/").pop()!);
export function getRelocationGuide(slug: string): SeoPillarPageConfig | undefined {
  return ALL_RELOCATION_GUIDE_PAGES.find(p => p.path === `/relocating/${slug}`);
}
