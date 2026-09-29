import {
  appCopy,
  toIntlLocale,
  type AppLanguage,
  type AppCopyKey,
} from "@/lib/i18n/catalog";
import countries from "@/data/countryGuideTranslations.json";

const mobility: Record<string, AppCopyKey> = {
  "cross-border remote allowed": "jobGlobal",
  "remote — global": "jobGlobal",
  "remote friendly": "jobRemoteFriendly",
  "visa sponsorship": "jobSponsorship",
  "relocation support": "jobRelocation",
  "job offer support": "jobOfferSupport",
  "work permit transfer": "jobWorkTransfer",
  "no sponsorship available": "jobNoSponsor",
};
/** Translate presentation only, after chip ordering and status styling. */
/** Sponsorship claims use their own colour so they are not lost in the brand navy and cyan. */
export function sponsorshipTone(value: string): "yes" | "no" | null {
  const v = value.trim().toLowerCase();
  if (v.includes("no sponsorship")) return "no";
  if (v.includes("sponsorship") || v.includes("sponsor licence") || v.includes("sponsor license")) return "yes";
  return null;
}

export function jobChipLabel(value: string, locale: AppLanguage): string {
  const key = mobility[value.trim().toLowerCase()];
  if (key) return appCopy(locale, key);
  if (value.startsWith("Visa: "))
    return appCopy(locale, "jobsVisaLabel", { route: value.slice(6) });
  return value;
}

const countryCodes: Record<string, keyof typeof countries.fr.countries> = {
  "United Kingdom": "gb",
  Canada: "ca",
  Australia: "au",
  "United States": "us",
  Germany: "de",
  "United Arab Emirates": "ae",
  UAE: "ae",
  Ireland: "ie",
  Singapore: "sg",
  "New Zealand": "nz",
  Netherlands: "nl",
};
export function jobCountryLabel(value: string, locale: AppLanguage): string {
  if (value === "Switzerland") return appCopy(locale, "jobSwitzerland");
  const code = countryCodes[value];
  return code && locale !== "en" ? countries[locale].countries[code] : value;
}

export function jobLocationLabel(
  job: { locationCity?: string; locationCountry?: string; location?: string },
  locale: AppLanguage,
): string {
  return (
    [job.locationCity, jobCountryLabel(job.locationCountry || "", locale)]
      .filter(Boolean)
      .join(", ") ||
    job.location ||
    ""
  );
}

const matches: Record<string, AppCopyKey> = {
  compatible: "jobsCompatible",
  potentially_compatible: "jobsPotential",
  more_information_needed: "jobsMoreInfo",
  incompatible: "jobsMismatch",
};
export function jobMatchLabel(status: string, locale: AppLanguage): string {
  return appCopy(locale, matches[status] ?? "jobsMoreInfo");
}

export function jobSalaryLabel(
  job: { salaryCurrency?: string; minSalary?: number; maxSalary?: number },
  locale: AppLanguage,
): string {
  const intl = toIntlLocale(locale);
  const cur = job.salaryCurrency || "GBP";
  const sym =
    cur === "GBP" ? "£" : cur === "EUR" ? "€" : cur === "USD" ? "$" : `${cur} `;
  if (job.minSalary != null && job.maxSalary != null) {
    return `${sym}${job.minSalary.toLocaleString(intl)}–${job.maxSalary.toLocaleString(intl)}`;
  }
  if (job.minSalary != null)
    return appCopy(locale, "jobsSalaryFrom", {
      amount: `${sym}${job.minSalary.toLocaleString(intl)}`,
    });
  return "";
}

export function jobAgeLabel(
  iso: string | undefined,
  locale: AppLanguage,
  now = Date.now(),
): string | null {
  if (!iso) return null;
  const date = new Date(iso),
    difference = now - date.getTime();
  if (!Number.isFinite(difference) || difference < 0) return null;
  const days = Math.floor(difference / 86400000);
  // Hermes lacks Intl.RelativeTimeFormat, so relative ages use bundled copy.
  if (days === 0) return appCopy(locale, "jobAgeToday");
  if (days === 1) return appCopy(locale, "jobAgeYesterday");
  if (days < 7) return appCopy(locale, "jobAgeDays", { count: days });
  if (days < 30) return appCopy(locale, "jobAgeWeeks", { count: Math.floor(days / 7) });
  const intl = toIntlLocale(locale);
  try {
    return date.toLocaleDateString(intl, { month: "short", day: "numeric" });
  } catch {
    return date.toLocaleDateString(intl);
  }
}
