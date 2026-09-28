import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CountryFlag } from "@/components/CountryFlag";
import { BrandLinkRow, DepthPressable, Eyebrow, PosterTitle, posterParts } from "@/components/gsh-brand";
import { GshScreenShell } from "@/components/GshScreenShell";
import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { PUBLIC_COUNTRIES } from "@/lib/publicResources";
import { stackScrollContentStyle } from "@/lib/screen-layout";
import { colors, fontFamily, radii } from "@/lib/theme";

export default function CountriesScreen() {
  const ac = useAccountCopy();
  const router = useRouter();

  return (
    <GshScreenShell constrainTabletWidth style={styles.shell}>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
          <Eyebrow>{ac("Destination discovery")}</Eyebrow>
          <PosterTitle {...posterParts(ac("Know before|you go."))} size={34} />
          <Text style={styles.intro}>
            {ac("Explore jobs, everyday life and the practical steps of a move. Find a place that fits you.")}
          </Text>

          <BrandLinkRow
            icon="git-compare-outline"
            label={ac("Compare destinations")}
            hint={ac("Two or three countries, side by side.")}
            onPress={() => router.push("/compare-countries")}
          />

          <View style={styles.list}>
            {PUBLIC_COUNTRIES.map((country) => (
              <DepthPressable
                key={country.slug}
                onPress={() => router.push(`/country/${country.slug}`)}
                depth={4}
                radius={20}
                borderWidth={2}
                borderColor={colors.navy}
                accessibilityLabel={ac(country.name)}
                innerStyle={styles.card}
              >
                <View style={styles.flagWell}>
                  <CountryFlag iso2={country.iso2} />
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>{ac(country.name)}</Text>
                  <Text style={styles.cardBlurb}>{ac(country.blurb)}</Text>
                  <View style={styles.chips}>
                    <Text style={styles.chip}>{ac(country.pathType)}</Text>
                    <Text style={styles.chipOutline}>{country.currencyCode}</Text>
                  </View>
                </View>
                <View style={styles.arrow}>
                  <Ionicons name="arrow-forward" size={16} color={colors.navy} />
                </View>
              </DepthPressable>
            ))}
          </View>

          <Text style={styles.disclaimer}>
            {ac("Country information on Global Sponsor Hub is general guidance, not legal or immigration advice, and is not a government decision. Confirm current requirements with official immigration sources before you act.")}
          </Text>
        </ScrollView>
      </SafeAreaView>
    </GshScreenShell>
  );
}

const styles = StyleSheet.create({
  shell: { backgroundColor: colors.white },
  safe: { flex: 1 },
  pad: { ...stackScrollContentStyle, gap: 12, paddingBottom: 40 },
  intro: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  list: { gap: 12, marginTop: 8 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
  },
  flagWell: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: colors.pale,
  },
  cardBody: { flex: 1, minWidth: 0 },
  cardTitle: { fontSize: 17, fontFamily: fontFamily.heading, color: colors.navy, letterSpacing: -0.2 },
  cardBlurb: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  chip: {
    overflow: "hidden",
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: radii.pill,
    backgroundColor: colors.cyan,
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: colors.navy,
  },
  chipOutline: {
    overflow: "hidden",
    paddingHorizontal: 9,
    paddingVertical: 2,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.navy,
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: colors.navy,
  },
  arrow: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.cyan,
    alignItems: "center",
    justifyContent: "center",
  },
  disclaimer: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
  },
});
