import { appCopy, type AppLanguage } from "./i18n/catalog";

export const CANDIDATE_COMPLETION_FIELDS = [
  { path: "firstName", label: "First name", message: "fieldFirstName" },
  { path: "lastName", label: "Last name", message: "fieldLastName" },
  { path: "email", label: "Contact email", message: "fieldEmail" },
  {
    path: "currentResidenceCountry",
    label: "Current location",
    message: "fieldLocation",
  },
  { path: "desiredOccupations", label: "Work you want", message: "fieldWork" },
  { path: "skills", label: "Skills", message: "fieldSkills" },
  {
    path: "yearsOfExperience",
    label: "Years of experience",
    message: "fieldExperience",
  },
  {
    path: "availability",
    label: "Availability or notice period",
    message: "fieldAvailability",
  },
  {
    path: "sponsorshipStatus",
    label: "Sponsorship needs",
    message: "fieldSponsorship",
  },
  {
    path: "targetCountries",
    label: "Destinations or remote preference",
    message: "fieldDestinations",
  },
  {
    path: "relocationReadiness",
    label: "Relocation preference",
    message: "fieldRelocation",
  },
] as const;
const text = (value: unknown) =>
  typeof value === "string" && Boolean(value.trim());
const list = (value: unknown) =>
  Array.isArray(value) &&
  value.some((item) => (typeof item === "string" ? text(item) : item != null));

/** Missing profile information, not a hiring score or a visa assessment. Prefer the server's current checks. */
export function getCandidateCompletionBreakdown(
  profile: Record<string, unknown> | undefined,
  locale: AppLanguage = "en",
) {
  const p = profile ?? {};
  const server = p.profileReadiness as
    | { items?: Array<{ key: string; label: string; complete: boolean }> }
    | undefined;
  const remote =
    ["remote", "remote or hybrid"].includes(
      String(p.remoteWorkPreference || "")
        .trim()
        .toLowerCase(),
    ) ||
    String(p.relocationReadiness || "").toLowerCase() === "remote-first only" ||
    (Array.isArray(p.employmentOptions) &&
      p.employmentOptions.some((value) =>
        ["remote_domestic", "remote_cross_border"].includes(String(value)),
      ));
  const checks: Record<string, boolean> = {
    firstName: text(p.firstName),
    lastName: text(p.lastName),
    email:
      text(p.email) ||
      text((p.userId as { email?: unknown } | undefined)?.email),
    currentResidenceCountry:
      text(p.currentResidenceCountry) || text(p.location),
    desiredOccupations:
      text(p.currentJobTitle) ||
      (Array.isArray(p.desiredOccupations) &&
        p.desiredOccupations.some((role) => text(role?.label))),
    skills: list(p.skills),
    yearsOfExperience:
      typeof p.yearsOfExperience === "number" &&
      Number.isFinite(p.yearsOfExperience) &&
      p.yearsOfExperience >= 0,
    availability: text(p.availability) || text(p.noticePeriod),
    sponsorshipStatus:
      text(p.sponsorshipStatus) ||
      typeof p.requiresVisaSponsorship === "boolean" ||
      list(p.workAuthorizations),
    targetCountries: list(p.targetCountries) || remote,
    relocationReadiness:
      text(p.relocationReadiness) || typeof p.willingToRelocate === "boolean",
  };
  const items =
    server?.items?.length &&
    server.items.every(
      (item) =>
        typeof item?.key === "string" &&
        typeof item.label === "string" &&
        typeof item.complete === "boolean",
    )
      ? server.items.map((item) => {
          const field = CANDIDATE_COMPLETION_FIELDS.find(
            (field) => field.path === item.key,
          );
          return {
            path: item.key,
            label: field ? appCopy(locale, field.message) : item.label,
            filled: item.complete,
          };
        })
      : CANDIDATE_COMPLETION_FIELDS.map((field) => ({
          path: field.path,
          label: appCopy(locale, field.message),
          filled: checks[field.path],
        }));
  return {
    percent: items.length
      ? Math.round(
          (items.filter((item) => item.filled).length / items.length) * 100,
        )
      : 0,
    missing: items.filter((item) => !item.filled),
  };
}
