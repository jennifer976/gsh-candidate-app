/**
 * Homepage & `/guides`: split **platform pillars** vs **candidate relocation resources**
 * so we can optimise layout without flattening unrelated intents.
 */

export const SEO_PILLAR_NAV_LINKS: { href: string; label: string }[] = [
  { href: "/visa-sponsorship-jobs", label: "Visa sponsorship jobs" },
  { href: "/international-jobs-visa-sponsorship", label: "International jobs & visas" },
  { href: "/jobs-with-relocation-support", label: "Relocation support roles" },
  { href: "/global-relocation-directory", label: "Relocation partner directory hub" },
  { href: "/companies-that-sponsor-visas", label: "Sponsor-friendly employers" },
  { href: "/employers/corporate-global-mobility", label: "Employer mobility playbook" },
  { href: "/partners/directory", label: "Partner directory" },
];

/** In-depth relocating candidate guides (`/relocating/*`). */
export const RELOCATION_RESOURCES_NAV_LINKS: { href: string; label: string }[] = [
  { href: "/relocating/job-offers-scams-red-flags", label: "Scams & bogus job-offer red flags" },
  { href: "/relocating/verify-employer-visa-job-offers", label: "Verify employers & written offers" },
  { href: "/relocating/cv-cover-letter-international-relocation-job", label: "CV & cover letter for abroad" },
  { href: "/relocating/interview-employer-relocation-visas-benefits", label: "Interview: visas & relocation benefits" },
  { href: "/relocating/moving-country-relocation-first-90-days", label: "First 90 days in a new country" },
  { href: "/relocating/relocating-family-visas-move-with-job", label: "Moving with partner & children" },
  { href: "/relocating/relocating-move-budget-financial-checklist", label: "Move budget & money checklist" },
  { href: "/relocating/regulated-jobs-credentials-recognition-abroad", label: "Regulated careers & licences abroad" },
];

/** Compact homepage teaser — pillars + verifying offers + strategy. */
export const HOME_FEATURED_GUIDE_LINKS: { href: string; label: string }[] = [
  { href: "/visa-sponsorship-jobs", label: "Visa sponsorship jobs" },
  { href: "/relocating/verify-employer-visa-job-offers", label: "Verify job offers & sponsors" },
  { href: "/international-jobs-visa-sponsorship", label: "Compare countries" },
];

/** @deprecated Prefer `SEO_PILLAR_NAV_LINKS` for new code. */
export const SEO_GUIDE_NAV_LINKS = SEO_PILLAR_NAV_LINKS;