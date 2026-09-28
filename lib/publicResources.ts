// Generated content comes from the website. See scripts/sync-public-resources.cjs.
import data from "@/data/publicResources.json";
import type { AppLanguage as AppLocale } from "@/lib/i18n/catalog";

export type PublicCountry = {
  slug: string;
  name: string;
  title: string;
  iso2: string;
  blurb: string;
  mainRoute: string;
  pathType: string;
  workLanguage: string;
  currencyCode: string;
  hiringSectors: string[];
  familyNote: string;
  bestIf: string;
  watchOut: string;
  visaGuideSlug: string | null;
  faqs: { question: string; answer: string }[];
  officialLinks: { label: string; href: string }[];
  lastReviewed: string | null;
  phrases: Record<string, CountryPhraseForms>;
};

type CountryPhraseForms = { atPrefix: string; atCountry: string; toPrefix: string; toCountry: string };

export type CandidateTemplate = {
  slug: string;
  title: string;
  description: string;
  category: string;
  cta: string;
  format?: string;
  estimatedMinutes?: number;
  howToSteps?: { name: string; text: string }[];
  sections: TemplateSection[];
};

type TemplateItems = { text: string }[];

export type TemplateBlock =
  | { type: "prose"; body: string }
  | { type: "callout"; callout: { variant: "example" | "warning"; title: string; body: string } }
  | { type: "checklist" | "steps"; items: TemplateItems }
  | { type: "bullets"; title?: string; items: TemplateItems }
  | { type: "table"; table: { caption: string; columns: string[]; rows: string[][] } };

export type TemplateSection = { heading: string; blocks: TemplateBlock[] };

type HowWeLabelJobsCopy = Record<string, string>;

export const PUBLIC_COUNTRIES: PublicCountry[] = data.countries;
export const CANDIDATE_TEMPLATES = data.templates as CandidateTemplate[];

export function getPublicCountry(slug: string): PublicCountry | undefined {
  return PUBLIC_COUNTRIES.find((country) => country.slug === slug.toLowerCase());
}

export function countryForVisaGuide(guideSlug: string): PublicCountry | undefined {
  return PUBLIC_COUNTRIES.find((country) => country.visaGuideSlug === guideSlug);
}

export function getSwitzerlandGuide(locale: AppLocale): { intro: string; sections: { h2: string; body: string }[] } {
  const guides = data.switzerland as Record<string, { intro: string; sections: { h2: string; body: string }[] }>;
  return guides[locale] ?? guides.en;
}

/** Reviewed "in <country>" / "to <country>" phrases; the forms are inflected, so never show them alone. */
export function countryPhrases(country: PublicCountry, locale: AppLocale) {
  const forms = country.phrases[locale] ?? country.phrases.en;
  return {
    at: `${forms.atPrefix} ${forms.atCountry}`,
    to: `${forms.toPrefix} ${forms.toCountry}`,
  };
}

export function getCandidateTemplate(slug: string): CandidateTemplate | undefined {
  return CANDIDATE_TEMPLATES.find((template) => template.slug === slug);
}

export function getHowWeLabelJobsCopy(locale: AppLocale): HowWeLabelJobsCopy {
  const copy = data.howWeLabelJobs as Record<string, HowWeLabelJobsCopy>;
  return copy[locale] ?? copy.en;
}

export function flagImageUrl(iso2: string): string {
  return `https://flagcdn.com/w80/${iso2.toLowerCase()}.png`;
}
