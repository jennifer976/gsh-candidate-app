import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { listCountryVisaGuideSummaries } from "@/lib/guides/countryVisaGuides";
import { navigateGuideLink } from "@/lib/guides/navigateGuideLink";
import { RELOCATION_RESOURCES_NAV_LINKS, SEO_PILLAR_NAV_LINKS } from "@/lib/guides/seoGuideNav";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";

export default function GuidesHubScreen() {
  const router = useRouter();
  const countries = listCountryVisaGuideSummaries();

  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
          <View style={[styles.hero, cardSurfaceStyle(true)]}>
            <Text style={styles.heroEyebrow}>Learn in the app</Text>
            <Text style={styles.heroTitle}>Resources & guides</Text>
            <Text style={styles.heroBody}>
              Topic guides use the same articles as globalsponsorhub.com (intro, sections, FAQs, and tables). Country corridor
              guides match the website word-for-word. The partner directory shortcut opens inside the app.
            </Text>
          </View>

          <Text style={styles.section}>Visa orientation</Text>
          <Pressable
            style={[styles.row, cardSurfaceStyle(true)]}
            onPress={() => router.push("/visa-wizard")}
            accessibilityRole="button"
          >
            <View style={styles.iconCircle}>
              <Ionicons name="sparkles-outline" size={22} color={colors.brand} />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Visa wizard</Text>
              <Text style={styles.rowSub}>Interactive checklist — same logic as the website, runs entirely here.</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.placeholder} />
          </Pressable>

          <Text style={styles.section}>Jobs & hiring context</Text>
          <Text style={styles.sectionHint}>Full-length guides — same copy as the website.</Text>
          {SEO_PILLAR_NAV_LINKS.map((g) => (
            <Pressable
              key={g.href}
              style={[styles.tile, cardSurfaceStyle(true)]}
              onPress={() =>
                router.push({ pathname: "/guides/topic", params: { q: encodeURIComponent(g.href) } })
              }
              accessibilityRole="button"
            >
              <Text style={styles.tileTitle}>{g.label}</Text>
              <Text style={styles.tileSub}>Open guide →</Text>
            </Pressable>
          ))}

          <Text style={styles.section}>Country corridors</Text>
          {countries.map((g) => (
            <Pressable
              key={g.slug}
              style={[styles.row, cardSurfaceStyle(true)]}
              onPress={() => router.push(`/guides/country/${g.slug}`)}
              accessibilityRole="button"
            >
              <View style={styles.iconCircleMuted}>
                <Ionicons name="earth-outline" size={22} color={colors.teal} />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.tileEyebrow}>{g.countryLabel}</Text>
                <Text style={styles.rowTitle}>{g.title}</Text>
                <Text style={styles.rowSub} numberOfLines={3}>
                  {g.excerpt}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.placeholder} />
            </Pressable>
          ))}

          <Text style={styles.section}>Move safely</Text>
          {RELOCATION_RESOURCES_NAV_LINKS.map((g) => (
            <Pressable
              key={g.href}
              style={[styles.tile, cardSurfaceStyle(true)]}
              onPress={() =>
                router.push({ pathname: "/guides/topic", params: { q: encodeURIComponent(g.href) } })
              }
              accessibilityRole="button"
            >
              <Text style={styles.tileTitle}>{g.label}</Text>
              <Text style={styles.tileSub}>Open checklist →</Text>
            </Pressable>
          ))}

          <Text style={styles.section}>More learning</Text>
          <Pressable
            style={[styles.rowMuted, cardSurfaceStyle(true)]}
            onPress={() => router.push("/learn")}
            accessibilityRole="button"
          >
            <Ionicons name="library-outline" size={22} color={colors.textMuted} />
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Guides & resources hub</Text>
              <Text style={styles.rowSub}>Blog, RSS headlines, FAQs, legal — all in-app from one place.</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.placeholder} />
          </Pressable>

          <Pressable style={styles.inlineBtn} onPress={() => navigateGuideLink(router, "/jobs")} accessibilityRole="button">
            <Text style={styles.inlineBtnText}>Go to Jobs tab</Text>
          </Pressable>
          <Pressable
            style={styles.inlineBtn}
            onPress={() => navigateGuideLink(router, "/partners/directory")}
            accessibilityRole="button"
          >
            <Text style={styles.inlineBtnText}>Partner directory</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </GshScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  pad: { padding: 16, paddingBottom: 48, gap: 10 },
  hero: {
    padding: 18,
    marginBottom: 6,
    borderLeftWidth: 4,
    borderLeftColor: colors.teal,
  },
  heroEyebrow: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 22,
    fontFamily: fontFamily.extraBold,
    color: colors.textPrimary,
    letterSpacing: -0.35,
    marginBottom: 10,
  },
  heroBody: {
    fontSize: 15,
    fontFamily: fontFamily.regular,
    color: colors.textMarketing,
    lineHeight: 22,
  },
  section: {
    marginTop: 18,
    marginBottom: 8,
    fontSize: 12,
    fontFamily: fontFamily.bold,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  sectionHint: {
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    lineHeight: 19,
    marginBottom: 8,
    marginTop: -4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  rowMuted: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    opacity: 0.95,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: colors.purpleMuted,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.purpleBorder,
  },
  iconCircleMuted: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: "rgba(14, 205, 209, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(14, 205, 209, 0.35)",
  },
  rowText: { flex: 1, minWidth: 0 },
  tileEyebrow: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: colors.teal,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  rowTitle: { fontSize: 16, fontFamily: fontFamily.bold, color: colors.textPrimary },
  rowSub: { marginTop: 4, fontSize: 14, fontFamily: fontFamily.regular, color: colors.textMuted, lineHeight: 19 },
  tile: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: radii.sm,
  },
  tileTitle: { fontSize: 15, fontFamily: fontFamily.semiBold, color: colors.textPrimary },
  tileSub: { marginTop: 6, fontSize: 13, fontFamily: fontFamily.medium, color: colors.brand },
  inlineBtn: {
    alignSelf: "flex-start",
    marginTop: 6,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  inlineBtnText: { fontSize: 15, fontFamily: fontFamily.semiBold, color: colors.brand },
});
