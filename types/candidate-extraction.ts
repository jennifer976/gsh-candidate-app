export const CANDIDATE_EXTRACTION_CONTRACT_VERSION = "candidate-extraction-2026-08-26.1";

export const CANDIDATE_EXTRACTION_FIELDS = [
  "desiredOccupations",
  "skills",
  "yearsOfExperience",
  "qualifications",
  "professionalRegistrations",
  "workAuthorizations",
  "currentResidenceCountry",
  "targetCountries",
  "employmentOptions",
  "expectedMinSalary",
  "expectedMaxSalary",
  "expectedSalaryCurrency",
  "expectedSalaryPeriod",
  "workHistory",
  "currentJobTitle",
  "currentCompany",
] as const;

export type CandidateExtractionField = (typeof CANDIDATE_EXTRACTION_FIELDS)[number];
export type CandidateExtractionStatusReason =
  | "configured"
  | "disabled"
  | "provider_not_selected"
  | "missing_api_key"
  | "missing_model"
  | "data_use_contract_not_confirmed";

export interface CandidateExtractionCapability {
  available: boolean;
  provider: "openai" | "none";
  reason: CandidateExtractionStatusReason;
  noTrainingContractConfigured: boolean;
  contractVersion: string;
  retentionHours: number;
  dailyLimit: number;
  localFallback: false;
  automaticProfileWrites: false;
  immigrationEligibilityAssessment: false;
  providerTrainingUse: "contractually_disabled" | "not_asserted";
}

export interface CandidateExtractionSuggestion {
  id: string;
  field: CandidateExtractionField;
  value: unknown;
  confidence: number;
  sourceSnippet: string;
}

export interface CandidateExtractionDraft {
  id: string;
  status: "completed" | "reviewed";
  sourceKind: "resume";
  suggestions: CandidateExtractionSuggestion[];
  acceptedSuggestionIds: string[];
  rejectedSuggestionIds: string[];
  contractVersion: string;
  createdAt: string;
  expiresAt: string;
  reviewedAt: string | null;
  notice: string;
}

export interface CandidateExtractionReviewResponse {
  draft: CandidateExtractionDraft;
  acceptedFields: CandidateExtractionField[];
}
