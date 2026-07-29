export const CANDIDATE_COMPLETION_FIELDS = [
  { path: "firstName", label: "First name" },
  { path: "lastName", label: "Last name" },
  { path: "email", label: "Email" },
  { path: "location", label: "Current location" },
  { path: "nationality", label: "Nationality / citizenship" },
  { path: "currentJobTitle", label: "Current or most recent role" },
  { path: "yearsOfExperience", label: "Years of experience" },
  { path: "skills", label: "Skills" },
  { path: "industryExperience.primary", label: "Primary industry" },
  { path: "jobPreferences", label: "Job preferences" },
  { path: "resume", label: "CV / resume" },
  { path: "sponsorshipStatus", label: "Sponsorship status" },
  { path: "noticePeriod", label: "Notice period" },
  { path: "jobSearchIntent", label: "Job-search intent" },
  { path: "relocationReadiness", label: "Relocation readiness" },
  { path: "targetCountries", label: "Target country or countries" },
  { path: "careerSummary", label: "Career summary" },
  { path: "workHistory", label: "Work experience" },
  { path: "educationHistory", label: "Education / qualifications" },
] as const;

function readPath(source: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((value, key) => {
    if (value == null || typeof value !== "object") return undefined;
    return (value as Record<string, unknown>)[key];
  }, source);
}

function isFilled(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return Number.isFinite(value);
  if (Array.isArray(value)) return value.length > 0;
  return Boolean(value);
}

export function getCandidateCompletionBreakdown(profile: Record<string, unknown> | undefined) {
  const source = profile ?? {};
  const items = CANDIDATE_COMPLETION_FIELDS.map((field) => ({
    ...field,
    filled: isFilled(readPath(source, field.path)),
  }));
  const completed = items.filter((item) => item.filled).length;

  return {
    percent: Math.round((completed / items.length) * 100),
    missing: items.filter((item) => !item.filled),
  };
}
