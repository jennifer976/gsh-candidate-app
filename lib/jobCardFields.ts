import {
  getJobEmployerLabel,
  getJobLogoUrl,
  hubListingChips,
  formatMobilityLabel,
} from "@/lib/job-display";
import { jobAgeLabel, jobSalaryLabel } from "@/lib/job-presentation";
import { canonicalCountryCode, countryDisplayName } from "@/lib/countries";
import { resolveBrandImageUrl } from "@/lib/brand-logo";
import type { AppLanguage } from "@/lib/i18n/catalog";
import type { ExternalJobListingPublic, Job } from "@/types/models";

export type JobCardFields = {
  title: string;
  company: string;
  logoUrl: string;
  countryIso2: string | null;
  countryLabel: string;
  remote: boolean;
  salaryLabel: string | null;
  visaSponsorship: boolean;
  relocationSupport: boolean;
  remoteTag: boolean;
  jobType: string | null;
  postedLabel: string | null;
  href: string;
};

function mobilityHas(labels: string[], needle: RegExp): boolean {
  return labels.some((l) => needle.test(l));
}

export function jobCardFieldsFromJob(job: Job, locale: AppLanguage): JobCardFields {
  const chips = hubListingChips(job, 8).map(formatMobilityLabel);
  const workMode = String(job.workMode || "").toLowerCase();
  const remote =
    workMode.includes("remote") ||
    mobilityHas(chips, /remote/i) ||
    mobilityHas(job.mobility ?? [], /remote/i);
  const visaSponsorship = mobilityHas(chips, /visa sponsorship/i);
  const relocationSupport = mobilityHas(chips, /relocation support/i);
  const iso =
    canonicalCountryCode(job.locationCountry) ||
    canonicalCountryCode(job.location) ||
    null;
  const countryLabel = iso
    ? countryDisplayName(iso, locale)
    : job.locationCountry || job.locationCity || job.location || "";
  const salary = jobSalaryLabel(job, locale);

  return {
    title: job.title,
    company: getJobEmployerLabel(job, locale),
    logoUrl: getJobLogoUrl(job),
    countryIso2: iso ? iso.toLowerCase() : null,
    countryLabel,
    remote,
    salaryLabel: salary || null,
    visaSponsorship,
    relocationSupport,
    remoteTag: remote,
    jobType: job.jobType?.trim() || null,
    postedLabel: jobAgeLabel(job.createdAt, locale),
    href: `/job/${encodeURIComponent(job._id)}`,
  };
}

export function jobCardFieldsFromExternal(
  job: ExternalJobListingPublic,
  locale: AppLanguage,
): JobCardFields {
  const tags = (job.mobilityTags ?? []).map((t) => t.toLowerCase());
  const visaSponsorship =
    Boolean(job.sponsorshipAvailable) || tags.some((t) => /visa|sponsor/.test(t));
  const relocationSupport =
    Boolean(job.relocationAvailable) || tags.some((t) => /relocat/.test(t));
  const remote =
    tags.some((t) => /remote/.test(t)) ||
    /remote/i.test(String(job.location || ""));
  const iso =
    canonicalCountryCode(job.country) ||
    canonicalCountryCode(job.location) ||
    null;
  const countryLabel = iso
    ? countryDisplayName(iso, locale)
    : job.country || job.location || "";

  return {
    title: job.title,
    company: job.companyName || "",
    logoUrl: resolveBrandImageUrl(job.companyLogo),
    countryIso2: iso ? iso.toLowerCase() : null,
    countryLabel,
    remote,
    salaryLabel: null,
    visaSponsorship,
    relocationSupport,
    remoteTag: remote,
    jobType: null,
    postedLabel: jobAgeLabel(job.externalPostedAt ?? job.createdAt, locale),
    href: `/external-job/${encodeURIComponent(job._id)}`,
  };
}
