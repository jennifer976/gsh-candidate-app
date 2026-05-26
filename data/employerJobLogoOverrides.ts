/**
 * Mirrors `global_sponsor_hub-fe/src/data/employerJobLogoOverrides.ts`.
 * Used when Profile.companyLogo is empty — same employers as the marketing site overrides.
 *
 * Prefer updating Mongo `Profiles.companyLogo` via `scripts/import-employer-company-logos.ts`
 * so web + app pick up logos automatically. Keep this list in sync when adding marketing-only paths.
 */
export type EmployerJobLogoOverride = {
  employerUserId?: string;
  companyNameKey?: string;
  logoUrl: string;
};

export const EMPLOYER_JOB_LOGO_OVERRIDES: EmployerJobLogoOverride[] = [
  { companyNameKey: "aqualillies", logoUrl: "/employer-logos/aqualillies.png" },
  { companyNameKey: "fryingsquad", logoUrl: "/employer-logos/frying-squad.png" },
  { companyNameKey: "thefryingsquad", logoUrl: "/employer-logos/frying-squad.png" },
];
