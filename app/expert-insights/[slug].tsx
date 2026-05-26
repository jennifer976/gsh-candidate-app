import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlogArticleBody } from "@/components/BlogArticleBody";
import { GshGradientPrimaryButton } from "@/components/GshGradientPrimaryButton";
import { GshContentAccentBar, GshOutlineButton, GshScreenIntro } from "@/components/gsh-ui-kit";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { loadExpertInsightArticle, SupabaseNotConfiguredError } from "@/lib/content/expertInsightsQueries";
import { expertInsightCategoryName } from "@/lib/expertInsights/categories";
import { expertInsightFormatLabel } from "@/lib/expertInsights/formatLabels";
import { expertInsightKindCardLabel } from "@/lib/expertInsights/publicKindLabels";
import { openExternalUrlInApp } from "@/lib/openMarketingBrowser";
import { stackScrollContentStyle } from "@/lib/screen-layout";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";

function formatInsightDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function ExpertInsightArticleScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const decoded = decodeURIComponent(typeof slug === "string" ? slug : "");

  const q = useQuery({
    queryKey: ["expert-insight", decoded],
    queryFn: () => loadExpertInsightArticle(decoded),
    enabled: decoded.length > 0,
    retry: (count, err) => {
      if (err instanceof SupabaseNotConfiguredError) return false;
      return count < 2;
    },
  });

  if (q.isLoading) {
    return (
      <GshScreenBackground>
        <SafeAreaView style={styles.center} edges={["bottom"]}>
          <ActivityIndicator size="large" color={colors.brand} />
        </SafeAreaView>
      </GshScreenBackground>
    );
  }

  if (q.isError) {
    const notConfigured = q.error instanceof SupabaseNotConfiguredError;
    return (
      <GshScreenBackground>
        <SafeAreaView style={styles.center} edges={["bottom"]}>
          <GshScreenIntro
            title={notConfigured ? "Insight unavailable in-app" : "Could not load this piece"}
            subtitle={
              notConfigured
                ? "This build is not linked to the content service. Try Guides or Tools & resources."
                : "Check your connection and try again."
            }
            style={{ marginBottom: 8 }}
          />
          <GshOutlineButton title="Try again" onPress={() => void q.refetch()} />
          <GshOutlineButton title="All insights" onPress={() => router.push("/expert-insights")} style={{ marginTop: 10 }} />
        </SafeAreaView>
      </GshScreenBackground>
    );
  }

  if (!q.data) {
    return (
      <GshScreenBackground>
        <SafeAreaView style={styles.center} edges={["bottom"]}>
          <GshScreenIntro title="We could not find that insight." style={{ marginBottom: 8 }} />
          <GshOutlineButton title="Back to hub" onPress={() => router.push("/expert-insights")} />
        </SafeAreaView>
      </GshScreenBackground>
    );
  }

  const { insight, contributor, sections } = q.data;

  return (
    <GshScreenBackground>
      <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
        <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
          <View style={[styles.hero, cardSurfaceStyle(true)]}>
            <GshContentAccentBar />
            <Text style={styles.eyebrow}>
              {expertInsightKindCardLabel(insight.kind)} · {expertInsightCategoryName(insight.categorySlug)} ·{" "}
              {expertInsightFormatLabel(insight.format)}
            </Text>
            <Text style={styles.title}>{insight.title}</Text>
            {insight.excerpt ? <Text style={styles.desc}>{insight.excerpt}</Text> : null}
            <Pressable
              onPress={() => router.push(`/expert-insights/experts/${encodeURIComponent(contributor.slug)}`)}
              accessibilityRole="button"
            >
              <Text style={styles.byline}>
                By {contributor.name} · {formatInsightDate(insight.publishedAt)}
                {insight.readMinutes ? ` · ${insight.readMinutes} min read` : ""}
              </Text>
            </Pressable>
          </View>

          {insight.videoUrl ? (
            <GshGradientPrimaryButton
              title="Watch video"
              onPress={() => openExternalUrlInApp(insight.videoUrl!)}
              containerStyle={{ marginBottom: 10 }}
            />
          ) : null}
          {insight.audioUrl ? (
            <GshGradientPrimaryButton
              title="Listen to audio"
              onPress={() => openExternalUrlInApp(insight.audioUrl!)}
              containerStyle={{ marginBottom: 10 }}
            />
          ) : null}

          <BlogArticleBody sections={sections} />

          <View style={[styles.disclaimer, cardSurfaceStyle(true)]}>
            <Text style={styles.disclaimerText}>
              Contributor content is not immigration legal advice. All pieces are reviewed before publication.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </GshScreenBackground>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, gap: 12 },
  pad: stackScrollContentStyle,
  hero: { padding: 16, borderRadius: radii.lg, marginBottom: 16 },
  eyebrow: {
    fontSize: 12,
    fontFamily: fontFamily.semiBold,
    color: colors.teal,
    letterSpacing: 0.2,
    marginBottom: 8,
  },
  title: { fontSize: 24, fontFamily: fontFamily.extraBold, color: colors.navy, letterSpacing: -0.35 },
  desc: { marginTop: 10, fontSize: 15, fontFamily: fontFamily.regular, color: colors.textMuted, lineHeight: 22 },
  byline: { marginTop: 12, fontSize: 14, fontFamily: fontFamily.semiBold, color: colors.brand, lineHeight: 20 },
  disclaimer: { padding: 14, borderRadius: radii.lg, marginTop: 16 },
  disclaimerText: { fontFamily: fontFamily.regular, fontSize: 12, lineHeight: 18, color: colors.textMuted },
});
