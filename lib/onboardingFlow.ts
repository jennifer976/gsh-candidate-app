/** Sign-up asks these seven steps only, in this order. */
export const SIGNUP_STEPS = [2, 3, 4, 6, 8, 9, 10] as const;
export const OPTIONAL_STEPS = [1, 5, 7, 11, 12, 13] as const;

export type SignupStep = (typeof SIGNUP_STEPS)[number];
export type OptionalStep = (typeof OPTIONAL_STEPS)[number];
export type OnboardingStep = SignupStep | OptionalStep;
export type OnboardingFrom = "home" | "profile" | "messages";

/**
 * 19-field order → onboarding step. Email has no step (comes from sign-up).
 * Kept here (plain data, no RN) so Node tests can load this file without path aliases.
 */
const COMPLETION_FIELD_STEPS: ReadonlyArray<{
  key: string;
  label: string;
  onboardingStep: number | null;
}> = [
  { key: "firstName", label: "First name", onboardingStep: 1 },
  { key: "lastName", label: "Last name", onboardingStep: 1 },
  { key: "email", label: "Email", onboardingStep: null },
  { key: "location", label: "Current location", onboardingStep: 2 },
  { key: "nationality", label: "Nationality or citizenship", onboardingStep: 2 },
  { key: "currentJobTitle", label: "Current or most recent role", onboardingStep: 6 },
  { key: "yearsOfExperience", label: "Years of experience", onboardingStep: 6 },
  { key: "skills", label: "Skills", onboardingStep: 7 },
  { key: "primaryIndustry", label: "Primary industry", onboardingStep: 7 },
  { key: "jobPreferences", label: "Job preferences", onboardingStep: 8 },
  { key: "resume", label: "CV", onboardingStep: 11 },
  { key: "sponsorshipStatus", label: "Sponsorship status", onboardingStep: 3 },
  { key: "noticePeriod", label: "Notice period", onboardingStep: 9 },
  { key: "jobSearchIntent", label: "Job-search intent", onboardingStep: 9 },
  { key: "relocationReadiness", label: "Relocation readiness", onboardingStep: 4 },
  { key: "targetCountries", label: "Target country or countries", onboardingStep: 4 },
  { key: "careerSummary", label: "Career summary", onboardingStep: 11 },
  { key: "workExperience", label: "Work experience", onboardingStep: 12 },
  { key: "education", label: "Education or qualifications", onboardingStep: 12 },
];

export function signupPosition(step: number): number | null {
  const index = SIGNUP_STEPS.indexOf(step as SignupStep);
  return index === -1 ? null : index + 1;
}

export function progressLabel(step: number): string | null {
  const pos = signupPosition(step);
  return pos == null ? null : `${pos} of 7`;
}

export function nextSignupStep(step: number): number | null {
  const pos = signupPosition(step);
  if (pos == null) return null;
  if (pos >= SIGNUP_STEPS.length) return null;
  return SIGNUP_STEPS[pos] ?? null;
}

export function isLastSignupStep(step: number): boolean {
  return step === 10;
}

export function editRoute(
  step: number,
  from: OnboardingFrom,
): { pathname: "/onboarding/[step]"; params: { step: string; mode: "edit"; from: OnboardingFrom } } {
  return {
    pathname: "/onboarding/[step]",
    params: {
      step: String(step),
      mode: "edit",
      from,
    },
  };
}

export function signupRoute(
  step: number,
): { pathname: "/onboarding/[step]"; params: { step: string; mode: "signup" } } {
  return {
    pathname: "/onboarding/[step]",
    params: {
      step: String(step),
      mode: "signup",
    },
  };
}

/**
 * First missing field's onboarding step in the 19-field order.
 * Accepts field labels or keys. Skips Email (no step).
 */
export function firstMissingStep(
  missingFields: Array<string | { label?: string; key?: string; path?: string }>,
): number | null {
  if (!missingFields?.length) return null;

  const needles = missingFields.map((item) => {
    if (typeof item === "string") return item.trim().toLowerCase();
    return String(item.label || item.key || item.path || "")
      .trim()
      .toLowerCase();
  });

  for (const field of COMPLETION_FIELD_STEPS) {
    if (field.key === "email" || field.onboardingStep == null) continue;
    const label = field.label.toLowerCase();
    const key = field.key.toLowerCase();
    if (needles.includes(label) || needles.includes(key)) {
      return field.onboardingStep;
    }
  }
  return null;
}
