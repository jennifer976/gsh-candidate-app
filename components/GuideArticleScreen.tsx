import { useEffect } from "react";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BrandLinkRow, BrandStatePanel } from "@/components/gsh-brand";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { PillarGuideContent } from "@/components/PillarGuideContent";
import { navigateGuideLink } from "@/lib/guides/navigateGuideLink";
import { hasGuideTranslation } from "@/lib/guides/seo/localizedGuides";
import { getPillarPageByPath, getRetiredGuideDestination } from "@/lib/guides/seo/getPillarByPath";
import { useAppCopy } from "@/lib/i18n";
import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { stackScrollContentStyle } from "@/lib/screen-layout";
import { colors, fontFamily, radii } from "@/lib/theme";

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
              {locale !== "en" && !hasGuideTranslation(pillar.path, locale) ? (
                <View style={styles.hint}>
                  <Text style={styles.hintText}>{t("guideEnglish")}</Text>
                </View>
              ) : null}
              <PillarGuideContent config={pillar} router={router} />
              <View style={styles.more}>
                <BrandLinkRow icon="library-outline" label={ac("Browse more guides")} onPress={() => router.push("/resources")} />
                <BrandLinkRow icon="briefcase-outline" label={ac("Search jobs")} onPress={() => navigateGuideLink(router, "/jobs")} />
              </View>
            </>
          ) : (
            <BrandStatePanel
              icon="book-outline"
              title={ac("Topic unavailable")}
              body={ac("Choose another topic from Guides.")}
              primary={{ label: ac("Back to resources"), onPress: () => router.replace("/resources") }}
            />
          )}
        </ScrollView>
      </SafeAreaView>
    </GshScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  pad: { ...stackScrollContentStyle, paddingBottom: 40 },
  hint: {
    alignSelf: "flex-start",
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.md,
    backgroundColor: colors.pale,
  },
  hintText: { fontSize: 13, fontFamily: fontFamily.semiBold, color: colors.navy, lineHeight: 18 },
  more: { marginTop: 24, gap: 10 },
});
