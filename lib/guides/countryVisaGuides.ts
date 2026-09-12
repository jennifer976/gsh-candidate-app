/**
 * Offline snapshot of the maintained candidate guide feed.
 */
export type CountryVisaGuidePartnerLink = {
  label: string;
  href: string;
  hint?: string;
};

export type CountryVisaGuideSection = {
  heading: string;
  /** Official links supporting this section. */
  sources?: string[];
  /** Standard prose blocks */
  paragraphs?: string[];
  /** Labelled bullets — bold lead + supporting text */
  bullets?: { label: string; text: string }[];
  /** Optional two-column pros / cons panel rendered after prose. */
  prosCons?: { pros: string[]; cons: string[] };
  /** Optional highlighted "candidate experience" / note callout. */
  callout?: { title: string; body: string };
  /** Optional visa-pathway stepper ("flowchart" alternative). */
  pathway?: { title?: string; steps: { title: string; detail?: string }[]; note?: string };
};

export function countryGuideSectionPlainText(sec: CountryVisaGuideSection): string {
  const ps = sec.paragraphs ?? [];
  const bs = sec.bullets?.map((b) => `${b.label}: ${b.text}`) ?? [];
  const pros = sec.prosCons?.pros.map((p) => `Pro: ${p}`) ?? [];
  const cons = sec.prosCons?.cons.map((c) => `Con: ${c}`) ?? [];
  const callout = sec.callout ? [`${sec.callout.title}: ${sec.callout.body}`] : [];
  return [...ps, ...bs, ...pros, ...cons, ...callout].join(" ");
}

export type QuickFact = {
  label: string;
  value: string;
};

export type CountryVisaGuide = {
  slug: string;
  title: string;
  excerpt: string;
  metaDescription: string;
  countryLabel: string;
  /** ISO 3166-1 alpha-2 for flagcdn */
  iso2: string;
  flagEmoji: string;
  updatedISO: string;
  officialSourceUrl: string;
  openingHook: string;
  quickFacts: QuickFact[];
  sections: CountryVisaGuideSection[];
  partnerLinks: CountryVisaGuidePartnerLink[];
};

import snapshot from "@/data/candidateCountryGuides.json";
export const COUNTRY_VISA_GUIDES: CountryVisaGuide[] = snapshot.guides;
export function getCountryVisaGuide(slug: string) { return COUNTRY_VISA_GUIDES.find(g => g.slug === slug); }
export function listCountryVisaGuideSummaries() { return COUNTRY_VISA_GUIDES; }
