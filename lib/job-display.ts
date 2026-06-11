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

function employerOffersSponsorshipFromProfile(pb: EmployerProfile | null | undefined): boolean {
  if (!pb || typeof pb !== "object") return false;
  const explicit = (pb as EmployerProfile & { employerHiringModel?: { offersSponsorship?: boolean } })
    .employerHiringModel?.offersSponsorship;
  if (explicit === true) return true;
  if (explicit === false) return false;
  const status = pb.sponsorLicense?.status?.trim().toLowerCase() ?? "";
  if (status === "not applicable" || status === "n/a") return false;
  return Boolean(pb.sponsorLicense?.number?.trim());
}

/** Sponsor / work-authorisation badge — matches website JobMarketingCard. */
export function getEmployerSponsorBadge(job: Job): { label: string; positive: boolean } | null {
  const pb = job.postedBy as EmployerProfile | null | undefined;
  if (!employerOffersSponsorshipFromProfile(pb)) return null;
  const status =
    typeof pb === "object" && pb?.sponsorLicense?.status
      ? String(pb.sponsorLicense.status).trim()
      : "";
  if (!status || status.toLowerCase() === "not applicable") return null;
  const lower = status.toLowerCase();
  const positive = lower === "active" || lower === "approved";
  return {
    label: positive ? "Active sponsor" : `Sponsor · ${status}`,
    positive,
  };
}

/** Normalise populated jobId from GET /saved-jobs (handles lean ObjectId shapes). */
export function jobFromSavedRow(item: { jobId?: unknown }): Job | null {
  const raw = item.jobId;
  if (!raw || typeof raw !== "object") return null;
  const id = String((raw as Job)._id ?? "").trim();
  if (!id) return null;
  return { ...(raw as Job), _id: id };
}

const REMOTE_GLOBAL_MOBILITY_VALUE = "Cross-border Remote Allowed";
export const VISA_ROUTE_OTHER_VALUE = "Other / not listed";
export const VISA_ROUTE_OPTIONS = [
  "UK Skilled Worker visa",
  "UK Health and Care Worker visa",
  "UK Global Business Mobility",
  "US H-1B",
  "US O-1",
  "US L-1",
  "Canada LMIA / work permit",
  "Canada Global Talent Stream",
  "Australia Subclass 482",
  "Australia Subclass 186",
  "Australia Subclass 494",
  "Germany EU Blue Card",
  "Germany Skilled Worker visa",
  "Ireland Critical Skills Employment Permit",
  "Ireland General Employment Permit",
  "Netherlands Highly Skilled Migrant",
  "New Zealand Accredited Employer Work Visa",
  "UAE employer-sponsored work visa",
  "Singapore Employment Pass",
  "Switzerland work permit",
] as const;
const MOBILITY_LABELS: Record<string, string> = {
  [REMOTE_GLOBAL_MOBILITY_VALUE]: "Remote — Global",
  "Remote Friendly": "Remote friendly",
  "Visa Sponsorship": "Visa sponsorship",
  "Relocation Support": "Relocation support",
  "Job Offer Support": "Job offer support",
  "Work Permit Transfer": "Work permit transfer",
  "No Sponsorship Available": "No sponsorship available",
};

export function formatMobilityLabel(value: string): string {
  return MOBILITY_LABELS[value] ?? value;
}

export function visaRouteChips(job: Job, max = 6): string[] {
  const selected = (job.visaRoutes ?? [])
    .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
    .map((x) => x.trim())
    .filter((x) => x !== VISA_ROUTE_OTHER_VALUE);
  const other = typeof job.visaRouteOther === "string" ? job.visaRouteOther.trim() : "";
  return Array.from(new Set([...selected, ...(other ? [other] : [])])).slice(0, max);
}

export function formatVisaRouteChip(route: string): string {
  return `Visa: ${route}`;
}

const MOBILITY_PRIORITY = /visa|sponsor|relocat|mobility|work permit|remote|subclass|skilled worker|blue card|employment pass/i;

/** Mobility-first chip order for job cards (visa / sponsorship surfaced first). */
export function hubListingChipsPrioritized(job: Job, max = 2): string[] {
  const all = [...visaRouteChips(job).map(formatVisaRouteChip), ...hubListingChips(job, 6)];
  const priority = all.filter((c) => MOBILITY_PRIORITY.test(c));
  const rest = all.filter((c) => !MOBILITY_PRIORITY.test(c));
  return [...priority, ...rest].slice(0, max);
}

/** Mobility + distinct benefit labels for hub job cards (capped for layout). */
export function hubListingChips(job: Job, max = 6): string[] {
  const visaRoutes = visaRouteChips(job).map(formatVisaRouteChip);
  const mobility = (job.mobility ?? []).filter((x): x is string => typeof x === "string" && x.trim().length > 0);
  const benefits = (job.benefits ?? []).filter((x): x is string => typeof x === "string" && x.trim().length > 0);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const route of visaRoutes) {
    if (out.length >= max) break;
    if (seen.has(route)) continue;
    seen.add(route);
    out.push(route);
  }
  for (const m of mobility) {
    if (out.length >= max) break;
    const k = m.trim();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(formatMobilityLabel(k));
  }
  for (const b of benefits) {
    if (out.length >= max) break;
    const k = b.trim();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(formatMobilityLabel(k));
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
    return { mobility: job.mobility.map(formatMobilityLabel), perks: raw };
  }
  return {
    mobility: raw.filter((b) => MOBILITY_BENEFIT_LABELS.has(b)).map(formatMobilityLabel),
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

/** Plain-text preview for curated/external cards (strips HTML from ingested summaries). */
export function getExternalListingSummaryPreview(job: ExternalJobListingPublic, maxLen = 160): string {
  const s = typeof job.summary === "string" ? job.summary.trim() : "";
  if (!s) return "";
  const plain = stripHtmlToPlainText(s);
  if (plain.length <= maxLen) return plain;
  return `${plain.slice(0, maxLen).trim()}…`;
}

export function formatExternalListingAge(iso?: string): string | null {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    const diffMs = Date.now() - d.getTime();
    const days = Math.floor(diffMs / 86_400_000);
    if (days < 1) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return null;
  }
}

/** Headline mobility flags when tags are sparse (matches public API booleans). */
export function externalListingHighlightFlags(job: ExternalJobListingPublic): string[] {
  const out: string[] = [];
  const tags = (job.mobilityTags ?? []).map((t) => t.toLowerCase());
  const hasVisa =
    job.sponsorshipAvailable ||
    tags.some((t) => /visa|sponsor/.test(t));
  const hasReloc =
    job.relocationAvailable ||
    tags.some((t) => /relocat/.test(t));
  if (hasVisa && !tags.some((t) => /visa|sponsor/.test(t))) out.push("Visa sponsorship");
  if (hasReloc && !tags.some((t) => /relocat/.test(t))) out.push("Relocation support");
  return out;
}

export function externalListingChips(job: ExternalJobListingPublic, max = 6): string[] {
  const tags = (job.mobilityTags ?? []).filter((x): x is string => typeof x === "string" && x.trim().length > 0);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const flag of externalListingHighlightFlags(job)) {
    if (out.length >= max) break;
    const k = flag.trim();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(k);
  }
  for (const t of tags) {
    if (out.length >= max) break;
    const k = t.trim();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(k);
  }
  return out.slice(0, max);
}
