/** Candidate actions with canonical resource URLs. */
export const SEO_PILLAR_NAV_LINKS = [
 {href: "/jobs", label: "Find international jobs"},
 {href: "/specialists", label: "Find independent specialists"},
 {href: "/companies", label: "Explore employers"},
];
export const RELOCATION_RESOURCES_NAV_LINKS = [
 {href: "/resources/job-offer-scam-checklist", label: "Check a job offer"},
 {href: "/resources/employer-verification-email-template", label: "Questions to ask an employer"},
 {href: "/resources/visa-sponsorship-cover-letter-template", label: "Write your cover letter"},
 {href: "/resources/first-90-days-relocation-checklist", label: "Plan your first 90 days"},
 {href: "/resources/relocation-budget-checklist", label: "Prepare a moving budget"},
];
export const HOME_FEATURED_GUIDE_LINKS = [...SEO_PILLAR_NAV_LINKS, ...RELOCATION_RESOURCES_NAV_LINKS];
export const ALL_GUIDE_NAV_LINKS = HOME_FEATURED_GUIDE_LINKS;
