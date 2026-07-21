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

/** Shared plain-language labels (same as web FE for all users). */
const CATEGORY_LABELS: Record<string, string> = {
  global_mobility: "Moving & settling",
  travel_accommodation: "Travel & stay",
  finance_payments: "Money & banking",
  wellbeing_benefits: "Insurance & wellbeing",
  communication_collaboration: "Phones & internet",
  learning_development: "Learning",
  hr_recruitment: "Hiring & careers",
  operations: "Work tools",
  business_services: "Other services",
  security_compliance: "Security",
  marketing_sales: "Marketing",
  ai_automation: "AI tools",
};

/** Main browse order, then secondary/legacy. */
export const CANDIDATE_PERK_CATEGORY_ORDER = [
  "global_mobility",
  "travel_accommodation",
  "finance_payments",
  "wellbeing_benefits",
  "communication_collaboration",
  "learning_development",
  "hr_recruitment",
  "operations",
  "business_services",
  "security_compliance",
  "marketing_sales",
  "ai_automation",
] as const;

export function normalizePerkCategory(value?: string | null): string {
  const raw = String(value || "").trim();
  if (!raw) return "global_mobility";
  if (CATEGORY_LABELS[raw]) return raw;
  return LEGACY_CATEGORY_MAP[raw] || raw;
}

export function candidatePerkCategoryLabel(value?: string | null): string {
  const key = normalizePerkCategory(value);
  return CATEGORY_LABELS[key] || key.replace(/_/g, " ") || "Perk";
}
