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
                  <View style={styles.titleRow}>
                    <Text
                      style={styles.cardTitle}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.8}
                    >
                      {ac(country.name)}
                    </Text>
                    <Text style={styles.currency}>{country.currencyCode}</Text>
                  </View>
                  <Text style={styles.cardBlurb} numberOfLines={2}>
                    {ac(country.blurb)}
                  </Text>
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
    minHeight: 92,
  },
  flagWell: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: colors.pale,
  },
  cardBody: { flex: 1, minWidth: 0 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardTitle: {
    flexShrink: 1,
    fontSize: 17,
    fontFamily: fontFamily.heading,
    color: colors.navy,
    letterSpacing: -0.2,
  },
  currency: {
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.pill,
    backgroundColor: colors.pale,
    fontSize: 10,
    fontFamily: fontFamily.bold,
    color: colors.navy,
  },
  cardBlurb: {
    marginTop: 4,
    minHeight: 36,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
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
