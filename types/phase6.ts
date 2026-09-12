import { RELOCATION_NEEDS } from "@/lib/relocationServices";
export type RelocationNeed = (typeof RELOCATION_NEEDS)[number];
export type RelocationStage = "planning" | "moving_without_job" | "application" | "interview" | "offer" | "hired" | "relocating";
export type RelocationTiming = "within_30_days" | "within_90_days" | "within_6_months" | "later" | "unknown";
export type RelocationStatus = "submitted" | "matching" | "matched" | "withdrawn" | "closed";

export interface RelocationHelpInput {
  destinationCountry: string;
  originCountry?: string;
  needCategories: RelocationNeed[];
  journeyStage: RelocationStage;
  timing: RelocationTiming;
  notes?: string;
  contactConsent: true;
  providerSharingConsent: true;
}
export interface RelocationHelpRequest extends Omit<RelocationHelpInput, "contactConsent" | "providerSharingConsent"> {
  _id: string;
  requesterRole: "candidate" | "employer";
  contactConsent: boolean;
  providerSharingConsent: boolean;
  consentPolicyVersion: "relocation-help-2026-08";
  consentCapturedAt: string;
  consentWithdrawnAt: string | null;
  status: RelocationStatus;
  submittedAt: string;
  matchedAt: string | null;
  withdrawnAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type IntroductionStatus =
  | "proposed" | "consent_pending" | "consented" | "introduced"
  | "declined" | "withdrawn" | "closed";
export interface CandidateAgencyIntroduction {
  id: string;
  status: IntroductionStatus;
  matchReasons: string[];
  candidateConsentedAt: string | null;
  candidateDeclinedAt: string | null;
  createdAt: string;
  updatedAt: string;
  agency: { name: string; country: string | null };
  request: {
    id: string;
    title: string;
    roleSummary: string;
    destinationCountry: string;
    occupationFamilies: string[];
    requiredSkills: string[];
    experienceBand: string | null;
  };
}
export interface Phase6Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}
