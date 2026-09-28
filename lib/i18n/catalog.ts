import en from "./messages/en.json";
import fr from "./messages/fr.json";
import de from "./messages/de.json";
import es from "./messages/es.json";
import pt from "./messages/pt.json";
import it from "./messages/it.json";
import nl from "./messages/nl.json";
import pl from "./messages/pl.json";

export const APP_LANGUAGES = [
  { code: "en", name: "English (UK)" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "es", name: "Español" },
  { code: "pt", name: "Português" },
  { code: "it", name: "Italiano" },
  { code: "nl", name: "Nederlands" },
  { code: "pl", name: "Polski" },
] as const;
export type AppLanguage = (typeof APP_LANGUAGES)[number]["code"];
export type AppCopyKey = keyof typeof en;
const catalogs: Record<AppLanguage, Record<AppCopyKey, string>> = {
  en,
  fr,
  de,
  es,
  pt,
  it,
  nl,
  pl,
};
export function normalizeAppLanguage(value: unknown): AppLanguage {
  const primary =
    typeof value === "string" ? value.toLowerCase().split(/[-_]/)[0] : "en";
  return (
    APP_LANGUAGES.find((language) => language.code === primary)?.code ?? "en"
  );
}

/** British English for dates, numbers, and region names (plain `en` is US on most devices). */
export function toIntlLocale(locale: AppLanguage | string): string {
  const primary = locale.toLowerCase().split(/[-_]/)[0];
  if (primary === "en") return "en-GB";
  return normalizeAppLanguage(locale);
}
/** Only call with explicit UI message keys, never with job or profile content. */
export function appCopy(
  locale: AppLanguage,
  key: AppCopyKey,
  values: Record<string, string | number> = {},
): string {
  const message = catalogs[locale][key] || en[key];
  return message.replace(/\{(\w+)\}/g, (token, name: string) =>
    values[name] === undefined ? token : String(values[name]),
  );
}

/** Translate known server states only; retain unknown states without guessing. */
export function applicationStatusLabel(
  status: string,
  locale: AppLanguage,
): string {
  const keys: Record<string, AppCopyKey> = {
    pending: "statusPending",
    screening: "statusScreening",
    interview: "statusInterview",
    offer: "statusOffer",
    hired: "statusHired",
    rejected: "statusRejected",
    withdrawn: "statusWithdrawn",
  };
  const key = keys[status.trim().toLowerCase()];
  return key ? appCopy(locale, key) : status;
}
