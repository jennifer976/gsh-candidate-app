import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshScreenIntro, GshSectionTitle } from "@/components/gsh-ui-kit";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { PillarGuideContent } from "@/components/PillarGuideContent";
import { navigateGuideLink } from "@/lib/guides/navigateGuideLink";
import { getPillarPageByPath } from "@/lib/guides/seo/getPillarByPath";
import { getGuideTopicStub } from "@/lib/guides/topicStubs";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";

export default function GuideTopicScreen() {
  const router = useRouter();
  const { q } = useLocalSearchParams<{ q: string }>();
  const hrefRaw = decodeURIComponent(typeof q === "string" ? q : "");
  const pillar = getPillarPageByPath(hrefRaw);
  const stub = getGuideTopicStub(hrefRaw);

  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
          {pillar ? (
            <>
              <View style={[styles.card, cardSurfaceStyle(true)]}>
                <PillarGuideContent config={pillar} router={router} />
              </View>
              <Pressable style={styles.linkBtn} onPress={() => router.push("/guides")} accessibilityRole="button">
                <Text style={styles.linkBtnText}>Browse more guides</Text>
              </Pressable>
              <Pressable style={styles.linkBtn} onPress={() => navigateGuideLink(router, "/jobs")} accessibilityRole="button">
                <Text style={styles.linkBtnText}>Back to Jobs tab</Text>
              </Pressable>
              <Pressable style={styles.linkBtn} onPress={() => navigateGuideLink(router, "/partners/directory")} accessibilityRole="button">
                <Text style={styles.linkBtnText}>Partner directory</Text>
              </Pressable>
            </>
          ) : !stub ? (
            <View style={[styles.card, cardSurfaceStyle(true)]}>
              <GshScreenIntro
                eyebrow="Guides"
                title="Topic unavailable"
                subtitle="Pick another topic from the guides hub, or use Jobs and Partners from the app for listings and firms."
                style={{ marginBottom: 12 }}
              />
              <Pressable style={styles.primaryOutline} onPress={() => router.push("/guides")} accessibilityRole="button">
                <Text style={styles.primaryOutlineText}>Back to guides hub</Text>
              </Pressable>
              <Pressable style={[styles.primaryOutline, styles.primaryOutlineSpaced]} onPress={() => router.push("/faq")} accessibilityRole="button">
                <Text style={styles.primaryOutlineText}>Open FAQs</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <View style={[styles.card, cardSurfaceStyle(true)]}>
                <Text style={styles.title}>{stub.title}</Text>
                <Text style={styles.body}>{stub.intro}</Text>
              </View>
              <View style={[styles.card, cardSurfaceStyle(true)]}>
                <GshSectionTitle title="Key points" topSpacing="none" style={{ marginTop: 0, marginBottom: 10 }} />
                {stub.bullets.map((b, i) => (
                  <View key={i} style={styles.bulletRow}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.bulletText}>{b}</Text>
                  </View>
                ))}
              </View>
              <Pressable style={styles.primaryOutline} onPress={() => navigateGuideLink(router, "/partners/directory")} accessibilityRole="button">
                <Text style={styles.primaryOutlineText}>Open partner directory in app</Text>
              </Pressable>
              <Text style={styles.footerHint}>Short overview — open Partners from More or above for the full directory.</Text>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </GshScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  pad: { padding: 16, paddingBottom: 40, gap: 14 },
  card: { padding: 18, borderRadius: radii.lg },
  title: {
    fontSize: 22,
    fontFamily: fontFamily.extraBold,
    color: colors.navy,
    letterSpacing: -0.35,
    marginBottom: 12,
  },
  body: { fontSize: 15, fontFamily: fontFamily.regular, color: colors.textMarketing, lineHeight: 23 },
  bulletRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
  bullet: { fontSize: 16, color: colors.accent, fontFamily: fontFamily.bold },
  bulletText: { flex: 1, fontSize: 15, fontFamily: fontFamily.regular, color: colors.textSecondary, lineHeight: 22 },
  footerHint: {
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    lineHeight: 19,
    paddingHorizontal: 4,
  },
  linkBtn: { paddingVertical: 10 },
  linkBtnText: { fontSize: 15, fontFamily: fontFamily.semiBold, color: colors.brand },
  primaryOutlineSpaced: { marginTop: 12 },
  primaryOutline: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.brand,
    borderRadius: radii.sm,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryOutlineText: { fontFamily: fontFamily.semiBold, fontSize: 15, color: colors.brand },
});
