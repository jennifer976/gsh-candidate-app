import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshLinkRow, GshScreenIntro, GshSectionTitle } from "@/components/gsh-ui-kit";
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
          <GshScreenIntro
            eyebrow="Learn in the app"
            title="Resources & guides"
            subtitle="Topic guides mirror globalsponsorhub.com. Country corridors match the website. Partners and jobs open inside the app."
            style={{ marginBottom: 8 }}
          />

          <GshSectionTitle title="Visa orientation" topSpacing="none" />
          <GshLinkRow
            title="Visa wizard"
            subtitle="Interactive checklist — same logic as the website, runs entirely here."
            icon="sparkles-outline"
            accent="teal"
            onPress={() => router.push("/visa-wizard")}
          />

          <GshSectionTitle title="Jobs & hiring context" hint="Full-length guides — same copy as the website." />
          {SEO_PILLAR_NAV_LINKS.map((g) => (
            <Pressable
              key={g.href}
              style={[styles.pillarTile, cardSurfaceStyle(true)]}
              onPress={() => router.push({ pathname: "/guides/topic", params: { q: encodeURIComponent(g.href) } })}
              accessibilityRole="button"
            >
              <View style={styles.pillarAccent} />
              <View style={styles.pillarBody}>
                <Text style={styles.pillarTitle}>{g.label}</Text>
                <Text style={styles.pillarCta}>Open guide</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.brand} />
            </Pressable>
          ))}

          <GshSectionTitle title="Country corridors" />
          {countries.map((g) => (
            <Pressable
              key={g.slug}
              style={[styles.countryRow, cardSurfaceStyle(true)]}
              onPress={() => router.push(`/guides/country/${g.slug}`)}
              accessibilityRole="button"
            >
              <View style={styles.countryIcon}>
                <Ionicons name="earth-outline" size={22} color={colors.teal} />
              </View>
              <View style={styles.countryText}>
                <Text style={styles.countryEyebrow}>{g.countryLabel}</Text>
                <Text style={styles.countryTitle}>{g.title}</Text>
                <Text style={styles.countryExcerpt} numberOfLines={3}>
                  {g.excerpt}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.navy} />
            </Pressable>
          ))}

          <GshSectionTitle title="Move safely" />
          {RELOCATION_RESOURCES_NAV_LINKS.map((g) => (
            <Pressable
              key={g.href}
              style={[styles.pillarTile, cardSurfaceStyle(true)]}
              onPress={() => router.push({ pathname: "/guides/topic", params: { q: encodeURIComponent(g.href) } })}
              accessibilityRole="button"
            >
              <View style={[styles.pillarAccent, styles.pillarAccentPurple]} />
              <View style={styles.pillarBody}>
                <Text style={styles.pillarTitle}>{g.label}</Text>
                <Text style={styles.pillarCta}>Open checklist</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.brand} />
            </Pressable>
          ))}

          <GshSectionTitle title="More learning" />
          <GshLinkRow
            title="Tools & resources hub"
            subtitle="Blog, RSS headlines, FAQs, legal — all in-app from one place."
            icon="library-outline"
            accent="purple"
            onPress={() => router.push("/tools-resources")}
          />

          <Pressable style={styles.inlineBtn} onPress={() => navigateGuideLink(router, "/jobs")} accessibilityRole="button">
            <Text style={styles.inlineBtnText}>Go to Discover tab</Text>
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
  pad: { padding: 16, paddingBottom: 48, gap: 12 },
  pillarTile: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radii.lg,
    overflow: "hidden",
    marginBottom: 0,
    paddingRight: 8,
  },
  pillarAccent: { width: 4, alignSelf: "stretch", backgroundColor: colors.teal },
  pillarAccentPurple: { backgroundColor: colors.purple },
  pillarBody: { flex: 1, paddingVertical: 16, paddingHorizontal: 14 },
  pillarTitle: { fontSize: 15, fontFamily: fontFamily.bold, color: colors.navy, letterSpacing: -0.2 },
  pillarCta: { marginTop: 6, fontSize: 13, fontFamily: fontFamily.semiBold, color: colors.brand },
  countryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: radii.lg,
  },
  countryIcon: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: "rgba(14, 205, 209, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(14, 205, 209, 0.35)",
  },
  countryText: { flex: 1, minWidth: 0 },
  countryEyebrow: {
    fontSize: 12,
    fontFamily: fontFamily.semiBold,
    color: colors.teal,
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  countryTitle: { fontSize: 16, fontFamily: fontFamily.bold, color: colors.navy },
  countryExcerpt: { marginTop: 4, fontSize: 14, fontFamily: fontFamily.regular, color: colors.textMuted, lineHeight: 19 },
  inlineBtn: {
    alignSelf: "flex-start",
    marginTop: 4,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  inlineBtnText: { fontSize: 15, fontFamily: fontFamily.semiBold, color: colors.brand },
});
