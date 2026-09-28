import type { Href } from "expo-router";
import catalog from "@/data/editorialGuides.en.json";
import { guideRoute } from "@/lib/guides/guideRoute";
import { CANDIDATE_TEMPLATES } from "@/lib/publicResources";

export type ResourceKind = "guides" | "tools" | "templates" | "updates";

export type ResourceItem = {
  id: string;
  kind: ResourceKind;
  /** Label shown above the title, e.g. "Checklist". */
  format: string;
  title: string;
  blurb: string;
  href: Href;
  /** Template slug, when the item can be saved to the candidate's account. */
  templateSlug?: string;
};

const candidateGuides = [...catalog.relocation, ...catalog.pillars, ...catalog.content].filter(
  (guide) => !guide.path.startsWith("/employers/"),
);

/** Candidate half of the website's `/resources` library. */
export const RESOURCE_LIBRARY: ResourceItem[] = [
  { id: "countries", kind: "guides", format: "Guides", title: "Destination guides", blurb: "Country hubs with visa context, then live roles.", href: "/countries" },
  { id: "compare", kind: "guides", format: "Guides", title: "Compare destinations", blurb: "Two or three countries, side by side.", href: "/compare-countries" },
  { id: "labels", kind: "guides", format: "Trust", title: "How jobs are labelled", blurb: "What sponsorship and relocation labels mean here.", href: "/trust/how-we-label-jobs" },
  ...candidateGuides.map((guide): ResourceItem => ({
    id: guide.path,
    kind: "guides",
    format: "Guide",
    title: guide.h1,
    blurb: guide.metaDescription,
    href: guideRoute(guide.path),
  })),
  { id: "plan", kind: "tools", format: "Tools", title: "Plan the visa, and the move", blurb: "After a hire, or visa questions before you go.", href: "/relocation-help" },
  { id: "currency", kind: "tools", format: "Tools", title: "Currency converter", blurb: "Put a salary into a currency you know. Not a benchmark.", href: "/currency-converter" },
  { id: "worksheets", kind: "tools", format: "Tools", title: "Move worksheets", blurb: "Budget and country scorecard — you fill them in.", href: "/relocation-worksheets" },
  { id: "cv", kind: "tools", format: "Tools", title: "CV quality check", blurb: "Check structure, contact details, dates, and measurable results.", href: "/cv-quality-checker" },
  ...CANDIDATE_TEMPLATES.map((template): ResourceItem => ({
    id: template.slug,
    kind: "templates",
    format: template.format ?? template.category,
    title: template.title,
    blurb: template.description,
    href: `/resources/${template.slug}`,
    templateSlug: template.slug,
  })),
  { id: "news", kind: "updates", format: "Updates", title: "Visa & immigration news", blurb: "Government and specialist publishers.", href: "/news" },
  { id: "blog", kind: "updates", format: "Insights", title: "Read practical articles", blurb: "Practical pieces we write.", href: "/blog" },
];
