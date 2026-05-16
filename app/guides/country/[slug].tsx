import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshNavyHeroCard, GshScreenIntro, GshSectionTitle } from "@/components/gsh-ui-kit";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { getCountryVisaGuide } from "@/lib/guides/countryVisaGuides";
import { navigateGuideLink } from "@/lib/guides/navigateGuideLink";
import { openExternalUrlInApp } from "@/lib/openMarketingBrowser";
import { stackScrollContentStyle } from "@/lib/screen-layout";
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
          <GshNavyHeroCard
            badge={`${guide.flagEmoji ? `${guide.flagEmoji} ` : ""}${guide.countryLabel}`}
            title={guide.title}
            footer={<Text style={styles.heroUpdated}>Updated {guide.updatedISO}</Text>}
          >
            {guide.openingHook ? (
              <Text style={styles.heroHook}>{guide.openingHook}</Text>
            ) : (
              <Text style={styles.heroLead}>{guide.excerpt}</Text>
            )}
          </GshNavyHeroCard>

          {guide.quickFacts.length > 0 ? (
            <View style={[styles.quickFactsCard, cardSurfaceStyle(false)]}>
              <Text style={styles.quickFactsEyebrow}>Quick facts</Text>
              <View style={styles.quickFactsGrid}>
                {guide.quickFacts.map((f) => (
                  <View key={f.label} style={styles.quickFactCell}>
                    <Text style={styles.quickFactLabel}>{f.label}</Text>
                    <Text style={styles.quickFactValue}>{f.value}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          <Text style={styles.disclaimer}>
            Educational overview — not immigration or legal advice. Confirm requirements with official government sources.
          </Text>

          {guide.sections.map((sec, si) => (
            <View key={`${si}-${sec.heading}`} style={[styles.sectionCard, cardSurfaceStyle(true)]}>
              <Text style={styles.sectionHeading}>{sec.heading}</Text>
              {sec.bullets && sec.bullets.length > 0 ? (
                <View style={styles.bulletList}>
                  {sec.bullets.map((b, bi) => (
                    <View key={`${si}-b-${bi}`} style={styles.bulletRow}>
                      <View style={styles.bulletDot} />
                      <Text style={styles.bulletText}>
                        <Text style={styles.bulletLead}>{b.label}</Text>
                        {": "}
                        {b.text}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}
              {(sec.paragraphs ?? []).map((p, i) => (
                <Text key={`${si}-p-${i}`} style={styles.p}>
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
  pad: { ...stackScrollContentStyle, gap: 14 },
  heroUpdated: { fontSize: 12, fontFamily: fontFamily.medium, color: "rgba(255,255,255,0.85)" },
  heroHook: {
    fontSize: 15,
    fontFamily: fontFamily.medium,
    color: "rgba(255,255,255,0.92)",
    lineHeight: 23,
  },
  heroLead: {
    fontSize: 15,
    fontFamily: fontFamily.regular,
    color: "rgba(255,255,255,0.82)",
    lineHeight: 23,
  },
  quickFactsCard: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    borderRadius: radii.xl,
    gap: 10,
  },
  quickFactsEyebrow: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    letterSpacing: 1.2,
    color: colors.textMuted,
    textTransform: "uppercase",
  },
  quickFactsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -8,
    marginTop: 4,
  },
  quickFactCell: {
    width: "50%",
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  quickFactLabel: {
    fontSize: 11,
    fontFamily: fontFamily.medium,
    color: colors.textMuted,
  },
  quickFactValue: {
    marginTop: 4,
    fontSize: 14,
    fontFamily: fontFamily.bold,
    color: colors.navy,
  },
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
  bulletList: { gap: 12, marginBottom: 4 },
  bulletRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  bulletDot: {
    marginTop: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(14, 205, 209, 0.75)",
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    fontFamily: fontFamily.regular,
    color: colors.textMarketing,
    lineHeight: 23,
  },
  bulletLead: {
    fontFamily: fontFamily.bold,
    color: colors.navy,
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
