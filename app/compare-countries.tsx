import { useRequestLabels } from "@/lib/i18n/useRequestLabels";
import { canonicalCountryCode } from "@/lib/countries";
import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshGradientPrimaryButton } from "@/components/GshGradientPrimaryButton";
import {
  GshContentAccentBar,
  GshLinkRow,
  GshScreenIntro,
  GshSectionTitle,
  GshTopicChip,
} from "@/components/gsh-ui-kit";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { COMPARE_COUNTRY_DESTINATIONS } from "@/lib/compareCountries/destinations";
import { stackScrollContentStyle } from "@/lib/screen-layout";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";

const DIMENSIONS = [
  {
    title: "Job opportunities",
    body: "Search for your role and skills. Read each job\u2019s sponsorship and relocation details.",
  },
  {
    title: "Work permission",
    body: "Check official requirements for your circumstances. A job match does not confirm visa eligibility.",
  },
  {
    title: "Time and preparation",
    body: "Check documents, processing times and whether your qualifications need recognition before paying fees.",
  },
  {
    title: "Moving with family",
    body: "Check schools, childcare, healthcare and whether your partner can work.",
  },
  {
    title: "Pay and living costs",
    body: "Compare take-home pay with rent, travel and daily costs in the city you are considering.",
  },
];

export default function CompareCountriesScreen() {
  const ac = useAccountCopy();

  const { country } = useRequestLabels();
  const router = useRouter();

  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <ScrollView
          contentContainerStyle={styles.pad}
          showsVerticalScrollIndicator={false}
        >
          <GshScreenIntro
            eyebrow={ac("Countries")}
            title={ac("Choose where to move")}
            subtitle={ac(
              "Compare countries using the things that matter to you. Start with jobs, everyday costs and your family’s needs.",
            )}
            style={{ marginBottom: 10 }}
          />
          <GshContentAccentBar />

          <GshSectionTitle title={ac("What to compare")} topSpacing="sm" />
          {DIMENSIONS.map((d) => (
            <View
              key={d.title}
              style={[styles.dimCard, cardSurfaceStyle(true)]}
            >
              <Text style={styles.dimTitle}>{ac(d.title)}</Text>
              <Text style={styles.dimBody}>{ac(d.body)}</Text>
            </View>
          ))}

          <GshSectionTitle
            title={ac("Explore a country")}
            hint={ac(
              "Read a country guide, then search jobs that fit your plans.",
            )}
            topSpacing="md"
          />
          <View style={styles.chipRow}>
            {COMPARE_COUNTRY_DESTINATIONS.map((dest) => (
              <GshTopicChip
                key={dest.slug}
                label={country(canonicalCountryCode(dest.label) || dest.label)}
                onPress={() => {
                  if (dest.guideSlug) {
                    router.push(`/guides/country/${dest.guideSlug}`);
                  } else {
                    router.push({
                      pathname: "/(tabs)/jobs",
                      params: { location: dest.jobsLocation },
                    });
                  }
                }}
              />
            ))}
          </View>

          <View style={styles.ctaBlock}>
            <GshGradientPrimaryButton
              title={ac("Search jobs")}
              onPress={() => router.push("/(tabs)/jobs")}
            />
            <GshLinkRow
              title={ac("Currency converter")}
              subtitle={ac("Compare amounts in different currencies")}
              icon="cash-outline"
              accent="teal"
              onPress={() => router.push("/currency-converter")}
            />
            <GshLinkRow
              title={ac("Guides and resources")}
              subtitle={ac(
                "Read a country guide, then search jobs that fit your plans.",
              )}
              icon="map-outline"
              accent="teal"
              onPress={() => router.push("/guides")}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </GshScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  pad: { ...stackScrollContentStyle, paddingBottom: 48, gap: 10 },
  updated: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 4,
  },
  dimCard: { padding: 14, borderRadius: radii.lg },
  dimTitle: { fontFamily: fontFamily.bold, fontSize: 15, color: colors.navy },
  dimBody: {
    marginTop: 6,
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textMuted,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  ctaBlock: { marginTop: 12, gap: 10 },
  faqCard: { padding: 14, borderRadius: radii.lg },
  faqQ: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.navy },
  faqA: {
    marginTop: 6,
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textMuted,
  },
});
