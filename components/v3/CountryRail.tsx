import { ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { CountryCard } from "@/components/v3/CountryCard";
import {
  GUIDE_COUNTRY_SLUG_BY_CODE,
  GUIDE_JOBS_LOCATION_BY_CODE,
} from "@/lib/guideCountryCodes";
import { COUNTRY_PHOTO } from "@/lib/sitePhotos";

const PRIORITY_SLUGS = ["uk", "canada", "australia", "germany", "usa", "uae"] as const;

const CODE_BY_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(GUIDE_COUNTRY_SLUG_BY_CODE).map(([code, slug]) => [slug, code]),
);

type RailCountry = {
  slug: string;
  name: string;
  iso2: string;
  location: string;
};

function buildRailCountries(): RailCountry[] {
  const all = Object.keys(COUNTRY_PHOTO).map((slug) => {
    const code = CODE_BY_SLUG[slug] ?? "";
    const location = GUIDE_JOBS_LOCATION_BY_CODE[code] ?? slug;
    return {
      slug,
      name: location,
      iso2: code.toLowerCase(),
      location,
    };
  });

  const priority = PRIORITY_SLUGS.map((slug) =>
    all.find((c) => c.slug === slug),
  ).filter((c): c is RailCountry => Boolean(c));

  const prioritySet = new Set<string>(PRIORITY_SLUGS);
  const rest = all
    .filter((c) => !prioritySet.has(c.slug))
    .sort((a, b) => a.name.localeCompare(b.name));

  return [...priority, ...rest];
}

const RAIL_COUNTRIES = buildRailCountries();
const CARD_W = 168;

export function CountryRail({
  onSelectCountry,
}: {
  onSelectCountry?: (slug: string, location: string) => void;
}) {
  const router = useRouter();

  return (
    <ScrollView
      horizontal
      nestedScrollEnabled
      showsHorizontalScrollIndicator={false}
      decelerationRate="fast"
      snapToInterval={CARD_W + 12}
      contentContainerStyle={{
        gap: 12,
        paddingTop: 16,
        paddingHorizontal: 8,
        paddingBottom: 12,
      }}
    >
      {RAIL_COUNTRIES.map((c) => (
        <View key={c.slug}>
          <CountryCard
            slug={c.slug}
            name={c.name}
            iso2={c.iso2}
            onPress={() => {
              if (onSelectCountry) {
                onSelectCountry(c.slug, c.location);
                return;
              }
              router.push({
                pathname: "/(tabs)/jobs",
                params: { location: c.location },
              });
            }}
          />
        </View>
      ))}
    </ScrollView>
  );
}
