import type { ExpertInsightsCategorySlug } from "./types";

const CATEGORIES: { slug: ExpertInsightsCategorySlug; name: string }[] = [
  { slug: "visa-sponsorship", name: "Visa & sponsorship" },
  { slug: "relocation", name: "Relocation" },
  { slug: "hiring-mobility", name: "Hiring & mobility" },
  { slug: "policy", name: "Policy & compliance" },
  { slug: "careers", name: "Careers & candidates" },
];

export function expertInsightCategoryName(slug: string): string {
  return CATEGORIES.find((c) => c.slug === slug)?.name ?? "Expert Insights";
}
