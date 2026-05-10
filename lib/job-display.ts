import type { ExternalJobListingPublic, Job } from "@/types/models";

/** Employer profile shape when `GET /jobs/public` replaces `postedBy` with a Profile document. */
export type PostedByEmployerProfile = {
  companyName?: string;
  businessName?: string;
};

/**
 * Prefer job.companyName; fall back to populated employer profile fields from the API.
 */
export function getJobEmployerLabel(job: Job): string {
  const direct = typeof job.companyName === "string" ? job.companyName.trim() : "";
  if (direct) return direct;

  const pb = job.postedBy;
  if (pb && typeof pb === "object") {
    const p = pb as PostedByEmployerProfile & Record<string, unknown>;
    const fromCompany = typeof p.companyName === "string" ? p.companyName.trim() : "";
    if (fromCompany) return fromCompany;
    const fromBiz = typeof p.businessName === "string" ? p.businessName.trim() : "";
    if (fromBiz) return fromBiz;
  }

  return "Employer";
}

/** Mobility + distinct benefit labels for hub job cards (capped for layout). */
export function hubListingChips(job: Job, max = 6): string[] {
  const mobility = (job.mobility ?? []).filter((x): x is string => typeof x === "string" && x.trim().length > 0);
  const benefits = (job.benefits ?? []).filter((x): x is string => typeof x === "string" && x.trim().length > 0);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const m of mobility) {
    if (out.length >= max) break;
    const k = m.trim();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(k);
  }
  for (const b of benefits) {
    if (out.length >= max) break;
    const k = b.trim();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(k);
  }
  return out;
}

export function externalListingChips(job: ExternalJobListingPublic, max = 6): string[] {
  const tags = (job.mobilityTags ?? []).filter((x): x is string => typeof x === "string" && x.trim().length > 0);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of tags) {
    if (out.length >= max) break;
    const k = t.trim();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(k);
  }
  if (job.sponsorshipAvailable && out.length < max) {
    const k = "Visa sponsorship";
    if (!seen.has(k)) {
      seen.add(k);
      out.push(k);
    }
  }
  if (job.relocationAvailable && out.length < max) {
    const k = "Relocation support";
    if (!seen.has(k)) {
      seen.add(k);
      out.push(k);
    }
  }
  return out.slice(0, max);
}
