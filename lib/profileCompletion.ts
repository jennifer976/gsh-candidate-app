/**
 * Website candidate readiness list (19 fields).
 * `onboardingStep` jumps "Still to add" into the matching onboarding step (1–13).
 */
export const PROFILE_COMPLETION_FIELDS = [
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
] as const;

export type ProfileCompletionKey = (typeof PROFILE_COMPLETION_FIELDS)[number]["key"];

const text = (value: unknown) =>
  typeof value === "string" && Boolean(value.trim());
const list = (value: unknown) =>
  Array.isArray(value) &&
  value.some((item) => (typeof item === "string" ? text(item) : item != null));

function hasResume(p: Record<string, unknown>): boolean {
  return (
    text(p.resume) ||
    text(p.resumeUrl) ||
    text((p.resume as { url?: string } | undefined)?.url) ||
    Boolean(p.hasResume)
  );
}

function filledChecks(p: Record<string, unknown>): Record<ProfileCompletionKey, boolean> {
  const industry = p.industryExperience as
    | { primary?: string; secondary?: string[] }
    | undefined;
  const remote =
    ["remote", "remote or hybrid"].includes(
      String(p.remoteWorkPreference || "")
        .trim()
        .toLowerCase(),
    ) ||
    String(p.relocationReadiness || "").toLowerCase() === "remote-first only";

  return {
    firstName: text(p.firstName),
    lastName: text(p.lastName),
    email:
      text(p.email) ||
      text((p.userId as { email?: unknown } | undefined)?.email),
    location: text(p.location) || text(p.currentResidenceCountry),
    nationality: text(p.nationality) || list(p.citizenshipCountries),
    currentJobTitle: text(p.currentJobTitle),
    yearsOfExperience:
      typeof p.yearsOfExperience === "number" &&
      Number.isFinite(p.yearsOfExperience) &&
      p.yearsOfExperience >= 0,
    skills: list(p.skills),
    primaryIndustry: text(industry?.primary) || text(p.industry),
    jobPreferences: list(p.jobPreferences),
    resume: hasResume(p),
    sponsorshipStatus:
      text(p.sponsorshipStatus) || typeof p.requiresVisaSponsorship === "boolean",
    noticePeriod: text(p.noticePeriod),
    jobSearchIntent: text(p.jobSearchIntent),
    relocationReadiness: text(p.relocationReadiness),
    targetCountries: list(p.targetCountries) || remote,
    careerSummary: text(p.careerSummary),
    workExperience: list(p.workHistory) || list(p.workExperience),
    education:
      list(p.educationHistory) ||
      list(p.education) ||
      list(p.qualifications),
  };
}

export function getProfileCompletion(profile: Record<string, unknown> | undefined) {
  const p = profile ?? {};
  const checks = filledChecks(p);
  const items = PROFILE_COMPLETION_FIELDS.map((field) => ({
    key: field.key,
    label: field.label,
    onboardingStep: field.onboardingStep,
    filled: checks[field.key],
  }));
  const filledCount = items.filter((item) => item.filled).length;
  const missing = items.filter((item) => !item.filled);
  return {
    total: items.length,
    filledCount,
    percent: Math.round((filledCount / items.length) * 100),
    items,
    missing,
  };
}
