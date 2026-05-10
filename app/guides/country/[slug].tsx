import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { getCountryVisaGuide } from "@/lib/guides/countryVisaGuides";
import * as Linking from "expo-linking";
import { navigateGuideLink } from "@/lib/guides/navigateGuideLink";
import { openExternalHttpsUrl } from "@/lib/openMarketingBrowser";
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
            <Text style={styles.emptyTitle}>Guide not found</Text>
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
          <View style={[styles.hero, cardSurfaceStyle(true)]}>
            <Text style={styles.eyebrow}>{guide.countryLabel}</Text>
            <Text style={styles.title}>{guide.title}</Text>
            <Text style={styles.excerpt}>{guide.excerpt}</Text>
            <Text style={styles.updated}>Updated {guide.updatedISO}</Text>
          </View>

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
              <Text style={styles.linksHeading}>Next steps</Text>
              {guide.partnerLinks.map((pl) => (
                <Pressable
                  key={pl.href + pl.label}
                  style={[styles.linkRow, cardSurfaceStyle(true)]}
                  onPress={() => {
                    const h = pl.href.trim();
                    if (/^https:\/\//i.test(h)) void openExternalHttpsUrl(h);
                    else if (/^http:\/\//i.test(h)) void Linking.openURL(h);
                    else navigateGuideLink(router, pl.href);
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
  hero: { padding: 18, borderLeftWidth: 4, borderLeftColor: colors.teal },
  eyebrow: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
    color: colors.teal,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontFamily: fontFamily.extraBold,
    color: colors.textPrimary,
    letterSpacing: -0.35,
    marginBottom: 10,
  },
  excerpt: { fontSize: 15, fontFamily: fontFamily.regular, color: colors.textMarketing, lineHeight: 23 },
  updated: { marginTop: 12, fontSize: 12, fontFamily: fontFamily.medium, color: colors.textMuted },
  disclaimer: {
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    lineHeight: 19,
    paddingHorizontal: 4,
  },
  sectionCard: { padding: 16, borderRadius: radii.md },
  sectionHeading: {
    fontSize: 17,
    fontFamily: fontFamily.bold,
    color: colors.textPrimary,
    marginBottom: 10,
  },
  p: {
    fontSize: 15,
    fontFamily: fontFamily.regular,
    color: colors.textMarketing,
    lineHeight: 23,
    marginBottom: 10,
  },
  linksBlock: { marginTop: 8, gap: 10 },
  linksHeading: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.75,
    marginBottom: 4,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  linkLabel: { fontSize: 15, fontFamily: fontFamily.semiBold, color: colors.textPrimary },
  linkHint: { marginTop: 4, fontSize: 13, fontFamily: fontFamily.regular, color: colors.textMuted, lineHeight: 18 },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  emptyTitle: { fontSize: 17, fontFamily: fontFamily.semiBold, color: colors.textPrimary, marginBottom: 16 },
  backBtn: { paddingVertical: 12, paddingHorizontal: 20 },
  backBtnText: { color: colors.brand, fontFamily: fontFamily.semiBold, fontSize: 16 },
});
