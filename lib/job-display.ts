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

const MOBILITY_BENEFIT_LABELS = new Set([
  "Visa Sponsorship",
  "Relocation Support",
  "Remote Friendly",
  "Job Offer Support",
  "Work Permit Transfer",
  "Cross-border Remote Allowed",
  "No Sponsorship Available",
]);

/** Matches web job detail: mobility vs other benefits. */
export function splitMobilityAndPerks(job: Job): { mobility: string[]; perks: string[] } {
  const raw = (job.benefits ?? []).filter((x): x is string => typeof x === "string" && x.trim().length > 0);
  if (job.mobility && job.mobility.length > 0) {
    return { mobility: job.mobility, perks: raw };
  }
  return {
    mobility: raw.filter((b) => MOBILITY_BENEFIT_LABELS.has(b)),
    perks: raw.filter((b) => !MOBILITY_BENEFIT_LABELS.has(b)),
  };
}

export function stripHtmlToPlainText(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

/** Human-readable location for curated/external cards (API often has `location` only, not `country`). */
export function getExternalListingLocationLabel(job: ExternalJobListingPublic): string {
  const loc = typeof job.location === "string" ? job.location.trim() : "";
  const country = typeof job.country === "string" ? job.country.trim() : "";
  if (loc && country && !loc.toLowerCase().includes(country.toLowerCase())) {
    return `${loc} · ${country}`;
  }
  if (loc) return loc;
  if (country) return country;

  const summary = typeof job.summary === "string" ? job.summary.trim() : "";
  if (summary) {
    const locLine =
      summary.match(/(?:Location|Based in|Office(?:\s+location)?)\s*:?\s*([^.\n|]{3,100})/i)?.[1]?.trim() ??
      "";
    if (locLine) return locLine;
    if (/\bremote\b|\bhybrid\b|\bwork from anywhere\b/i.test(summary)) {
      return "Remote / hybrid — see listing";
    }
    const commaPlace = summary.match(/\b(?:in|at)\s+([A-Z][A-Za-z\s,]{2,60})/)?.[1]?.trim();
    if (commaPlace && commaPlace.length <= 80) return commaPlace;
  }

  if (job.sponsorshipAvailable || job.relocationAvailable) {
    return "See listing for location";
  }
  return "";
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
