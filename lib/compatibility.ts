import type { CompatibilityResult, CompatibilityStatus } from "@/types/mobility";
import type { Job } from "@/types/models";

export const COMPATIBILITY_BATCH_MAX = 20;
export const COMPATIBILITY_LABELS: Record<CompatibilityStatus, string> = {
  compatible: "Compatible signals",
  potentially_compatible: "Potentially compatible",
  more_information_needed: "More information needed",
  incompatible: "Some signals do not align",
};
const REASONS: Record<string, string> = {
  CONFIRMED_UNEXPIRED_AUTHORIZATION: "Your confirmed work authorization aligns with this job country.",
  CONFIRMED_AUTHORIZATION_NOT_FOUND: "No confirmed work authorization was found for this job country.",
  AUTHORIZATION_MAY_REQUIRE_SPONSORSHIP_ROUTE: "A suitable employer-sponsored authorization route may be needed.",
  AUTHORIZATION_ABSENT_AND_SPONSORSHIP_UNAVAILABLE: "No matching authorization is recorded and sponsorship is unavailable.",
  SPONSORSHIP_NOT_REQUIRED: "Your profile indicates that sponsorship is not required.",
  SPONSORSHIP_REQUIREMENT_UNKNOWN: "Add whether you require employer sponsorship.",
  SPONSORSHIP_EXPLICITLY_UNAVAILABLE: "The employer says sponsorship is unavailable.",
  SPONSORSHIP_CONFIRMED_POTENTIAL_ONLY: "The employer reports sponsorship capability, subject to individual review.",
  SPONSORSHIP_CASE_BY_CASE: "The employer considers sponsorship case by case.",
  SPONSOR_REGISTER_NOT_ELIGIBILITY_PROOF: "Sponsor status does not prove individual immigration eligibility.",
  OCCUPATION_VERSION_NOT_COMPARABLE: "The role records use different or unknown catalogue editions. This needs review before comparison.",
  CANONICAL_OCCUPATION_NOT_COMPARABLE: "This job does not yet have a comparable occupation code.",
  CANDIDATE_OCCUPATION_NOT_COMPARABLE: "Your desired occupation is free text and cannot yet be code-matched.",
  REQUIRED_REGISTRATION_ACTIVE: "Your recorded professional registration is active.",
  REQUIRED_REGISTRATION_UNCONFIRMED: "A required registration is not confirmed in your profile.",
  EMPLOYMENT_OPTION_INTERSECTION: "At least one employment option matches.",
  EMPLOYMENT_OPTIONS_MISSING: "Employment options are missing from the job or your profile.",
  EMPLOYMENT_OPTIONS_DISJOINT: "The role setup does not match your selected employment options.",
  CANDIDATE_EXPERIENCE_MISSING: "Add your years of experience.",
  EXPERIENCE_WITHIN_BOUNDS: "Your recorded experience is within the stated range.",
  EXPERIENCE_OUTSIDE_BOUNDS: "Your recorded experience is outside the stated range.",
  SALARY_NOT_COMPARABLE: "Add a complete salary range with matching currency and period.",
  SALARY_RANGES_OVERLAP: "Your expected range overlaps the job range.",
  SALARY_RANGES_DO_NOT_OVERLAP: "Your expected range does not overlap the job range.",
  ALREADY_ALIGNED_TO_JOB_COUNTRY: "Your residence or work authorization aligns with the job country.",
  EXPLICIT_RELOCATION_OR_TARGET_INTEREST: "The job country matches your relocation interest.",
  JOB_COUNTRY_NOT_TARGETED: "The job country is outside your selected targets.",
  RELOCATION_INTENT_UNKNOWN: "Add relocation willingness and target countries.",
};
export const compatibilityReason = (code: string) =>
  REASONS[code] || `${code.toLowerCase().replaceAll("_", " ").replace(/^\w/, (c) => c.toUpperCase())}.`;

export function directJobIds(jobs: Job[]): string[] {
  return jobs
    .filter((job) => job.listingKind !== "employer_connected" && job.listingKind !== "curated_external" && !job.externalListingId)
    .map((job) => job._id).filter(Boolean).slice(0, COMPATIBILITY_BATCH_MAX);
}
const rank: Record<CompatibilityStatus, number> = {
  compatible: 0, potentially_compatible: 1, more_information_needed: 2, incompatible: 3,
};
export function compatibilityFirst(jobs: Job[], results: Record<string, CompatibilityResult>): Job[] {
  return [...jobs].sort((a, b) => {
    const ar = results[a._id];
    const br = results[b._id];
    if (ar && br) return rank[ar.status] - rank[br.status];
    if (ar) return -1;
    if (br) return 1;
    return 0;
  });
}
