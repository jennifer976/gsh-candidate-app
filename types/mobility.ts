export const EMPLOYMENT_OPTIONS = [
  "on_site",
  "hybrid",
  "remote_domestic",
  "remote_cross_border",
  "relocation",
  "employer_of_record",
  "local_entity",
] as const;
export type EmploymentOption = (typeof EMPLOYMENT_OPTIONS)[number];
export const CANDIDATE_AVAILABILITY_OPTIONS = [
  "Available immediately",
  "Available this month",
  "Available in 1-3 months",
  "Available in 3+ months",
  "Flexible",
] as const;
export type CandidateAvailability =
  (typeof CANDIDATE_AVAILABILITY_OPTIONS)[number];

export type CompatibilityStatus =
  | "compatible"
  | "potentially_compatible"
  | "more_information_needed"
  | "incompatible";
export type WorkAuthorizationStatus =
  | "confirmed"
  | "pending"
  | "expired"
  | "unknown";
export type ProfessionalRegistrationStatus =
  | "active"
  | "pending"
  | "expired"
  | "not_held"
  | "unknown";

export interface OccupationIdentifier {
  scheme: string;
  code?: string;
  label: string;
  schemeVersion?: string;
}
export interface WorkAuthorization {
  country: string;
  authorizationType?: string;
  status: WorkAuthorizationStatus;
  expiresAt?: string;
}
export interface Qualification {
  name: string;
  issuer?: string;
  country?: string;
  level?: string;
  awardedAt?: string;
  expiresAt?: string;
}
export interface ProfessionalRegistration {
  country: string;
  authority?: string;
  registrationType: string;
  registrationNumber?: string;
  status: ProfessionalRegistrationStatus;
  expiresAt?: string;
}
export interface CompatibilityComponentResult {
  component: string;
  status: CompatibilityStatus;
  reasonCodes: string[];
  missingInputs: string[];
  factIds: string[];
}
export interface CompatibilityResult {
  status: CompatibilityStatus;
  components: CompatibilityComponentResult[];
  rulesetVersion: string;
  profileVersion: number | null;
  evaluatedAt: string;
  missingInputs: string[];
  factIds: string[];
  disclaimer: string;
}
export interface CandidateMobilityProfile {
  mobilityProfileVersion: 1;
  currentResidenceCountry: string;
  citizenshipCountries: string[];
  desiredOccupations: OccupationIdentifier[];
  workAuthorizations: WorkAuthorization[];
  qualifications: Qualification[];
  professionalRegistrations: ProfessionalRegistration[];
  employmentOptions: EmploymentOption[];
  targetCountries: string[];
  sponsorshipStatus: string;
  requiresVisaSponsorship: boolean;
  relocationReadiness: string;
  willingToRelocate: boolean;
  availability: CandidateAvailability | "";
  expectedMinSalary: number | null;
  expectedMaxSalary: number | null;
  expectedSalaryCurrency: string;
  expectedSalaryPeriod: "year" | "month";
  employerDiscoveryConsentEnabled: boolean;
  agencyDiscoveryConsentEnabled: boolean;
  employerMessagingConsentEnabled: boolean;
  agencyMessagingConsentEnabled: boolean;
}
export interface MobilityReadiness {
  mobilityProfileCompletion?: number;
  compatibilityReadiness?: "ready" | "partially_ready" | "needs_information";
  mobilityProfileMissingPaths?: string[];
}
