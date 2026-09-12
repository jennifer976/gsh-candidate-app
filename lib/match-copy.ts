import type { AppLanguage } from "./i18n/catalog";
import en from "./i18n/matching/en.json";
import fr from "./i18n/matching/fr.json";
import de from "./i18n/matching/de.json";
import es from "./i18n/matching/es.json";
import pt from "./i18n/matching/pt.json";
import it from "./i18n/matching/it.json";
import nl from "./i18n/matching/nl.json";
import pl from "./i18n/matching/pl.json";
const catalogues = { en, fr, de, es, pt, it, nl, pl };
export function matchCopy(locale: AppLanguage, key: string): string {
  const copy = catalogues[locale];
  return Object.prototype.hasOwnProperty.call(copy, key)
    ? copy[key as keyof typeof en] : copy.unknown;
}
