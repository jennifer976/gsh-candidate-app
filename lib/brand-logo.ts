import { resolveUploadAssetUrl } from "@/lib/media-url";
import type { EmployerProfile, Job, PartnerListItem } from "@/types/models";

/** First non-empty upload path/URL after API-origin normalisation. */
export function resolveBrandImageUrl(...candidates: (string | null | undefined)[]): string {
  for (const c of candidates) {
    const resolved = resolveUploadAssetUrl(c);
    if (resolved) return resolved;
  }
  return "";
}

export function resolveJobBrandLogo(job: Job): string {
  const pb = job.postedBy as
    | (EmployerProfile & { profile_picture?: string; listingGallery?: string[] })
    | null
    | undefined;
  const galleryFirst = Array.isArray(pb?.listingGallery)
    ? pb.listingGallery.find((x) => typeof x === "string" && x.trim())
    : undefined;
  return resolveBrandImageUrl(
    job.companyLogo,
    pb?.companyLogo,
    pb?.profile_picture,
    galleryFirst
  );
}

export function resolveDashboardJobLogo(job: {
  companyLogo?: string | null;
  postedBy?: unknown;
}): string {
  const pb = job.postedBy as
    | (EmployerProfile & { profile_picture?: string; listingGallery?: string[] })
    | null
    | undefined;
  const galleryFirst = Array.isArray(pb?.listingGallery)
    ? pb.listingGallery.find((x) => typeof x === "string" && x.trim())
    : undefined;
  return resolveBrandImageUrl(job.companyLogo, pb?.companyLogo, pb?.profile_picture, galleryFirst);
}

export function resolvePartnerListLogo(
  item: PartnerListItem & { listingGallery?: string[]; profile_picture?: string }
): string {
  const galleryFirst = Array.isArray(item.listingGallery)
    ? item.listingGallery.find((x) => typeof x === "string" && x.trim())
    : undefined;
  return resolveBrandImageUrl(item.companyLogo, galleryFirst, item.profile_picture);
}
