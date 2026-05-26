import type { ExpertInsightsContentKind } from "./types";

export const EXPERT_INSIGHT_KIND_PUBLIC: Record<
  ExpertInsightsContentKind,
  { card: string; filter: string; section: string }
> = {
  brief: { card: "Briefing", filter: "Briefings", section: "Briefings" },
  flagship: { card: "Deep dive", filter: "Deep dives", section: "Deep dives" },
  evergreen: { card: "Pinned guide", filter: "Pinned guides", section: "Start here" },
};

export function expertInsightKindCardLabel(kind: ExpertInsightsContentKind): string {
  return EXPERT_INSIGHT_KIND_PUBLIC[kind].card;
}

export function expertInsightKindFilterLabel(kind: ExpertInsightsContentKind): string {
  return EXPERT_INSIGHT_KIND_PUBLIC[kind].filter;
}
