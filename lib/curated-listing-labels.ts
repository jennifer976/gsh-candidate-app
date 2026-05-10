import type { ExternalJobListingPublic } from "@/types/models";

/** Agency-submitted or explicitly tied to an agency name — show Agency badge and optional contact. */
export function isAgencyCuratedListing(job: ExternalJobListingPublic): boolean {
  if (job.sourceType === "agency_submitted") return true;
  return Boolean(typeof job.agencyName === "string" && job.agencyName.trim().length > 0);
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
