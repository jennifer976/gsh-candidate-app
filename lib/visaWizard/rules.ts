/**
 * Copied from global_sponsor_hub-fe/src/lib/visaWizard/rules.ts — keep in sync when wizard logic changes on web.
 */
export type CandidateInput = {
  destinationCountry: string;
  nationality: string;
  currentCountry: string;
  role: string;
  annualSalary: number;
  educationLevel: "none" | "bachelor" | "master" | "doctorate";
  yearsExperience: number;
  hasEmployerSponsor: boolean;
  needsRelocation: boolean;
};

export type OrientationTier = "high" | "moderate" | "limited";

export type VisaRoute = {
  id: string;
  country: string;
  name: string;
  requiresSponsor: boolean;
  minSalary?: number;
  minExperienceYears?: number;
  minEducationLevel?: CandidateInput["educationLevel"];
  roleKeywords?: string[];
  officialLink: string;
  notes: string;
};

export type RouteResult = {
  route: VisaRoute;
  /** Internal sort key only — do not present as a precise eligibility percentage. */
  score: number;
  orientationTier: OrientationTier;
  /** Route-specific alignment signals (nationality / residence context lives in `situationNotes`). */
  reasons: string[];
  blockers: string[];
};

export type VisaWizardEvaluation = {
  /** Once per profile: nationality & current-country context — not route-specific. */
  situationNotes: string[];
  results: RouteResult[];
};

const EDUCATION_RANK: Record<CandidateInput["educationLevel"], number> = {
  none: 0,
  bachelor: 1,
  master: 2,
  doctorate: 3,
};

export const SUPPORTED_COUNTRIES = [
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "Ireland",
  "Netherlands",
  "Singapore",
  "New Zealand",
  "United Arab Emirates",
  "United States",
] as const;

/** Salary thresholds in `VISA_ROUTES` are expressed in the destination labour-market currency below. */
export const DESTINATION_SALARY_CURRENCY: Record<string, { code: string }> = {
  "United Kingdom": { code: "GBP" },
  Canada: { code: "CAD" },
  Australia: { code: "AUD" },
  Germany: { code: "EUR" },
  Ireland: { code: "EUR" },
  Netherlands: { code: "EUR" },
  Singapore: { code: "SGD" },
  "New Zealand": { code: "NZD" },
  "United Arab Emirates": { code: "AED" },
  "United States": { code: "USD" },
};

export function getSalaryCurrencyCode(destinationCountry: string): string {
  return DESTINATION_SALARY_CURRENCY[destinationCountry]?.code ?? "USD";
}

export function formatSalaryInDestinationCurrency(amount: number, destinationCountry: string): string {
  const code = getSalaryCurrencyCode(destinationCountry);
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: code,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString()} ${code}`;
  }
}

function normalizeCountryHint(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Loose match for user-typed country vs canonical destination name (not immigration-grade). */
export function roughlySameCountry(userInput: string, destinationCountry: string): boolean {
  const u = normalizeCountryHint(userInput);
  const dest = normalizeCountryHint(destinationCountry);
  if (!u || !dest) return false;
  if (u === dest) return true;
  if (dest.includes(u) || u.includes(dest)) return true;

  const uk = ["united kingdom", "uk", "great britain", "britain", "england", "scotland", "wales"];
  const destUk = destinationCountry === "United Kingdom";
  const userUk = uk.some((k) => u === k || u.startsWith(`${k} `) || u.endsWith(` ${k}`));
  if (destUk && userUk) return true;

  const uae = ["uae", "united arab emirates", "dubai", "abu dhabi"];
  const destUae = destinationCountry === "United Arab Emirates";
  const userUae = uae.some((k) => u.includes(k));
  if (destUae && userUae) return true;

  return false;
}

export function buildSituationNotes(input: CandidateInput): string[] {
  const messages: string[] = [];
  if (!roughlySameCountry(input.nationality, input.destinationCountry)) {
    messages.push(
      "Eligibility depends on nationality and bilateral rules — this tool does not validate passport-specific requirements; confirm on the official immigration pages.",
    );
  }
  const cc = input.currentCountry.trim();
  if (cc.length === 0) return messages;

  if (roughlySameCountry(cc, input.destinationCountry)) {
    messages.push(
      "You indicated you may already be in the destination country — in-country applications and entry rules can differ from applying from abroad.",
    );
  } else {
    messages.push(
      "Where you apply from can affect required documents and processing — verify current rules for applications submitted from your current country.",
    );
  }
  return messages;
}

export function scoreToOrientationTier(score: number): OrientationTier {
  if (score >= 68) return "high";
  if (score >= 42) return "moderate";
  return "limited";
}

export const VISA_ROUTES: VisaRoute[] = [
  {
    id: "uk-skilled-worker",
    country: "United Kingdom",
    name: "Skilled Worker visa",
    requiresSponsor: true,
    minSalary: 38700,
    minExperienceYears: 1,
    officialLink: "https://www.gov.uk/skilled-worker-visa",
    notes: "Typical employer-sponsored route for long-term employment.",
  },
  {
    id: "uk-health-care",
    country: "United Kingdom",
    name: "Health and Care Worker visa",
    requiresSponsor: true,
    minSalary: 23000,
    roleKeywords: ["nurse", "doctor", "health", "care"],
    officialLink: "https://www.gov.uk/health-care-worker-visa",
    notes: "Healthcare-focused route with specific eligible roles.",
  },
  {
    id: "ca-global-talent",
    country: "Canada",
    name: "Global Talent Stream",
    requiresSponsor: true,
    minExperienceYears: 2,
    roleKeywords: ["engineer", "developer", "data", "security", "ai"],
    officialLink: "https://www.canada.ca/en/employment-social-development/services/foreign-workers/global-talent.html",
    notes: "Fast-track employer-led process for specialized roles.",
  },
  {
    id: "au-tss-482",
    country: "Australia",
    name: "Temporary Skill Shortage (subclass 482)",
    requiresSponsor: true,
    minExperienceYears: 2,
    officialLink: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/temporary-skill-shortage-482",
    notes: "Common route for sponsored skilled workers.",
  },
  {
    id: "de-eu-blue-card",
    country: "Germany",
    name: "EU Blue Card",
    requiresSponsor: false,
    minSalary: 45300,
    minEducationLevel: "bachelor",
    officialLink: "https://www.make-it-in-germany.com/en/visa-residence/types/eu-blue-card",
    notes: "Salary and qualification thresholds apply.",
  },
  {
    id: "nl-highly-skilled-migrant",
    country: "Netherlands",
    name: "Highly Skilled Migrant permit",
    requiresSponsor: true,
    minSalary: 38000,
    officialLink: "https://ind.nl/en/residence-permits/work/highly-skilled-migrant",
    notes: "Employer usually must be a recognized sponsor.",
  },
  {
    id: "ie-critical-skills",
    country: "Ireland",
    name: "Critical Skills Employment Permit",
    requiresSponsor: true,
    minSalary: 38000,
    officialLink: "https://enterprise.gov.ie/en/what-we-do/workplace-and-skills/employment-permits/permit-types/critical-skills-employment-permit/",
    notes: "No labour market test required. Employer must apply on your behalf.",
  },
  {
    id: "sg-employment-pass",
    country: "Singapore",
    name: "Employment Pass",
    requiresSponsor: true,
    minSalary: 5600,
    minExperienceYears: 1,
    officialLink: "https://www.mom.gov.sg/passes-and-permits/employment-pass",
    notes: "COMPASS assessment applies. Salary threshold scales with age.",
  },
  {
    id: "nz-aewv",
    country: "New Zealand",
    name: "Accredited Employer Work Visa",
    requiresSponsor: true,
    minExperienceYears: 1,
    officialLink: "https://www.immigration.govt.nz/new-zealand-visas/visas/visa/accredited-employer-work-visa",
    notes: "Employer must be accredited with Immigration New Zealand.",
  },
  {
    id: "us-h1b",
    country: "United States",
    name: "H-1B Specialty Occupation",
    requiresSponsor: true,
    minEducationLevel: "bachelor",
    officialLink: "https://www.uscis.gov/working-in-the-united-states/h-1b-specialty-occupations",
    notes: "Annual lottery. Cap is 65,000 plus 20,000 advanced degree exemption.",
  },
  {
    id: "uae-work-permit",
    country: "United Arab Emirates",
    name: "Standard Work Permit",
    requiresSponsor: true,
    officialLink: "https://u.ae/en/information-and-services/visa-and-emirates-id/residence-visas/work-residence-visa",
    notes: "Employer-sponsored work permit and residence flow.",
  },
];

export function evaluateVisaRoutes(input: CandidateInput): VisaWizardEvaluation {
  const role = input.role.toLowerCase();
  const destinationCountry = input.destinationCountry;
  const situationNotes = buildSituationNotes(input);

  const routes = VISA_ROUTES.filter((r) => r.country === destinationCountry);
  const results: RouteResult[] = routes.map((route) => {
    let score = 0;
    const reasons: string[] = [];
    const blockers: string[] = [];

    score += 25;
    reasons.push(`Route available in ${route.country}.`);

    if (route.requiresSponsor) {
      if (input.hasEmployerSponsor) {
        score += 20;
        reasons.push("Employer sponsorship indicated.");
      } else {
        blockers.push("This route usually requires an employer sponsor.");
      }
    } else {
      score += 10;
      reasons.push("This route may be possible without direct sponsor licence.");
    }

    if (route.minSalary != null) {
      const formattedThreshold = formatSalaryInDestinationCurrency(route.minSalary, destinationCountry);
      if (input.annualSalary >= route.minSalary) {
        score += 20;
        reasons.push(`Salary meets indicative threshold (${formattedThreshold}).`);
      } else {
        blockers.push(`Salary appears below indicative threshold (${formattedThreshold}).`);
      }
    }

    if (route.minExperienceYears != null) {
      if (input.yearsExperience >= route.minExperienceYears) {
        score += 10;
        reasons.push("Experience appears sufficient.");
      } else {
        blockers.push(`Likely needs ${route.minExperienceYears}+ years of experience.`);
      }
    }

    if (route.minEducationLevel) {
      if (EDUCATION_RANK[input.educationLevel] >= EDUCATION_RANK[route.minEducationLevel]) {
        score += 10;
        reasons.push(`Education level aligns (${route.minEducationLevel}+).`);
      } else {
        blockers.push(`This route usually expects ${route.minEducationLevel}+ qualification.`);
      }
    }

    if (route.roleKeywords && route.roleKeywords.length > 0) {
      const matched = route.roleKeywords.some((k) => role.includes(k));
      if (matched) {
        score += 15;
        reasons.push("Role appears aligned to route focus.");
      } else {
        blockers.push("Role may not align with this route's typical occupation focus.");
      }
    }

    if (input.needsRelocation) {
      score += 5;
      reasons.push("Candidate is open to relocation.");
    }

    const capped = Math.max(0, Math.min(100, score));
    return {
      route,
      score: capped,
      orientationTier: scoreToOrientationTier(capped),
      reasons,
      blockers,
    };
  });

  return {
    situationNotes,
    results: results.sort((a, b) => b.score - a.score),
  };
}
