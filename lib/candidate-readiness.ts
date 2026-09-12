import { canonicalCountryCode } from "./countries";

export type CandidateReadinessKey = "account" | "discovery" | "compatibility" | "application";
export type CandidateReadinessStatus = "ready" | "needs_action" | "off";

export type CandidateReadinessDimension = {
  key: CandidateReadinessKey;
  label: string;
  status: CandidateReadinessStatus;
  percent: number;
  missing: string[];
};

const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");
const list = (value: unknown) => (Array.isArray(value) ? value : []);
const percent = (filled: number, total: number) => Math.round((Math.max(0, filled) / Math.max(1, total)) * 100);

export function missingCandidateApplyBasics(profile?: Record<string, unknown> | null): string[] {
  if (!profile) return ["Complete your candidate profile"];
  const missing: string[] = [];
  if (!text(profile.firstName) || !text(profile.lastName)) missing.push("Add your first and last name");
  const hasLocation =
    Boolean(text(profile.location)) ||
    Boolean(text(profile.preferred_job_location)) ||
    list(profile.targetCountries).length > 0;
  if (!hasLocation) missing.push("Add your location or target countries");
  const hasExperience =
    (typeof profile.yearsOfExperience === "number" && profile.yearsOfExperience >= 0) ||
    Boolean(text(profile.currentJobTitle)) ||
    list(profile.skills).length > 0;
  if (!hasExperience) missing.push("Add a job title, experience, or skills");
  if (!text(profile.resume)) missing.push("Upload your CV");
  return missing;
}

export function computeCandidateReadiness(
  profile?: Record<string, unknown> | null,
  accountEmail?: string,
): Record<CandidateReadinessKey, CandidateReadinessDimension> {
  const p = profile ?? {};
  const accountChecks = [
    [Boolean(text(p.firstName)), "Add your first name"],
    [Boolean(text(p.lastName)), "Add your last name"],
    [Boolean(text(p.email) || text(accountEmail)), "Confirm your account email"],
    [Boolean(text(p.location)), "Add your current location"],
  ] as const;
  const accountMissing = accountChecks.filter(([filled]) => !filled).map(([, label]) => label);

  const discoveryConsent =
    (p.employerDiscoveryConsent as { enabled?: unknown } | undefined)?.enabled === true;
  const distributionEnabled = p.talent_pool_visible !== false;
  const discoveryChecks = [
    [Boolean(text(p.currentJobTitle)) || list(p.desiredOccupations).length > 0, "Add the work you want"],
    [list(p.skills).length > 0, "Add skills employers can search"],
    [Boolean(text(p.careerSummary)), "Add a short career summary"],
    [distributionEnabled, "Resume employer-search distribution"],
    [discoveryConsent, "Turn on employer discovery if you want to be found"],
  ] as const;
  const discoveryMissing = discoveryChecks.filter(([filled]) => !filled).map(([, label]) => label);

  const backendPercent =
    typeof p.mobilityProfileCompletion === "number" && Number.isFinite(p.mobilityProfileCompletion)
      ? Math.max(0, Math.min(100, p.mobilityProfileCompletion))
      : null;
  const compatibilityChecks = [
    [Boolean(canonicalCountryCode(p.currentResidenceCountry)), "Add where you live now"],
    [list(p.desiredOccupations).length > 0, "Add desired occupations"],
    [list(p.employmentOptions).length > 0, "Choose employment options"],
    [Boolean(text(p.sponsorshipStatus)), "Confirm sponsorship needs"],
    [Boolean(text(p.relocationReadiness)), "Confirm relocation readiness"],
    [Boolean(text(p.availability)), "Add your availability"],
    [typeof p.expectedMinSalary === "number", "Add a minimum salary"],
    [typeof p.expectedMaxSalary === "number", "Add a maximum salary"],
  ] as const;
  const compatibilityMissing = compatibilityChecks.filter(([filled]) => !filled).map(([, label]) => label);

  const applicationMissing = missingCandidateApplyBasics(p);
  return {
    account: {
      key: "account",
      label: "Account",
      status: accountMissing.length ? "needs_action" : "ready",
      percent: percent(accountChecks.length - accountMissing.length, accountChecks.length),
      missing: accountMissing,
    },
    discovery: {
      key: "discovery",
      label: "Employer discovery",
      status: !discoveryConsent ? "off" : discoveryMissing.length ? "needs_action" : "ready",
      percent: percent(discoveryChecks.length - discoveryMissing.length, discoveryChecks.length),
      missing: discoveryMissing,
    },
    compatibility: {
      key: "compatibility",
      label: "Role compatibility",
      status: compatibilityMissing.length || (backendPercent != null && backendPercent < 100) ? "needs_action" : "ready",
      percent: backendPercent ?? percent(compatibilityChecks.length - compatibilityMissing.length, compatibilityChecks.length),
      missing: compatibilityMissing,
    },
    application: {
      key: "application",
      label: "Applications",
      status: applicationMissing.length ? "needs_action" : "ready",
      percent: percent(4 - applicationMissing.length, 4),
      missing: applicationMissing,
    },
  };
}

export type CandidateEmployerPreview = {
  displayName: string;
  headline?: string;
  careerSummary?: string;
  experience?: string;
  skills: string[];
  targetCountries: string[];
  sponsorship?: string;
  registrations: string[];
  discoveryEnabled: boolean;
};

/**
 * Candidate-controlled employer preview. Contact details, citizenship,
 * CV URLs, and registration numbers are intentionally never returned.
 */
export function buildCandidateEmployerPreview(
  profile?: Record<string, unknown> | null,
): CandidateEmployerPreview {
  const p = profile ?? {};
  const first = text(p.firstName) || "Candidate";
  const initial = text(p.lastName).charAt(0);
  const registrations = list(p.professionalRegistrations).map((raw) => {
    const row = (raw ?? {}) as Record<string, unknown>;
    return [text(row.registrationType), canonicalCountryCode(row.country), text(row.status).replaceAll("_", " ")]
      .filter(Boolean)
      .join(" · ");
  }).filter(Boolean);
  return {
    displayName: initial ? `${first} ${initial}.` : first,
    ...(text(p.currentJobTitle) ? { headline: text(p.currentJobTitle) } : {}),
    ...(text(p.careerSummary) ? { careerSummary: text(p.careerSummary) } : {}),
    ...(typeof p.yearsOfExperience === "number"
      ? { experience: `${p.yearsOfExperience} ${p.yearsOfExperience === 1 ? "year" : "years"} of experience` }
      : {}),
    skills: list(p.skills).filter((item): item is string => typeof item === "string" && Boolean(item.trim())).slice(0, 12),
    targetCountries: list(p.targetCountries)
      .map(canonicalCountryCode)
      .filter((item): item is string => Boolean(item)),
    ...(text(p.sponsorshipStatus) ? { sponsorship: text(p.sponsorshipStatus) } : {}),
    registrations,
    discoveryEnabled:
      p.talent_pool_visible !== false &&
      (p.employerDiscoveryConsent as { enabled?: unknown } | undefined)?.enabled === true,
  };
}
