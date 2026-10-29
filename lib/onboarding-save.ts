import {
  commaCountries,
  hydrateMobilityProfile,
  mobilityPayload,
} from "@/lib/candidate-mobility";
import { COMPANY_PLACEHOLDER, SPONSORSHIP_OPTIONS } from "@/lib/onboarding-constants";
import { updateProfile } from "@/lib/api-client";
import { canonicalCountryCode } from "@/lib/countries";
import { parseBudgetCost } from "@/lib/relocationBudget";
import type {
  CandidateMobilityProfile,
  EmploymentOption,
  OccupationIdentifier,
  ProfessionalRegistration,
  Qualification,
  WorkAuthorization,
} from "@/types/mobility";

export type WorkEntry = {
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
};

export type EducationEntry = {
  degree: string;
  school: string;
  year: string;
};

export type LanguageEntry = { language: string; fluency: string };

export type OnboardingFormState = {
  firstName: string;
  lastName: string;
  location: string;
  nationality: string;
  citizenshipCountries: string;
  currentResidenceCountry: string;
  sponsorshipStatus: string;
  currentVisaStatus: string;
  willingToRelocate: boolean;
  targetCountries: string;
  relocationReadiness: string;
  preferredJobLocation: string;
  workAuthorizations: WorkAuthorization[];
  desiredOccupations: OccupationIdentifier[];
  currentJobTitle: string;
  currentCompany: string;
  yearsOfExperience: string;
  primaryIndustry: string;
  secondaryIndustries: string[];
  skills: string[];
  languages: LanguageEntry[];
  employmentOptions: EmploymentOption[];
  remoteWorkPreference: string;
  jobPreferences: string[];
  availability: string;
  noticePeriod: string;
  jobSearchIntent: string;
  salaryMin: string;
  salaryMax: string;
  salaryCurrency: string;
  salaryPeriod: "year" | "month";
  careerSummary: string;
  resumeUrl: string;
  resumeName: string;
  workHistory: WorkEntry[];
  educationHistory: EducationEntry[];
  qualifications: Qualification[];
  professionalRegistrations: ProfessionalRegistration[];
  phoneNumber: string;
  linkedin: string;
  portfolio: string;
  employerDiscovery: boolean;
  employerMessaging: boolean;
  agencyDiscovery: boolean;
  agencyMessaging: boolean;
  hidePhone: boolean;
  hideEmail: boolean;
  hideResume: boolean;
  pauseTalentPool: boolean;
};

export function emptyOnboardingForm(): OnboardingFormState {
  return {
    firstName: "",
    lastName: "",
    location: "",
    nationality: "",
    citizenshipCountries: "",
    currentResidenceCountry: "",
    sponsorshipStatus: "",
    currentVisaStatus: "",
    willingToRelocate: false,
    targetCountries: "",
    relocationReadiness: "",
    preferredJobLocation: "",
    workAuthorizations: [],
    desiredOccupations: [],
    currentJobTitle: "",
    currentCompany: "",
    yearsOfExperience: "",
    primaryIndustry: "",
    secondaryIndustries: [],
    skills: [],
    languages: [],
    employmentOptions: [],
    remoteWorkPreference: "",
    jobPreferences: [],
    availability: "",
    noticePeriod: "",
    jobSearchIntent: "",
    salaryMin: "",
    salaryMax: "",
    salaryCurrency: "USD",
    salaryPeriod: "year",
    careerSummary: "",
    resumeUrl: "",
    resumeName: "",
    workHistory: [],
    educationHistory: [],
    qualifications: [],
    professionalRegistrations: [],
    phoneNumber: "",
    linkedin: "",
    portfolio: "",
    employerDiscovery: false,
    employerMessaging: false,
    agencyDiscovery: false,
    agencyMessaging: false,
    hidePhone: false,
    hideEmail: false,
    hideResume: false,
    pauseTalentPool: false,
  };
}

const text = (value: unknown) => (typeof value === "string" ? value : "");
const strings = (value: unknown) =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];

function nationalityNames(value: string): string {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .join(", ");
}

export function hydrateOnboardingForm(
  profile: Record<string, unknown> | undefined,
): OnboardingFormState {
  const p = profile ?? {};
  const mob = hydrateMobilityProfile(p);
  const industry = p.industryExperience as
    | { primary?: unknown; secondary?: unknown }
    | undefined;
  const workHistory = Array.isArray(p.workHistory)
    ? (p.workHistory as Record<string, unknown>[]).map((row) => ({
        title: text(row.title),
        company: text(row.company),
        startDate: text(row.startDate),
        endDate: text(row.endDate),
        isCurrent: row.isCurrent === true,
      }))
    : [];
  const educationHistory = Array.isArray(p.educationHistory)
    ? (p.educationHistory as Record<string, unknown>[]).map((row) => ({
        degree: text(row.degree),
        school: text(row.school),
        year: text(row.year),
      }))
    : [];
  const languages = Array.isArray(p.languages)
    ? (p.languages as Record<string, unknown>[])
        .filter((row) => typeof row?.language === "string")
        .map((row) => ({
          language: text(row.language),
          fluency: text(row.fluency) || "Basic",
        }))
    : [];

  return {
    ...emptyOnboardingForm(),
    firstName: text(p.firstName),
    lastName: text(p.lastName),
    location: text(p.location),
    nationality: Array.isArray(p.nationality)
      ? strings(p.nationality).join(", ")
      : text(p.nationality),
    citizenshipCountries: mob.citizenshipCountries.join(", "),
    currentResidenceCountry: mob.currentResidenceCountry,
    sponsorshipStatus: mob.sponsorshipStatus,
    currentVisaStatus: text(p.currentVisaStatus),
    willingToRelocate: mob.willingToRelocate,
    targetCountries: mob.targetCountries.join(", "),
    relocationReadiness: mob.relocationReadiness,
    preferredJobLocation: text(p.preferred_job_location),
    workAuthorizations: mob.workAuthorizations,
    desiredOccupations: mob.desiredOccupations,
    currentJobTitle: text(p.currentJobTitle),
    currentCompany:
      text(p.currentCompany) === COMPANY_PLACEHOLDER
        ? ""
        : text(p.currentCompany),
    yearsOfExperience:
      typeof p.yearsOfExperience === "number"
        ? String(p.yearsOfExperience)
        : "",
    primaryIndustry: text(industry?.primary),
    secondaryIndustries: strings(industry?.secondary).slice(0, 2),
    skills: strings(p.skills),
    languages,
    employmentOptions: mob.employmentOptions,
    remoteWorkPreference: text(p.remoteWorkPreference),
    jobPreferences: strings(p.jobPreferences),
    availability: mob.availability || "",
    noticePeriod: text(p.noticePeriod),
    jobSearchIntent: text(p.jobSearchIntent),
    salaryMin:
      mob.expectedMinSalary != null ? String(mob.expectedMinSalary) : "",
    salaryMax:
      mob.expectedMaxSalary != null ? String(mob.expectedMaxSalary) : "",
    salaryCurrency: mob.expectedSalaryCurrency || "USD",
    salaryPeriod: mob.expectedSalaryPeriod,
    careerSummary: text(p.careerSummary),
    resumeUrl: text(p.resume),
    resumeName: text(p.resume).split("/").pop() || "",
    workHistory,
    educationHistory,
    qualifications: mob.qualifications,
    professionalRegistrations: mob.professionalRegistrations,
    phoneNumber: text(p.phoneNumber),
    linkedin: text(p.linkedin_profile),
    portfolio: text(p.portfolio_website),
    employerDiscovery: mob.employerDiscoveryConsentEnabled,
    employerMessaging: mob.employerMessagingConsentEnabled,
    agencyDiscovery: mob.agencyDiscoveryConsentEnabled,
    agencyMessaging: mob.agencyMessagingConsentEnabled,
    hidePhone: p.hide_phone === true,
    hideEmail: p.hide_email === true,
    hideResume: p.hide_resume === true,
    pauseTalentPool: p.talent_pool_visible === false,
  };
}

function mobilityFromForm(form: OnboardingFormState): CandidateMobilityProfile {
  const base = hydrateMobilityProfile({});
  return {
    ...base,
    currentResidenceCountry:
      canonicalCountryCode(form.currentResidenceCountry) ||
      form.currentResidenceCountry,
    citizenshipCountries: commaCountries(form.citizenshipCountries, 50),
    desiredOccupations: form.desiredOccupations.slice(0, 25),
    workAuthorizations: form.workAuthorizations.slice(0, 30),
    qualifications: form.qualifications.slice(0, 30),
    professionalRegistrations: form.professionalRegistrations.slice(0, 30),
    employmentOptions: form.employmentOptions,
    targetCountries: commaCountries(form.targetCountries, 12),
    sponsorshipStatus: form.sponsorshipStatus,
    requiresVisaSponsorship:
      form.sponsorshipStatus === SPONSORSHIP_OPTIONS[0],
    relocationReadiness: form.relocationReadiness,
    willingToRelocate: form.willingToRelocate,
    availability: (form.availability || "") as CandidateMobilityProfile["availability"],
    expectedMinSalary: parseBudgetCost(form.salaryMin) ?? null,
    expectedMaxSalary: parseBudgetCost(form.salaryMax) ?? null,
    expectedSalaryCurrency: form.salaryCurrency,
    expectedSalaryPeriod: form.salaryPeriod,
    employerDiscoveryConsentEnabled: form.employerDiscovery,
    employerMessagingConsentEnabled: form.employerMessaging,
    agencyDiscoveryConsentEnabled: form.agencyDiscovery,
    agencyMessagingConsentEnabled: form.agencyMessaging,
  };
}

/** Build and send the PUT body for one onboarding step. */
export async function saveOnboardingStep(
  step: number,
  form: OnboardingFormState,
): Promise<void> {
  const mob = mobilityFromForm(form);
  let body: Record<string, unknown> = {};

  switch (step) {
    case 1:
      body = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
      };
      break;
    case 2:
      body = {
        ...mobilityPayload({
          ...mob,
          currentResidenceCountry:
            canonicalCountryCode(form.currentResidenceCountry) || "",
          citizenshipCountries: commaCountries(
            form.citizenshipCountries || form.nationality,
            50,
          ),
        }),
        location: form.location.trim(),
        nationality: nationalityNames(
          form.nationality || form.citizenshipCountries,
        ),
      };
      break;
    case 3:
      body = {
        ...mobilityPayload({
          ...mob,
          sponsorshipStatus: form.sponsorshipStatus,
          requiresVisaSponsorship:
            form.sponsorshipStatus === SPONSORSHIP_OPTIONS[0],
        }),
        currentVisaStatus: form.currentVisaStatus,
      };
      break;
    case 4:
      body = {
        ...mobilityPayload({
          ...mob,
          willingToRelocate: form.willingToRelocate,
          targetCountries: commaCountries(form.targetCountries, 12),
          relocationReadiness: form.relocationReadiness,
        }),
        preferred_job_location: form.preferredJobLocation.trim(),
      };
      break;
    case 5:
      body = mobilityPayload({
        ...mob,
        workAuthorizations: form.workAuthorizations,
      });
      break;
    case 6: {
      const years = form.yearsOfExperience.trim();
      const parsed = years === "" ? undefined : Number(years);
      body = {
        ...mobilityPayload({
          ...mob,
          desiredOccupations: form.desiredOccupations.slice(0, 25),
        }),
        currentJobTitle: form.currentJobTitle.trim(),
        currentCompany:
          form.currentCompany.trim() || COMPANY_PLACEHOLDER,
        ...(parsed !== undefined ? { yearsOfExperience: parsed } : {}),
      };
      break;
    }
    case 7:
      body = {
        industryExperience: {
          primary: form.primaryIndustry,
          secondary: form.secondaryIndustries.slice(0, 2),
        },
        skills: form.skills.slice(0, 50),
        languages: form.languages.slice(0, 20),
      };
      break;
    case 8:
      body = {
        ...mobilityPayload({
          ...mob,
          employmentOptions: form.employmentOptions,
        }),
        remoteWorkPreference: form.remoteWorkPreference,
        jobPreferences: form.jobPreferences,
      };
      break;
    case 9:
      body = {
        ...mobilityPayload({
          ...mob,
          availability: (form.availability ||
            "") as CandidateMobilityProfile["availability"],
        }),
        noticePeriod: form.noticePeriod,
        jobSearchIntent: form.jobSearchIntent,
      };
      break;
    case 10: {
      const minimum = parseBudgetCost(form.salaryMin);
      const maximum = parseBudgetCost(form.salaryMax);
      body = mobilityPayload({
        ...mob,
        expectedMinSalary: minimum ?? null,
        expectedMaxSalary: maximum ?? null,
        expectedSalaryCurrency: form.salaryCurrency,
        expectedSalaryPeriod: form.salaryPeriod,
      });
      break;
    }
    case 11:
      body = {
        ...(form.resumeUrl ? { resume: form.resumeUrl } : {}),
        careerSummary: form.careerSummary.trim() || undefined,
      };
      break;
    case 12:
      body = {
        ...mobilityPayload({
          ...mob,
          qualifications: form.qualifications,
          professionalRegistrations: form.professionalRegistrations,
        }),
        workHistory: form.workHistory
          .filter((w) => w.title.trim() && w.company.trim())
          .map((w) => ({
            title: w.title.trim(),
            company: w.company.trim(),
            startDate: w.startDate.trim() || undefined,
            endDate: w.isCurrent ? undefined : w.endDate.trim() || undefined,
            isCurrent: w.isCurrent,
          })),
        educationHistory: form.educationHistory
          .filter((e) => e.degree.trim() && e.school.trim())
          .map((e) => ({
            degree: e.degree.trim(),
            school: e.school.trim(),
            year: e.year.trim() || undefined,
          })),
        phoneNumber: form.phoneNumber.trim(),
        linkedin_profile: form.linkedin.trim(),
        portfolio_website: form.portfolio.trim(),
      };
      break;
    case 13:
      body = {
        ...mobilityPayload({
          ...mob,
          employerDiscoveryConsentEnabled: form.employerDiscovery,
          employerMessagingConsentEnabled: form.employerMessaging,
          agencyDiscoveryConsentEnabled: form.agencyDiscovery,
          agencyMessagingConsentEnabled: form.agencyMessaging,
        }),
        hide_phone: form.hidePhone,
        hide_email: form.hideEmail,
        hide_resume: form.hideResume,
        talent_pool_visible: !form.pauseTalentPool,
      };
      break;
    default:
      return;
  }

  await updateProfile(body);
}

export function validateOnboardingStep(
  step: number,
  form: OnboardingFormState,
): string | null {
  switch (step) {
    case 2:
      if (!canonicalCountryCode(form.currentResidenceCountry)) {
        return "Choose your current country of residence.";
      }
      return null;
    case 3:
      if (!form.sponsorshipStatus) return "Choose a sponsorship option.";
      return null;
    case 4:
      if (!form.relocationReadiness) return "Choose relocation readiness.";
      if (
        form.willingToRelocate &&
        commaCountries(form.targetCountries, 12).length === 0
      ) {
        return "Add at least one target country when you are willing to relocate.";
      }
      return null;
    case 5:
      for (const row of form.workAuthorizations) {
        if (!row.country || !row.authorizationType || !row.status) {
          return "Each work permission needs a country, type and status.";
        }
      }
      return null;
    case 6:
      if (!form.desiredOccupations.length) {
        return "Add at least one role you want.";
      }
      if (form.yearsOfExperience.trim()) {
        const n = Number(form.yearsOfExperience);
        if (!Number.isFinite(n) || n < 0 || n > 50) {
          return "Years of experience must be a whole number from 0 to 50.";
        }
      }
      return null;
    case 8:
      if (!form.employmentOptions.length) {
        return "Select at least one employment option.";
      }
      return null;
    case 9:
      if (!form.availability) return "Choose your availability.";
      return null;
    case 10: {
      const minimum = parseBudgetCost(form.salaryMin);
      const maximum = parseBudgetCost(form.salaryMax);
      if (
        form.salaryMin.trim() === "" ||
        form.salaryMax.trim() === "" ||
        minimum == null ||
        maximum == null
      ) {
        return "Enter a minimum and maximum salary.";
      }
      if (maximum < minimum) {
        return "Maximum salary must be at least the minimum.";
      }
      if (!form.salaryCurrency) return "Choose a currency.";
      if (!form.salaryPeriod) return "Choose a salary period.";
      return null;
    }
    case 12:
      for (const q of form.qualifications) {
        if (!q.name?.trim()) return "Each qualification needs a name.";
      }
      for (const r of form.professionalRegistrations) {
        if (!r.country || !r.registrationType) {
          return "Each professional registration needs a country and type.";
        }
      }
      return null;
    default:
      return null;
  }
}
