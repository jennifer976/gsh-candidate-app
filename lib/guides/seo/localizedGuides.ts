import catalog from "@/data/localizedGuides.json";
import type { SeoPillarPageConfig } from "./seoPillarTypes";
/** Only complete article translations are registered here. Unknown articles retain their source. */
export function getLocalizedGuide(path: string, locale: string): SeoPillarPageConfig | undefined {
  const entry = (catalog as Record<string, Record<string, SeoPillarPageConfig>>)[path];
  return entry?.[locale] ?? entry?.en;
}
export function hasGuideTranslation(path: string, locale: string): boolean {
  return Boolean((catalog as Record<string, Record<string, unknown>>)[path]?.[locale]);
}
