import { canonicalCountryCode, canonicalCountryList } from "./countries";
import { CANDIDATE_AVAILABILITY_OPTIONS } from "@/types/mobility";
import type {
  CandidateMobilityProfile,
  EmploymentOption,
  ProfessionalRegistration,
  Qualification,
  WorkAuthorization,
} from "@/types/mobility";

const text = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";
const list = (value: unknown) => (Array.isArray(value) ? value : []);
const countryArray = (value: unknown, max: number) =>
  Array.from(
    new Set(
      list(value)
        .map(canonicalCountryCode)
        .filter((x): x is string => Boolean(x)),
    ),
  ).slice(0, max);
const validDate = (value: string) => {
  if (!value) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return (
    Number.isFinite(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
};

export function hydrateMobilityProfile(
  source?: Record<string, unknown>,
): CandidateMobilityProfile {
  const p = source ?? {};
  const consent = p.employerDiscoveryConsent as
    | { enabled?: unknown }
    | undefined;
  return {
    mobilityProfileVersion: 1,
    currentResidenceCountry:
      canonicalCountryCode(p.currentResidenceCountry) || "",
    citizenshipCountries: countryArray(p.citizenshipCountries, 50),
    desiredOccupations: list(p.desiredOccupations)
      .map((item) => {
        const row = item as Record<string, unknown>;
        const scheme = text(row.scheme);
        const code = text(row.code);
        return scheme && scheme !== "free_text" && code
          ? {
              scheme,
              code,
              label: text(row.label),
              ...(text(row.schemeVersion)
                ? { schemeVersion: text(row.schemeVersion) }
                : {}),
            }
          : { scheme: "free_text", label: text(row.label) };
      })
      .filter((item) => item.label)
      .slice(0, 25),
    workAuthorizations: list(p.workAuthorizations)
      .map((item) => item as WorkAuthorization)
      .slice(0, 30),
    qualifications: list(p.qualifications)
      .map((item) => item as Qualification)
      .slice(0, 30),
    professionalRegistrations: list(p.professionalRegistrations)
      .map((item) => item as ProfessionalRegistration)
      .slice(0, 30),
    employmentOptions: list(p.employmentOptions).filter(
      (item): item is EmploymentOption => typeof item === "string",
    ) as EmploymentOption[],
    targetCountries: countryArray(p.targetCountries, 12),
    sponsorshipStatus: text(p.sponsorshipStatus),
    requiresVisaSponsorship: p.requiresVisaSponsorship === true,
    relocationReadiness: text(p.relocationReadiness),
    willingToRelocate: p.willingToRelocate === true,
    availability: CANDIDATE_AVAILABILITY_OPTIONS.includes(
      p.availability as never,
    )
      ? (p.availability as CandidateMobilityProfile["availability"])
      : "",
    expectedMinSalary:
      typeof p.expectedMinSalary === "number" ? p.expectedMinSalary : null,
    expectedMaxSalary:
      typeof p.expectedMaxSalary === "number" ? p.expectedMaxSalary : null,
    expectedSalaryCurrency: /^[A-Z]{3}$/.test(
      text(p.expectedSalaryCurrency).toUpperCase(),
    )
      ? text(p.expectedSalaryCurrency).toUpperCase()
      : "USD",
    expectedSalaryPeriod: p.expectedSalaryPeriod === "month" ? "month" : "year",
    employerDiscoveryConsentEnabled: consent?.enabled === true,
    agencyDiscoveryConsentEnabled:
      (p.agencyDiscoveryConsent as { enabled?: unknown } | undefined)
        ?.enabled === true,
    employerMessagingConsentEnabled:
      (p.employerMessagingConsent as { enabled?: unknown } | undefined)
        ?.enabled === true,
    agencyMessagingConsentEnabled:
      (p.agencyMessagingConsent as { enabled?: unknown } | undefined)
        ?.enabled === true,
  };
}

type ParseResult<T> = { data: T[]; errors: string[] };
const rows = (value: string) =>
  value
    .split("\n")
    .map((row) => row.trim())
    .filter(Boolean);

export function parseWorkAuthorizations(
  value: string,
): ParseResult<WorkAuthorization> {
  const errors: string[] = [];
  const data: WorkAuthorization[] = [];
  rows(value).forEach((line, index) => {
    const [
      rawCountry,
      authorizationType = "",
      rawStatus = "unknown",
      expiresAt = "",
    ] = line.split("|").map((x) => x.trim());
    const country = canonicalCountryCode(rawCountry);
    const status = ["confirmed", "pending", "expired", "unknown"].includes(
      rawStatus,
    )
      ? (rawStatus as WorkAuthorization["status"])
      : undefined;
    if (!country || !authorizationType || !status)
      errors.push(`Work authorization line ${index + 1} is invalid.`);
    else
      data.push({
        country,
        authorizationType,
        status,
        ...(expiresAt ? { expiresAt } : {}),
      });
  });
  return { data, errors };
}

export function parseQualifications(value: string): ParseResult<Qualification> {
  const errors: string[] = [];
  const data = rows(value)
    .map((line, index) => {
      const [
        name = "",
        issuer = "",
        rawCountry = "",
        level = "",
        awardedAt = "",
        expiresAt = "",
      ] = line.split("|").map((x) => x.trim());
      const country = rawCountry ? canonicalCountryCode(rawCountry) : undefined;
      if (
        !name ||
        (rawCountry && !country) ||
        !validDate(awardedAt) ||
        !validDate(expiresAt)
      ) {
        errors.push(
          `Qualification line ${index + 1} is invalid. Dates must use YYYY-MM-DD.`,
        );
      }
      return name &&
        (!rawCountry || country) &&
        validDate(awardedAt) &&
        validDate(expiresAt)
        ? {
            name,
            ...(issuer ? { issuer } : {}),
            ...(country ? { country } : {}),
            ...(level ? { level } : {}),
            ...(awardedAt ? { awardedAt } : {}),
            ...(expiresAt ? { expiresAt } : {}),
          }
        : null;
    })
    .filter((x): x is Qualification => Boolean(x));
  return { data, errors };
}

export function parseRegistrations(
  value: string,
): ParseResult<ProfessionalRegistration> {
  const errors: string[] = [];
  const data = rows(value)
    .map((line, index) => {
      const [
        rawCountry,
        registrationType = "",
        authority = "",
        rawStatus = "unknown",
        registrationNumber = "",
        expiresAt = "",
      ] = line.split("|").map((x) => x.trim());
      const country = canonicalCountryCode(rawCountry);
      const valid = [
        "active",
        "pending",
        "expired",
        "not_held",
        "unknown",
      ].includes(rawStatus);
      if (!country || !registrationType || !valid || !validDate(expiresAt)) {
        errors.push(
          `Registration line ${index + 1} is invalid. Expiry must use YYYY-MM-DD.`,
        );
      }
      return country && registrationType && valid && validDate(expiresAt)
        ? {
            country,
            registrationType,
            ...(authority ? { authority } : {}),
            ...(registrationNumber ? { registrationNumber } : {}),
            status: rawStatus as ProfessionalRegistration["status"],
            ...(expiresAt ? { expiresAt } : {}),
          }
        : null;
    })
    .filter((x): x is ProfessionalRegistration => Boolean(x));
  return { data, errors };
}

export function mobilityPayload(
  value: CandidateMobilityProfile,
): Record<string, unknown> {
  return {
    ...value,
    mobilityProfileVersion: 1,
    employerDiscoveryConsent: {
      enabled: value.employerDiscoveryConsentEnabled,
    },
    employerDiscoveryConsentEnabled: undefined,
    agencyDiscoveryConsent: {
      enabled: value.agencyDiscoveryConsentEnabled === true,
    },
    agencyDiscoveryConsentEnabled: undefined,
    employerMessagingConsent: {
      enabled: value.employerMessagingConsentEnabled === true,
    },
    employerMessagingConsentEnabled: undefined,
    agencyMessagingConsent: {
      enabled: value.agencyMessagingConsentEnabled === true,
    },
    agencyMessagingConsentEnabled: undefined,
  };
}

export const commaCountries = (value: string, max: number) =>
  canonicalCountryList(value, max);
