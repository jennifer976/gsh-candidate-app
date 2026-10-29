import type { AppLanguage } from "./i18n/catalog";
import {
  getProfileCompletion,
  PROFILE_COMPLETION_FIELDS,
} from "./profileCompletion";

/** Legacy shape — maps onto the website's 19 readiness fields. */
export const CANDIDATE_COMPLETION_FIELDS = PROFILE_COMPLETION_FIELDS.map((field) => ({
  path: field.key,
  label: field.label,
  message: field.key,
  onboardingStep: field.onboardingStep,
}));

/** Missing profile information, not a hiring score or a visa assessment. */
export function getCandidateCompletionBreakdown(
  profile: Record<string, unknown> | undefined,
  _locale: AppLanguage = "en",
) {
  const result = getProfileCompletion(profile);
  return {
    percent: result.percent,
    missing: result.missing.map((item) => ({
      path: item.key,
      label: item.label,
      filled: false as const,
      onboardingStep: item.onboardingStep,
    })),
    filledCount: result.filledCount,
    total: result.total,
  };
}
