import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ContentComingSoonCard } from "@/components/ContentComingSoonCard";
import {
  GshContentAccentBar,
  GshFilterChip,
  GshOutlineButton,
  GshScreenIntro,
  GshTopicChip,
} from "@/components/gsh-ui-kit";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { isSupabaseNotConfigured } from "@/lib/content/contentAvailability";
import {
  fetchPublishedExpertContributors,
  fetchPublishedExpertInsights,
  SupabaseNotConfiguredError,
} from "@/lib/content/expertInsightsQueries";
import { expertInsightCategoryName } from "@/lib/expertInsights/categories";
import { expertInsightFormatLabel } from "@/lib/expertInsights/formatLabels";
import {
  expertInsightKindCardLabel,
  expertInsightKindFilterLabel,
} from "@/lib/expertInsights/publicKindLabels";
import type { ExpertInsightsContentKind } from "@/lib/expertInsights/types";
import { stackScrollContentStyle } from "@/lib/screen-layout";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";

type KindFilter = "all" | ExpertInsightsContentKind;

function formatInsightDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function ExpertInsightsIndexScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState<KindFilter>("all");

  const insightsQ = useQuery({
    queryKey: ["expert-insights", "published"],
    queryFn: fetchPublishedExpertInsights,
    staleTime: 120_000,
    retry: (count, err) => {
      if (err instanceof SupabaseNotConfiguredError) return false;
      return count < 2;
    },
  });
  const contributorsQ = useQuery({
    queryKey: ["expert-contributors", "published"],
    queryFn: fetchPublishedExpertContributors,
    staleTime: 120_000,
    retry: (count, err) => {
      if (err instanceof SupabaseNotConfiguredError) return false;
      return count < 2;
    },
  });

  const filtered = useMemo(() => {
    const list = insightsQ.data ?? [];
    const q = query.trim().toLowerCase();
    return list.filter((item) => {
      if (kindFilter !== "all" && item.kind !== kindFilter) return false;
      if (!q) return true;
      const hay = `${item.title} ${item.excerpt} ${item.contributor_name}`.toLowerCase();
      return hay.includes(q);
    });
  }, [insightsQ.data, kindFilter, query]);

  const loading = insightsQ.isLoading || contributorsQ.isLoading;
  const error = insightsQ.isError ? insightsQ.error : contributorsQ.isError ? contributorsQ.error : null;
  const contentUnavailable =
    isSupabaseNotConfigured(error) ||
    (!loading && !insightsQ.isError && !contributorsQ.isError && (insightsQ.data?.length ?? 0) === 0);
  const hasPublished = !contentUnavailable && (insightsQ.data?.length ?? 0) > 0;

  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.brand} />
          </View>
        ) : error && !isSupabaseNotConfigured(error) ? (
          <ScrollView contentContainerStyle={styles.pad}>
            <GshScreenIntro
              title="Could not load"
              subtitle="Check your connection and try again."
              style={{ marginBottom: 16 }}
            />
            <GshOutlineButton
              title="Try again"
              onPress={() => {
                void insightsQ.refetch();
                void contributorsQ.refetch();
              }}
            />
            <GshOutlineButton title="Tools & resources" onPress={() => router.push("/tools-resources")} style={{ marginTop: 10 }} />
          </ScrollView>
        ) : (
          <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <GshScreenIntro
              eyebrow="Contributor channel"
              title="Expert Insights"
              subtitle="Mobility and hiring guidance from vetted experts — in-app reading, no browser required. Separate from our Blog and partner directory."
              style={{ marginBottom: 10 }}
            />
            <GshContentAccentBar />

            {contentUnavailable ? (
              <>
                <ContentComingSoonCard
                  feature="expert-insights"
                  state={isSupabaseNotConfigured(error) ? "not-configured" : "empty"}
                />
                <GshOutlineButton title="Read the blog" onPress={() => router.push("/blog")} style={{ marginTop: 14 }} />
                <GshOutlineButton title="Open guides" onPress={() => router.push("/guides")} style={{ marginTop: 10 }} />
              </>
            ) : null}

            {hasPublished ? (
              <>
                <View style={[styles.searchWrap, cardSurfaceStyle(true)]}>
                  <Ionicons name="search-outline" size={18} color={colors.textMuted} />
                  <TextInput
                    style={styles.searchInput}
                    value={query}
                    onChangeText={setQuery}
                    placeholder="Search title, expert, or topic…"
                    placeholderTextColor={colors.textMuted}
                    accessibilityLabel="Search insights"
                  />
                  {query.length > 0 ? (
                    <Pressable onPress={() => setQuery("")} hitSlop={10} accessibilityRole="button" accessibilityLabel="Clear search">
                      <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                    </Pressable>
                  ) : null}
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                  <GshFilterChip label="All" active={kindFilter === "all"} onPress={() => setKindFilter("all")} />
                  {(["brief", "flagship", "evergreen"] as const).map((k) => (
                    <GshFilterChip
                      key={k}
                      label={expertInsightKindFilterLabel(k)}
                      active={kindFilter === k}
                      onPress={() => setKindFilter(k)}
                    />
                  ))}
                </ScrollView>
              </>
            ) : null}

            {(contributorsQ.data?.length ?? 0) > 0 ? (
              <>
                <Text style={styles.sectionLabel}>Meet the experts</Text>
                <Text style={styles.sectionLead}>Each contributor has a dedicated page — bio, pinned guides, and published work.</Text>
                <View style={styles.chipRow}>
                  {contributorsQ.data?.map((c) => (
                    <GshTopicChip
                      key={c.id}
                      label={c.name}
                      onPress={() => router.push(`/expert-insights/experts/${encodeURIComponent(c.slug)}`)}
                    />
                  ))}
                </View>
              </>
            ) : null}

            {hasPublished && filtered.length === 0 ? (
              <View style={[styles.card, cardSurfaceStyle(true)]}>
                <Text style={styles.emptyTitle}>No pieces match these filters</Text>
                <Text style={styles.emptyBody}>Try clearing search or choosing a different type.</Text>
                <GshOutlineButton
                  title="Show all"
                  onPress={() => {
                    setQuery("");
                    setKindFilter("all");
                  }}
                  style={{ marginTop: 14 }}
                />
              </View>
            ) : (
              filtered.map((item) => (
                <Pressable
                  key={item.id}
                  style={[styles.card, cardSurfaceStyle(true)]}
                  onPress={() => router.push(`/expert-insights/${encodeURIComponent(item.slug)}`)}
                  accessibilityRole="button"
                >
                  <Text style={styles.eyebrow}>
                    {expertInsightKindCardLabel(item.kind)} · {expertInsightCategoryName(item.categorySlug)} ·{" "}
                    {expertInsightFormatLabel(item.format)}
                  </Text>
                  <Text style={styles.title}>{item.title}</Text>
                  {item.excerpt ? (
                    <Text style={styles.desc} numberOfLines={3}>
                      {item.excerpt}
                    </Text>
                  ) : null}
                  <View style={styles.metaRow}>
                    <Text style={styles.byline}>{item.contributor_name}</Text>
                    <Text style={styles.metaDot}>·</Text>
                    <Text style={styles.metaMuted}>{formatInsightDate(item.publishedAt)}</Text>
                    {item.readMinutes ? (
                      <>
                        <Text style={styles.metaDot}>·</Text>
                        <Text style={styles.metaMuted}>{item.readMinutes} min</Text>
                      </>
                    ) : null}
                  </View>
                </Pressable>
              ))
            )}

            <View style={[styles.disclaimer, cardSurfaceStyle(true)]}>
              <Text style={styles.disclaimerText}>
                Contributor content is not immigration legal advice. All pieces are reviewed before publication.
              </Text>
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </GshScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  pad: { ...stackScrollContentStyle, paddingBottom: 40, gap: 14 },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.lg,
  },
  searchInput: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: 15,
    color: colors.navy,
    paddingVertical: 4,
  },
  filterRow: { gap: 8, paddingBottom: 4 },
  sectionLabel: { fontFamily: fontFamily.bold, fontSize: 16, color: colors.navy, marginTop: 4 },
  sectionLead: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 19,
    marginBottom: 10,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 4 },
  card: { padding: 16, borderRadius: radii.lg },
  eyebrow: {
    fontSize: 12,
    fontFamily: fontFamily.semiBold,
    color: colors.teal,
    letterSpacing: 0.2,
    marginBottom: 6,
  },
  title: { fontSize: 18, fontFamily: fontFamily.bold, color: colors.navy, letterSpacing: -0.2 },
  desc: { marginTop: 8, fontSize: 14, fontFamily: fontFamily.regular, color: colors.textMuted, lineHeight: 20 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", marginTop: 10, gap: 4 },
  byline: { fontSize: 12, fontFamily: fontFamily.semiBold, color: colors.brand },
  metaDot: { fontSize: 12, color: colors.textMuted },
  metaMuted: { fontSize: 12, fontFamily: fontFamily.regular, color: colors.textMuted },
  emptyTitle: { fontFamily: fontFamily.bold, fontSize: 16, color: colors.navy, marginBottom: 6 },
  emptyBody: { fontFamily: fontFamily.regular, fontSize: 14, lineHeight: 20, color: colors.textMuted },
  disclaimer: { padding: 14, borderRadius: radii.lg, marginTop: 4 },
  disclaimerText: { fontFamily: fontFamily.regular, fontSize: 12, lineHeight: 18, color: colors.textMuted },
});
