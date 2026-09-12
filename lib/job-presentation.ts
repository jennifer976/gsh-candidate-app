import { appCopy, type AppLanguage, type AppCopyKey } from "@/lib/i18n/catalog";
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

const matches: Record<string, AppCopyKey> = {
  compatible: "jobsCompatible",
  potentially_compatible: "jobsPotential",
  more_information_needed: "jobsMoreInfo",
  incompatible: "jobsMismatch",
};
export function jobMatchLabel(status: string, locale: AppLanguage): string {
  return appCopy(locale, matches[status] ?? "jobsMoreInfo");
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
  try {
    if (days < 7)
      return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(
        -days,
        "day",
      );
    if (days < 30)
      return new Intl.RelativeTimeFormat(locale, {
        numeric: "always",
        style: "short",
      }).format(-Math.floor(days / 7), "week");
    return date.toLocaleDateString(locale, { month: "short", day: "numeric" });
  } catch {
    return date.toLocaleDateString(locale);
  }
}
