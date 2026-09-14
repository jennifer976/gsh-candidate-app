import type { ExternalJobListingPublic } from "@/types/models";

/** True agency-submitted listings only — do not infer from free-text agencyName on curated rows. */
export function isAgencyCuratedListing(job: ExternalJobListingPublic): boolean {
  return job.sourceType === "agency_submitted";
}

/** Primary badge on curated cards / detail: not every listing has agency metadata; default to Curated. */
export function curatedListingPrimaryBadge(job: ExternalJobListingPublic): "Agency" | "Curated" {
  return isAgencyCuratedListing(job) ? "Agency" : "Curated";
}

export function normalizeAgencyWebsite(url: string | undefined): string | null {
  if (!url || typeof url !== "string") return null;
  const t = url.trim();
  if (!t) return null;
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
}
