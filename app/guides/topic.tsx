import { useEffect } from "react";
import { hasGuideTranslation } from "@/lib/guides/seo/localizedGuides";
import { useAppCopy } from "@/lib/i18n";
import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshScreenIntro, GshSectionTitle } from "@/components/gsh-ui-kit";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { PillarGuideContent } from "@/components/PillarGuideContent";
import { navigateGuideLink } from "@/lib/guides/navigateGuideLink";
import { getPillarPageByPath, getRetiredGuideDestination } from "@/lib/guides/seo/getPillarByPath";
import { getGuideTopicStub } from "@/lib/guides/topicStubs";
import { stackScrollContentStyle } from "@/lib/screen-layout";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";

export default function GuideTopicScreen() {
  const ac = useAccountCopy();

  const { locale, t } = useAppCopy();
  const router = useRouter();
  const { q } = useLocalSearchParams<{ q: string }>();
  let hrefRaw = typeof q === "string" ? q : "";
  try {
    hrefRaw = decodeURIComponent(hrefRaw);
  } catch {
    /* An unknown path uses the unavailable state. */
  }
  const pillar = getPillarPageByPath(hrefRaw, locale);
  const stub = getGuideTopicStub(hrefRaw);
  const destination = getRetiredGuideDestination(hrefRaw);
  useEffect(() => {
    if (!destination) return;
    router.replace("/guides");
    if (destination !== "/countries") navigateGuideLink(router, destination);
  }, [destination, router]);
  if (destination) return null;


  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <ScrollView
          contentContainerStyle={styles.pad}
          showsVerticalScrollIndicator={false}
        >
          {pillar ? (
            <>
              <View style={[styles.card, cardSurfaceStyle(true)]}>
                {locale !== "en" && !hasGuideTranslation(pillar.path, locale) ? (
                  <Text style={styles.footerHint}>{t("guideEnglish")}</Text>
                ) : null}
                <PillarGuideContent config={pillar} router={router} />
              </View>
              <Pressable
                style={styles.linkBtn}
                onPress={() => router.push("/guides")}
                accessibilityRole="button"
              >
                <Text style={styles.linkBtnText}>
                  {ac("Browse more guides")}
                </Text>
              </Pressable>
              <Pressable
                style={styles.linkBtn}
                onPress={() => navigateGuideLink(router, "/jobs")}
                accessibilityRole="button"
              >
                <Text style={styles.linkBtnText}>{ac("Search jobs")}</Text>
              </Pressable>
              <Pressable
                style={styles.linkBtn}
                onPress={() => navigateGuideLink(router, "/specialists")}
                accessibilityRole="button"
              >
                <Text style={styles.linkBtnText}>
                  {ac("Specialist directory")}
                </Text>
              </Pressable>
            </>
          ) : !stub ? (
            <View style={[styles.card, cardSurfaceStyle(true)]}>
              <GshScreenIntro
                eyebrow={ac("Guides and resources")}
                title={ac("Topic unavailable")}
                subtitle={ac("Choose another topic from Guides.")}
                style={{ marginBottom: 12 }}
              />
              <Pressable
                style={styles.primaryOutline}
                onPress={() => router.push("/guides")}
                accessibilityRole="button"
              >
                <Text style={styles.primaryOutlineText}>
                  {ac("Back to guides")}
                </Text>
              </Pressable>
              <Pressable
                style={[styles.primaryOutline, styles.primaryOutlineSpaced]}
                onPress={() => router.push("/faq")}
                accessibilityRole="button"
              >
                <Text style={styles.primaryOutlineText}>{ac("FAQs")}</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <View style={[styles.card, cardSurfaceStyle(true)]}>
                <Text style={styles.title}>{ac("Specialist directory")}</Text>
                <Text style={styles.body}>
                  {ac(
                    "Find independent help with visas, relocation and legal matters.",
                  )}
                </Text>
              </View>
              <View style={[styles.card, cardSurfaceStyle(true)]}>
                <GshSectionTitle
                  title={ac("Key points")}
                  topSpacing="none"
                  style={{ marginTop: 0, marginBottom: 10 }}
                />
                <Text style={styles.bulletText}>
                  {ac("Request and manage support")}
                </Text>
              </View>
              <Pressable
                style={styles.primaryOutline}
                onPress={() => navigateGuideLink(router, "/specialists")}
                accessibilityRole="button"
              >
                <Text style={styles.primaryOutlineText}>
                  {ac("Specialist directory")}
                </Text>
              </Pressable>
              <Text style={styles.footerHint}>
                {ac(
                  "Find independent help with visas, relocation and legal matters.",
                )}
              </Text>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </GshScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  pad: { ...stackScrollContentStyle, paddingBottom: 40, gap: 14 },
  card: { padding: 18, borderRadius: radii.lg },
  title: {
    fontSize: 22,
    fontFamily: fontFamily.extraBold,
    color: colors.navy,
    letterSpacing: -0.35,
    marginBottom: 12,
  },
  body: {
    fontSize: 15,
    fontFamily: fontFamily.regular,
    color: colors.textMarketing,
    lineHeight: 23,
  },
  bulletRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
  bullet: { fontSize: 16, color: colors.accent, fontFamily: fontFamily.bold },
  bulletText: {
    flex: 1,
    fontSize: 15,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  footerHint: {
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    lineHeight: 19,
    paddingHorizontal: 4,
  },
  linkBtn: { paddingVertical: 10 },
  linkBtnText: {
    fontSize: 15,
    fontFamily: fontFamily.semiBold,
    color: colors.brand,
  },
  primaryOutlineSpaced: { marginTop: 12 },
  primaryOutline: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.brand,
    borderRadius: radii.pill,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryOutlineText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    color: colors.brand,
  },
});
