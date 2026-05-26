import type { ExpertInsightsFormatSlug } from "./types";

export function expertInsightFormatLabel(format: ExpertInsightsFormatSlug): string {
  if (format === "video") return "Video";
  if (format === "podcast") return "Podcast";
  return "Article";
}
