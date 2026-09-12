import { useMemo } from "react";
import { useAppCopy } from "@/lib/i18n";
import { translateCountryGuide } from "./translateCountryGuide";
import { useQuery } from "@tanstack/react-query";
import { getMarketingSiteUrl } from "@/lib/config";
import {
  COUNTRY_VISA_GUIDES,
  type CountryVisaGuide,
} from "./countryVisaGuides";
const text = (v: unknown): v is string =>
  typeof v === "string" && v.length <= 12000;
export function validGuide(value: unknown): value is CountryVisaGuide {
  if (!value || typeof value !== "object") return false;
  const g = value as CountryVisaGuide;
  const baseline = COUNTRY_VISA_GUIDES.find((item) => item.slug === g.slug);
  return (
    !!baseline &&
    g.iso2 === baseline.iso2 &&
    g.officialSourceUrl === baseline.officialSourceUrl &&
    [
      g.title,
      g.countryLabel,
      g.excerpt,
      g.metaDescription,
      g.openingHook,
      g.updatedISO,
      g.flagEmoji,
    ].every(text) &&
    Date.parse(g.updatedISO) >= Date.parse(baseline.updatedISO) &&
    Array.isArray(g.quickFacts) &&
    g.quickFacts.length <= 12 &&
    g.quickFacts.every((f) => f && text(f.label) && text(f.value)) &&
    Array.isArray(g.sections) &&
    g.sections.length <= 20 &&
    g.sections.every(
      (s) =>
        s &&
        text(s.heading) &&
        (!s.paragraphs ||
          (Array.isArray(s.paragraphs) && s.paragraphs.every(text))) &&
        (!s.bullets ||
          (Array.isArray(s.bullets) &&
            s.bullets.every((v) => v && text(v.label) && text(v.text)))) &&
        (!s.sources ||
          (Array.isArray(s.sources) && s.sources.length <= 8 &&
            s.sources.every((url) => baseline.sections.some((section) => section.sources?.includes(url))))) &&
        !s.pathway &&
        !s.callout &&
        !s.prosCons,
    ) &&
    Array.isArray(g.partnerLinks) &&
    g.partnerLinks.every(
      (l) =>
        l &&
        text(l.label) &&
        text(l.href) &&
        /^\/(jobs\?|specialists$|relocation-perks$)/.test(l.href),
    )
  );
}
export function useCountryGuides() {
  const { locale } = useAppCopy();
  const query = useQuery({
    queryKey: ["country-guides", 1],
    staleTime: 3600000,
    retry: false,
    queryFn: async () => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);
      try {
        const response = await fetch(
          `${getMarketingSiteUrl()}/api/mobile-content/country-guides`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error("Guide feed unavailable");
        const body = await response.json();
        if (
          body?.version !== 1 ||
          !Array.isArray(body.guides) ||
          body.guides.length !== COUNTRY_VISA_GUIDES.length ||
          !body.guides.every(validGuide) ||
          new Set(body.guides.map((g: CountryVisaGuide) => g.slug)).size !==
            body.guides.length
        )
          throw new Error("Invalid guide feed");
        return body.guides as CountryVisaGuide[];
      } finally {
        clearTimeout(timer);
      }
    },
  });
  const guides = useMemo(
    () =>
      (query.data ?? COUNTRY_VISA_GUIDES).map((guide) =>
        translateCountryGuide(guide, locale),
      ),
    [query.data, locale],
  );
  return { guides, offline: query.isError };
}
