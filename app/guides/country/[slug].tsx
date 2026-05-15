import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshNavyHeroCard, GshScreenIntro, GshSectionTitle } from "@/components/gsh-ui-kit";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { getCountryVisaGuide } from "@/lib/guides/countryVisaGuides";
import { navigateGuideLink } from "@/lib/guides/navigateGuideLink";
import { openExternalUrlInApp } from "@/lib/openMarketingBrowser";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";

export default function CountryGuideDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const guide = getCountryVisaGuide(String(slug || ""));

  if (!guide) {
    return (
      <GshScreenBackground>
        <SafeAreaView style={styles.safe} edges={["bottom"]}>
          <View style={styles.empty}>
            <GshScreenIntro eyebrow="Guides" title="Guide not found" subtitle="That country guide is not in this build yet." />
            <Pressable style={styles.backBtn} onPress={() => router.back()} accessibilityRole="button">
              <Text style={styles.backBtnText}>Go back</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </GshScreenBackground>
    );
  }

  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
          <GshNavyHeroCard badge={guide.countryLabel} title={guide.title} footer={<Text style={styles.heroUpdated}>Updated {guide.updatedISO}</Text>}>
            {guide.excerpt}
          </GshNavyHeroCard>

          <Text style={styles.disclaimer}>
            Educational overview — not immigration or legal advice. Confirm requirements with official government sources.
          </Text>

          {guide.sections.map((sec) => (
            <View key={sec.heading} style={[styles.sectionCard, cardSurfaceStyle(true)]}>
              <Text style={styles.sectionHeading}>{sec.heading}</Text>
              {sec.paragraphs.map((p, i) => (
                <Text key={`${sec.heading}-${i}`} style={styles.p}>
                  {p}
                </Text>
              ))}
            </View>
          ))}

          {guide.partnerLinks?.length ? (
            <View style={styles.linksBlock}>
              <GshSectionTitle title="Next steps" topSpacing="sm" />
              {guide.partnerLinks.map((pl) => (
                <Pressable
                  key={pl.href + pl.label}
                  style={[styles.linkRow, cardSurfaceStyle(true)]}
                  onPress={() => {
                    const h = pl.href.trim();
                    if (/^https?:\/\//i.test(h)) {
                      try {
                        openExternalUrlInApp(h);
                      } catch {
                        /* invalid URL */
                      }
                    } else navigateGuideLink(router, pl.href);
                  }}
                  accessibilityRole="button"
                >
                  <Ionicons name="arrow-forward-circle-outline" size={22} color={colors.brand} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.linkLabel}>{pl.label}</Text>
                    {pl.hint ? <Text style={styles.linkHint}>{pl.hint}</Text> : null}
                  </View>
                </Pressable>
              ))}
            </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </GshScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  pad: { padding: 16, paddingBottom: 48, gap: 14 },
  heroUpdated: { fontSize: 12, fontFamily: fontFamily.medium, color: "rgba(255,255,255,0.85)" },
  disclaimer: {
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    lineHeight: 19,
    paddingHorizontal: 4,
  },
  sectionCard: { padding: 16, borderRadius: radii.lg },
  sectionHeading: {
    fontSize: 17,
    fontFamily: fontFamily.bold,
    color: colors.navy,
    marginBottom: 10,
  },
  p: {
    fontSize: 15,
    fontFamily: fontFamily.regular,
    color: colors.textMarketing,
    lineHeight: 23,
    marginBottom: 10,
  },
  linksBlock: { marginTop: 4, gap: 10 },
  linkRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: radii.lg,
  },
  linkLabel: { fontSize: 15, fontFamily: fontFamily.semiBold, color: colors.navy },
  linkHint: { marginTop: 4, fontSize: 13, fontFamily: fontFamily.regular, color: colors.textMuted, lineHeight: 18 },
  empty: { flex: 1, justifyContent: "center", alignItems: "stretch", padding: 24 },
  backBtn: { marginTop: 20, paddingVertical: 12, paddingHorizontal: 20, alignSelf: "center" },
  backBtnText: { color: colors.brand, fontFamily: fontFamily.semiBold, fontSize: 16 },
});
