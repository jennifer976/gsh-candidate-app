import { useAppCopy } from "@/lib/i18n";
import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { getMarketingSiteUrl } from "@/lib/config";
import { openExternalUrlInApp } from "@/lib/openMarketingBrowser";
import { useRouter } from "expo-router";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ContentComingSoonCard } from "@/components/ContentComingSoonCard";
import {
  BrandLinkRow,
  BrandStatePanel,
  DepthPressable,
  Eyebrow,
  PosterTitle,
  posterParts,
} from "@/components/gsh-brand";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { isSupabaseNotConfigured } from "@/lib/content/contentAvailability";
import { fetchPublishedBlogList, SupabaseNotConfiguredError } from "@/lib/content/blogQueries";
import { stackScrollContentStyle } from "@/lib/screen-layout";
import { colors, fontFamily, radii } from "@/lib/theme";

export default function BlogIndexScreen() {
  const { t } = useAppCopy();
  const ac = useAccountCopy();
  const router = useRouter();
  const q = useQuery({
    queryKey: ["blogs", "published"],
    queryFn: fetchPublishedBlogList,
    staleTime: 120_000,
    retry: (count, err) => {
      if (err instanceof SupabaseNotConfiguredError) return false;
      return count < 2;
    },
  });

  const comingSoon =
    (q.isError && isSupabaseNotConfigured(q.error)) ||
    (!q.isLoading && !q.isError && (q.data?.length ?? 0) === 0);

  const header = (
    <View style={styles.header}>
      <Eyebrow>{t("resourcesBlog")}</Eyebrow>
      <PosterTitle {...posterParts(ac("Latest from|the blog."))} size={34} />
      <Text style={styles.intro}>{t("blogIntro")}</Text>
    </View>
  );

  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        {q.isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.navy} />
          </View>
        ) : q.isError && !isSupabaseNotConfigured(q.error) ? (
          <ScrollView contentContainerStyle={styles.pad}>
            <BrandStatePanel
              icon="cloud-offline-outline"
              title={t("readingError")}
              body={t("readingErrorHelp")}
              primary={{ label: t("retry"), onPress: () => void q.refetch(), icon: "refresh" }}
              secondary={{ label: t("resourcesTitle"), onPress: () => router.push("/tools-resources"), icon: null }}
            />
          </ScrollView>
        ) : comingSoon ? (
          <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
            {header}
            <ContentComingSoonCard
              feature="blog"
              state={q.isError && isSupabaseNotConfigured(q.error) ? "not-configured" : "empty"}
            />
            <View style={styles.links}>
              <BrandLinkRow
                icon="globe-outline"
                label={t("blogOnline")}
                onPress={() => openExternalUrlInApp(`${getMarketingSiteUrl()}/blog`)}
              />
              <BrandLinkRow icon="newspaper-outline" label={t("resourcesNews")} onPress={() => router.push("/news")} />
              <BrandLinkRow icon="library-outline" label={t("openGuides")} onPress={() => router.push("/resources")} />
            </View>
          </ScrollView>
        ) : (
          <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
            {header}
            {q.data?.map((b) => (
              <DepthPressable
                key={b.id}
                onPress={() => router.push(`/blog/${encodeURIComponent(b.slug)}`)}
                depth={5}
                radius={20}
                borderWidth={2}
                borderColor={colors.navy}
                accessibilityLabel={b.title}
                innerStyle={styles.card}
              >
                {b.featured_image ? (
                  <Image source={{ uri: b.featured_image }} style={styles.thumb} accessibilityIgnoresInvertColors />
                ) : null}
                <View style={styles.cardBody}>
                  <View style={styles.category}>
                    <Text style={styles.categoryText} numberOfLines={1}>
                      {b.category?.name ?? t("article")}
                    </Text>
                  </View>
                  <Text style={styles.title}>{b.title}</Text>
                  {b.description ? (
                    <Text style={styles.desc} numberOfLines={3}>
                      {b.description}
                    </Text>
                  ) : null}
                  <View style={styles.readRow}>
                    <Text style={styles.readText}>{ac("Read article")}</Text>
                    <View style={styles.arrow}>
                      <Ionicons name="arrow-forward" size={14} color={colors.navy} />
                    </View>
                  </View>
                </View>
              </DepthPressable>
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    </GshScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  pad: { ...stackScrollContentStyle, paddingBottom: 40, gap: 18 },
  header: { gap: 8 },
  intro: { fontSize: 15, lineHeight: 22, fontFamily: fontFamily.regular, color: colors.textSecondary },
  links: { gap: 10 },
  card: { padding: 0 },
  thumb: { width: "100%", height: 170, resizeMode: "cover", backgroundColor: colors.pale },
  cardBody: { padding: 16, gap: 8 },
  category: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.cyan,
  },
  categoryText: { fontSize: 11, fontFamily: fontFamily.bold, color: colors.navy, letterSpacing: 0.3 },
  title: { fontSize: 19, lineHeight: 24, fontFamily: fontFamily.heading, color: colors.navy, letterSpacing: -0.3 },
  desc: { fontSize: 14, fontFamily: fontFamily.regular, color: colors.textSecondary, lineHeight: 20 },
  readRow: { marginTop: 4, flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 8 },
  readText: { fontSize: 13, fontFamily: fontFamily.bold, color: colors.navy },
  arrow: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.cyan,
    alignItems: "center",
    justifyContent: "center",
  },
});
