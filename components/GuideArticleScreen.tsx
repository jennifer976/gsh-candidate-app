import { useEffect } from "react";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshScreenIntro } from "@/components/gsh-ui-kit";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { PillarGuideContent } from "@/components/PillarGuideContent";
import { navigateGuideLink } from "@/lib/guides/navigateGuideLink";
import { hasGuideTranslation } from "@/lib/guides/seo/localizedGuides";
import { getPillarPageByPath, getRetiredGuideDestination } from "@/lib/guides/seo/getPillarByPath";
import { useAppCopy } from "@/lib/i18n";
import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { stackScrollContentStyle } from "@/lib/screen-layout";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";

/** Renders a synced website guide, or follows the website's redirect for a retired one. */
export function GuideArticleScreen({ path }: { path: string }) {
  const ac = useAccountCopy();
  const { locale, t } = useAppCopy();
  const router = useRouter();
  const pillar = getPillarPageByPath(path, locale);
  const destination = getRetiredGuideDestination(path);

  useEffect(() => {
    if (!destination) return;
    if (router.canGoBack()) router.back();
    navigateGuideLink(router, destination);
  }, [destination, router]);
  if (destination) return null;

  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
          {pillar ? (
            <>
              <View style={[styles.card, cardSurfaceStyle(true)]}>
                {locale !== "en" && !hasGuideTranslation(pillar.path, locale) ? (
                  <Text style={styles.hint}>{t("guideEnglish")}</Text>
                ) : null}
                <PillarGuideContent config={pillar} router={router} />
              </View>
              <Pressable style={styles.linkBtn} onPress={() => router.push("/resources")} accessibilityRole="button">
                <Text style={styles.linkBtnText}>{ac("Browse more guides")}</Text>
              </Pressable>
              <Pressable style={styles.linkBtn} onPress={() => navigateGuideLink(router, "/jobs")} accessibilityRole="button">
                <Text style={styles.linkBtnText}>{ac("Search jobs")}</Text>
              </Pressable>
            </>
          ) : (
            <View style={[styles.card, cardSurfaceStyle(true)]}>
              <GshScreenIntro
                eyebrow={ac("Guides and resources")}
                title={ac("Topic unavailable")}
                subtitle={ac("Choose another topic from Guides.")}
                style={{ marginBottom: 12 }}
              />
              <Pressable style={styles.outline} onPress={() => router.replace("/resources")} accessibilityRole="button">
                <Text style={styles.outlineText}>{ac("Back to resources")}</Text>
              </Pressable>
            </View>
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
  hint: {
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    lineHeight: 19,
    marginBottom: 8,
  },
  linkBtn: { paddingVertical: 10, minHeight: 44 },
  linkBtnText: { fontSize: 15, fontFamily: fontFamily.semiBold, color: colors.brand },
  outline: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.brand,
    borderRadius: radii.pill,
    paddingVertical: 14,
    alignItems: "center",
  },
  outlineText: { fontFamily: fontFamily.semiBold, fontSize: 15, color: colors.brand },
});
