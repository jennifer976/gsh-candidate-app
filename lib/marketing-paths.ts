/**
 * Canonical paths on www (same host as `extra.siteUrl` / EXPO_PUBLIC_SITE_URL).
 * Open with {@link openMarketingBrowser} so users get the full website — cookie banner,
 * legal pages, and sign-in — outside the native shell.
 */
export const MARKETING_PATHS = {
  visaWizard: "/tools/visa-wizard",
  curatedJobs: "/jobs/external",
  guides: "/guides",
  candidateTools: "/candidate/tools",
} as const;

/** Policy URLs shared with the marketing site (App Store / Play privacy links may point here too). */
export const LEGAL_PATHS = {
  hub: "/legal",
  privacy: "/privacy-policy",
  terms: "/terms-and-conditions",
  cookies: "/cookie-policy",
  acceptableUse: "/acceptable-use",
} as const;
