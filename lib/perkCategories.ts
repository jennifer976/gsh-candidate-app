/**
 * Dashboard perk category labels for the candidate app.
 * Keys must stay in sync with web FE `relocationPerks.ts` + backend CATEGORIES.
 */

const LEGACY_CATEGORY_MAP: Record<string, string> = {
  banking_finance: "finance_payments",
  global_hiring: "hr_recruitment",
  relocation: "global_mobility",
  travel_connectivity: "travel_accommodation",
  business_tools: "operations",
  insurance: "wellbeing_benefits",
  housing: "global_mobility",
  moving: "global_mobility",
  banking: "finance_payments",
  travel: "travel_accommodation",
  settlement: "global_mobility",
  other: "business_services",
};

/** Candidate-facing labels (mover language). */
const CANDIDATE_CATEGORY_LABELS: Record<string, string> = {
  travel_accommodation: "Travel & stay",
  finance_payments: "Money & banking",
  global_mobility: "Moving & settling",
  wellbeing_benefits: "Wellbeing",
  communication_collaboration: "Stay connected",
  learning_development: "Learning",
  hr_recruitment: "Hiring & careers",
  business_services: "Business help",
  operations: "Work tools",
  security_compliance: "Security & compliance",
  marketing_sales: "Marketing & sales",
  ai_automation: "AI tools",
};

/** Candidate browse order — mover needs first. */
export const CANDIDATE_PERK_CATEGORY_ORDER = [
  "travel_accommodation",
  "finance_payments",
  "global_mobility",
  "wellbeing_benefits",
  "communication_collaboration",
  "learning_development",
  "hr_recruitment",
  "business_services",
  "operations",
  "security_compliance",
  "marketing_sales",
  "ai_automation",
] as const;

export function normalizePerkCategory(value?: string | null): string {
  const raw = String(value || "").trim();
  if (!raw) return "global_mobility";
  if (CANDIDATE_CATEGORY_LABELS[raw]) return raw;
  return LEGACY_CATEGORY_MAP[raw] || raw;
}

export function candidatePerkCategoryLabel(value?: string | null): string {
  const key = normalizePerkCategory(value);
  return CANDIDATE_CATEGORY_LABELS[key] || key.replace(/_/g, " ") || "Perk";
}
