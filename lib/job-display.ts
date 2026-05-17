import { resolveJobBrandLogo } from "@/lib/brand-logo";
import type { EmployerProfile, ExternalJobListingPublic, Job } from "@/types/models";

/**
 * Extracts the employer label from a job, preferring companyName,
 * then falling back to the populated postedBy profile.
 */
export function getJobEmployerLabel(job: Job): string {
  const direct = typeof job.companyName === "string" ? job.companyName.trim() : "";
  if (direct) return direct;

  const pb = job.postedBy as EmployerProfile | null | undefined;
  if (pb && typeof pb === "object") {
    const fromCompany = typeof pb.companyName === "string" ? pb.companyName.trim() : "";
    if (fromCompany) return fromCompany;
    const fromBiz = typeof pb.businessName === "string" ? pb.businessName.trim() : "";
    if (fromBiz) return fromBiz;
    const fromContact = typeof pb.contactCompany === "string" ? pb.contactCompany.trim() : "";
    if (fromContact) return fromContact;
  }

  return "Employer";
}

/**
 * Extracts the company logo URL from a job.
 * The API may return it at the job level (companyLogo) or inside postedBy.
 */
export function getJobLogoUrl(job: Job): string {
  return resolveJobBrandLogo(job);
}

const MOBILITY_PRIORITY = /visa|sponsor|relocat|mobility|work permit/i;

/** Mobility-first chip order for job cards (visa / sponsorship surfaced first). */
export function hubListingChipsPrioritized(job: Job, max = 2): string[] {
  const all = hubListingChips(job, 6);
  const priority = all.filter((c) => MOBILITY_PRIORITY.test(c));
  const rest = all.filter((c) => !MOBILITY_PRIORITY.test(c));
  return [...priority, ...rest].slice(0, max);
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
    if (!seen.has(k)) { seen.add(k); out.push(k); }
  }
  if (job.relocationAvailable && out.length < max) {
    const k = "Relocation support";
    if (!seen.has(k)) { seen.add(k); out.push(k); }
  }
  return out.slice(0, max);
}
