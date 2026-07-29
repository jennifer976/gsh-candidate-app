import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ContentComingSoonCard } from "@/components/ContentComingSoonCard";
import { GshContentAccentBar, GshOutlineButton, GshScreenIntro } from "@/components/gsh-ui-kit";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { isSupabaseNotConfigured } from "@/lib/content/contentAvailability";
import {
  fetchExpertContributorBySlug,
  fetchExpertInsightsForContributor,
  SupabaseNotConfiguredError,
} from "@/lib/content/expertInsightsQueries";
import { expertInsightKindCardLabel, EXPERT_INSIGHT_KIND_PUBLIC } from "@/lib/expertInsights/publicKindLabels";
import type { ExpertInsightPublic, ExpertInsightsContentKind } from "@/lib/expertInsights/types";
import { openExternalUrlInApp } from "@/lib/openMarketingBrowser";
import { stackScrollContentStyle } from "@/lib/screen-layout";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";

const KIND_ORDER: ExpertInsightsContentKind[] = ["evergreen", "flagship", "brief"];

function groupByKind(insights: ExpertInsightPublic[]): { kind: ExpertInsightsContentKind; items: ExpertInsightPublic[] }[] {
  return KIND_ORDER.map((kind) => ({
    kind,
    items: insights.filter((i) => i.kind === kind),
  })).filter((g) => g.items.length > 0);
}

export default function ExpertContributorScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const decoded = decodeURIComponent(typeof slug === "string" ? slug : "");

  const contributorQ = useQuery({
    queryKey: ["expert-contributor", decoded],
    queryFn: () => fetchExpertContributorBySlug(decoded),
    enabled: decoded.length > 0,
    retry: (count, err) => {
      if (err instanceof SupabaseNotConfiguredError) return false;
      return count < 2;
    },
  });

  const insightsQ = useQuery({
    queryKey: ["expert-contributor-insights", contributorQ.data?.id],
    queryFn: () => fetchExpertInsightsForContributor(contributorQ.data!.id),
    enabled: Boolean(contributorQ.data?.id),
    retry: (count, err) => {
      if (err instanceof SupabaseNotConfiguredError) return false;
      return count < 2;
    },
  });

  const loading = contributorQ.isLoading || (contributorQ.data && insightsQ.isLoading);
  const error = contributorQ.error ?? insightsQ.error;

  if (loading) {
    return (
      <GshScreenBackground>
        <SafeAreaView style={styles.center} edges={["bottom"]}>
          <ActivityIndicator size="large" color={colors.brand} />
        </SafeAreaView>
      </GshScreenBackground>
    );
  }

  if (error && isSupabaseNotConfigured(error)) {
    return (
      <GshScreenBackground>
        <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
          <ScrollView contentContainerStyle={styles.pad}>
            <GshScreenIntro
              eyebrow="Contributor channel"
              title="Expert profile"
              subtitle="Contributor pages appear here when Expert Insights goes live."
              style={{ marginBottom: 10 }}
            />
            <ContentComingSoonCard feature="expert-insights" state="not-configured" />
            <GshOutlineButton title="Back to Expert Insights" onPress={() => router.push("/expert-insights")} style={{ marginTop: 14 }} />
          </ScrollView>
        </SafeAreaView>
      </GshScreenBackground>
    );
  }

  if (error || !contributorQ.data) {
    return (
      <GshScreenBackground>
        <SafeAreaView style={styles.center} edges={["bottom"]}>
          <GshScreenIntro title="Expert not found" subtitle="This profile may be unpublished." style={{ marginBottom: 8 }} />
          <GshOutlineButton title="Back to Expert Insights" onPress={() => router.push("/expert-insights")} />
        </SafeAreaView>
      </GshScreenBackground>
    );
  }

  const c = contributorQ.data;
  const groups = groupByKind(insightsQ.data ?? []);

  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
          <View style={[styles.profileCard, cardSurfaceStyle(true)]}>
            <GshContentAccentBar style={{ marginBottom: 14 }} />
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{c.avatarInitials ?? c.name.slice(0, 2).toUpperCase()}</Text>
            </View>
            <Text style={styles.name}>{c.name}</Text>
            {c.role ? <Text style={styles.role}>{c.role}</Text> : null}
            {c.bio ? <Text style={styles.bio}>{c.bio}</Text> : null}
            {c.expertise.length > 0 ? (
              <View style={styles.tagRow}>
                {c.expertise.map((tag) => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            ) : null}
            {c.websiteUrl ? (
              <Pressable onPress={() => openExternalUrlInApp(c.websiteUrl!)} accessibilityRole="link">
                <Text style={styles.website}>{c.websiteLabel ?? "Contributor website"}</Text>
              </Pressable>
            ) : null}
          </View>

          {groups.length === 0 ? (
            <Text style={styles.empty}>No published pieces from this expert yet.</Text>
          ) : (
            groups.map((g) => (
              <View key={g.kind}>
                <Text style={styles.sectionTitle}>{EXPERT_INSIGHT_KIND_PUBLIC[g.kind].section}</Text>
                {g.items.map((item) => (
                  <Pressable
                    key={item.id}
                    style={[styles.card, cardSurfaceStyle(true)]}
                    onPress={() => router.push(`/expert-insights/${encodeURIComponent(item.slug)}`)}
                    accessibilityRole="button"
                  >
                    <Text style={styles.cardKind}>{expertInsightKindCardLabel(item.kind)}</Text>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    {item.excerpt ? (
                      <Text style={styles.cardExcerpt} numberOfLines={2}>
                        {item.excerpt}
                      </Text>
                    ) : null}
                  </Pressable>
                ))}
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </GshScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  pad: { ...stackScrollContentStyle, paddingBottom: 40, gap: 12 },
  profileCard: { padding: 18, borderRadius: radii.lg, alignItems: "flex-start" },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.teal,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: { fontFamily: fontFamily.bold, fontSize: 18, color: "#fff" },
  name: { fontFamily: fontFamily.extraBold, fontSize: 22, color: colors.navy },
  role: { marginTop: 4, fontFamily: fontFamily.medium, fontSize: 14, color: colors.textMuted },
  bio: { marginTop: 12, fontFamily: fontFamily.regular, fontSize: 14, lineHeight: 22, color: colors.textMarketing },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  tag: { backgroundColor: "rgba(14,205,209,0.12)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.pill },
  tagText: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.teal },
  website: { marginTop: 14, fontFamily: fontFamily.semiBold, fontSize: 14, color: colors.brand },
  sectionTitle: { fontFamily: fontFamily.bold, fontSize: 16, color: colors.navy, marginTop: 8, marginBottom: 8 },
  card: { padding: 14, borderRadius: radii.lg, marginBottom: 10 },
  cardKind: { fontSize: 11, fontFamily: fontFamily.semiBold, color: colors.teal, marginBottom: 4 },
  cardTitle: { fontFamily: fontFamily.bold, fontSize: 16, color: colors.navy },
  cardExcerpt: { marginTop: 6, fontFamily: fontFamily.regular, fontSize: 13, color: colors.textMuted, lineHeight: 19 },
  empty: { fontFamily: fontFamily.regular, fontSize: 14, color: colors.textMuted },
});
