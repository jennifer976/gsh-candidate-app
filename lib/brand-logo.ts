import { EMPLOYER_JOB_LOGO_OVERRIDES } from "@/data/employerJobLogoOverrides";
import { resolveUploadAssetUrl } from "@/lib/media-url";
import type { EmployerProfile, Job, PartnerListItem } from "@/types/models";

function normalizedCompanyKey(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function jobPostedUserId(job: Job): string | undefined {
  const pb = job.postedBy as unknown;
  if (typeof pb === "string" && pb.trim()) return pb.trim();
  if (pb && typeof pb === "object") {
    const o = pb as Record<string, unknown>;
    if (o._id != null) return String(o._id);
  }
  return undefined;
}

function displayCompanyLabel(job: Job): string {
  const direct = typeof job.companyName === "string" ? job.companyName.trim() : "";
  if (direct) return direct;
  const pb = job.postedBy;
  if (pb && typeof pb === "object") {
    const cn = typeof pb.companyName === "string" ? pb.companyName.trim() : "";
    if (cn) return cn;
    const bn = typeof pb.businessName === "string" ? pb.businessName.trim() : "";
    if (bn) return bn;
  }
  return "";
}

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

  let raw = "";
  if (typeof job.companyLogo === "string" && job.companyLogo.trim()) {
    raw = job.companyLogo.trim();
  } else {
    raw = [pb?.companyLogo, pb?.profile_picture, galleryFirst].find(
      (c) => typeof c === "string" && c.trim()
    ) as string | undefined ?? "";
    raw = raw.trim();
  }

  const posterId = jobPostedUserId(job);
  const nameKey = normalizedCompanyKey(displayCompanyLabel(job));
  for (const o of EMPLOYER_JOB_LOGO_OVERRIDES) {
    const wantUrl = o.logoUrl?.trim();
    if (!wantUrl) continue;
    if (o.employerUserId?.trim() && posterId && o.employerUserId.trim() === posterId) {
      raw = wantUrl;
      break;
    }
    if (o.companyNameKey?.trim() && nameKey && normalizedCompanyKey(o.companyNameKey) === nameKey) {
      raw = wantUrl;
      break;
    }
  }

  return resolveUploadAssetUrl(raw);
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
