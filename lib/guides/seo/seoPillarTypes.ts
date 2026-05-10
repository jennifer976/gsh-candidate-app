/**
 * Long-form SEO “pillar” pages (visa / relocation / employers).
 * Content is editorial; not legal advice — mirrors disclaimer tone in FAQs.
 */

/**
 * Editorial template (use on every playbook + country enrichment):
 *
 * - **Audience**: Opening intro states who benefits (and what the page omits).
 * - **Ordered decisions**: Sections follow a plausible timeline (search → offer → permits → arrival).
 * - **Country drill-down**: Universal pages link into `/jobs/country/[slug]` for jurisdiction detail.
 * - **Official links**: Governments change rules — cite primary portals via `officialLinks` + verify there.
 * - **GSH fit**: Short “how to use listing filters / directory” alongside due diligence reminders.
 * - **FAQs + related**: Surface real questions and cross-links (`relatedGuides`).
 * - **lastReviewed**: ISO date string; schedule re-checks for salary thresholds / programme names.
 */
export type SeoPillarSection = { h2: string; body: string };

export type SeoPillarAppendixTable = {
  heading: string;
  columns: string[];
  rows: string[][];
};

export type SeoPillarRelatedLink = { href: string; label: string };

/** External or internal citations rendered as a labelled list on hub pages */
export type SeoOfficialLink = { label: string; href: string };

export type SeoPillarPageConfig = {
  /** URL path without domain, e.g. /visa-sponsorship-jobs */
  path: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  /** Main intro — use blank lines between paragraphs for split rendering */
  intro: string;
  sections: SeoPillarSection[];
  faqs: { question: string; answer: string }[];
  browseHref: string;
  browseLabel: string;
  breadcrumbs: { name: string; path: string }[];
  /** Cross-links to other pillars — rendered after main sections in the resource zone */
  relatedGuides?: SeoPillarRelatedLink[];
  /** Optional comparison table rendered after sections, before FAQs */
  appendixTable?: SeoPillarAppendixTable;
  /** ISO date · shown on rendered hub for trust transparency */
  lastReviewed?: string;
  /** Government or regulator portals — complements inline copy */
  officialLinks?: SeoOfficialLink[];
};
