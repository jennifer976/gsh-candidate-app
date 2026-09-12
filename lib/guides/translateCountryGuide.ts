import reviewedNewZealand from "@/data/reviewedNewZealandGuideTranslations.json";
import reviewedSingapore from "@/data/reviewedSingaporeGuideTranslations.json";
import reviewedUae from "@/data/reviewedUaeGuideTranslations.json";
import reviewedUsa from "@/data/reviewedUsaGuideTranslations.json";
import reviewedAustralia from "@/data/reviewedAustraliaGuideTranslations.json";
import reviewedCanada from "@/data/reviewedCanadaGuideTranslations.json";
import reviewedNetherlands from "@/data/reviewedNetherlandsGuideTranslations.json";
import reviewedGermany from "@/data/reviewedGermanyGuideTranslations.json";
import reviewedIreland from "@/data/reviewedIrelandGuideTranslations.json";
import reviewedUk from "@/data/reviewedUkGuideTranslations.json";
import source from "@/data/countryGuideTranslationSource.json";
import translations from "@/data/countryGuideTranslations.json";
import type { AppLanguage } from "@/lib/i18n/catalog";
import type { CountryVisaGuide } from "./countryVisaGuides";

export type LocalizedCountryGuide = CountryVisaGuide & {
  contentLanguage: AppLanguage;
};

function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map(
        (key) =>
          `${JSON.stringify(key)}:${stable((value as Record<string, unknown>)[key])}`,
      )
      .join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}

/** A translation is valid only for the exact source content it was prepared from. */
export function translateCountryGuide(
  guide: CountryVisaGuide,
  locale: AppLanguage,
): LocalizedCountryGuide {
  const original = source.guides.find((item) => item.slug === guide.slug);
  if (locale === "en" || !original || stable(original) !== stable(guide)) {
    return { ...guide, contentLanguage: "en" };
  }
  const reviewed = [reviewedUk, reviewedIreland, reviewedGermany, reviewedNetherlands, reviewedCanada, reviewedAustralia, reviewedUsa, reviewedUae, reviewedSingapore, reviewedNewZealand].find((entry) => entry.en.slug === guide.slug);
  if (reviewed) return { ...reviewed[locale], contentLanguage: locale };
  const copy = translations[locale];
  const iso = guide.iso2 as keyof typeof copy.countries;
  const country = copy.countries[iso];
  if (
    !country ||
    guide.sections.length !== 3 ||
    guide.partnerLinks.length !== 3
  ) {
    return { ...guide, contentLanguage: "en" };
  }
  return {
    ...guide,
    contentLanguage: locale,
    countryLabel: country,
    title: copy.title.replace("{country}", country),
    excerpt: copy.excerpt,
    metaDescription: copy.excerpt,
    openingHook: copy.opening,
    quickFacts: [
      { label: copy.start, value: copy.rights },
      { label: copy.support, value: copy.confirm },
    ],
    sections: [
      {
        heading: copy.beforeApply,
        paragraphs: [copy[iso], copy.official],
        bullets: [
          { label: copy.role, text: copy.roleText },
          { label: copy.support, text: copy.supportText },
        ],
      },
      {
        heading: copy.beforeAccept,
        bullets: [
          { label: copy.offer, text: copy.offerText },
          { label: copy.move, text: copy.moveText },
          { label: copy.household, text: copy.householdText },
        ],
      },
      {
        heading: copy.practical,
        paragraphs: [copy.budget, copy.specialistsText],
        bullets: [{ label: copy.offers, text: copy.offersText }],
      },
    ],
    partnerLinks: guide.partnerLinks.map((link, index) => ({
      ...link,
      label: [
        copy.jobsLink.replace("{country}", country),
        copy.specialistsLink,
        copy.perksLink,
      ][index],
    })),
  };
}
