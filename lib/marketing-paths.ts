/**
 * Canonical paths on the public website (deep links, SEO). The candidate app maps these to in-app routes —
 * it does not load the marketing site for candidate flows.
 */
export const MARKETING_PATHS = {
  visaWizard: "/tools/visa-wizard",
  curatedJobs: "/jobs/external",
  guides: "/guides",
  candidateTools: "/candidate/tools",
} as const;

/** Legacy www paths (still valid on web); prefer `LEGAL_IN_APP` from `@/lib/legal/inAppRoutes` in the Expo app. */
export const LEGAL_PATHS = {
  hub: "/legal",
  privacy: "/privacy-policy",
  terms: "/terms-and-conditions",
  cookies: "/cookie-policy",
  acceptableUse: "/acceptable-use",
} as const;
