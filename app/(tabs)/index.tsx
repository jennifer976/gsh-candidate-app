import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { JobsHomePersonalHeader } from "@/components/JobsHomePersonalHeader";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { fetchCandidateDashboard, fetchOwnProfile, fetchPublicJobs } from "@/lib/api-client";
import { getJobEmployerLabel, hubListingChips } from "@/lib/job-display";
import { addRecentJobSearch, loadRecentJobSearches } from "@/lib/recent-job-searches";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";
import type { Job } from "@/types/models";

function formatSalary(job: Job): string {
  const cur = job.salaryCurrency || "GBP";
  const sym = cur === "GBP" ? "£" : cur === "EUR" ? "€" : cur === "USD" ? "$" : `${cur} `;
  if (job.minSalary != null && job.maxSalary != null) {
    return `${sym}${job.minSalary.toLocaleString()}–${job.maxSalary.toLocaleString()}`;
  }
  if (job.minSalary != null) return `From ${sym}${job.minSalary.toLocaleString()}`;
  return "";
}

const CHIP_CAP = 3;

function ChipStrip({ chips }: { chips: string[] }) {
  if (chips.length === 0) return null;
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipStripContent}
      style={styles.chipStrip}
    >
      {chips.map((c) => (
        <View key={c} style={styles.listChip}>
          <Text style={styles.listChipText} numberOfLines={1}>
            {c}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

function HubJobCard({ job, onPress }: { job: Job; onPress: () => void }) {
  const employer = getJobEmployerLabel(job);
  const chips = hubListingChips(job, CHIP_CAP);
  const metaLine = [job.locationCity, job.locationCountry].filter(Boolean).join(", ") || job.location || "";
  const meta =
    [metaLine, job.jobType].filter((x) => typeof x === "string" && x.length > 0).join(" · ") || "";

  return (
    <Pressable style={[styles.card, cardSurfaceStyle(false)]} onPress={onPress} accessibilityRole="button">
      <View style={styles.cardTop}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {job.title}
        </Text>
        <View style={[styles.kindBadge, styles.kindBadgeHub]}>
          <Text style={styles.kindBadgeText}>Hub</Text>
        </View>
      </View>
      <Text style={styles.cardCompany} numberOfLines={1}>
        {employer}
      </Text>
      {meta ? (
        <Text style={styles.cardMeta} numberOfLines={1}>
          {meta}
        </Text>
      ) : null}
      <ChipStrip chips={chips} />
      {formatSalary(job) ? <Text style={styles.cardSalary}>{formatSalary(job)}</Text> : null}
      <View style={styles.cardFooter}>
        <Text style={styles.cardCta}>View role</Text>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </View>
    </Pressable>
  );
}

export default function JobsScreen() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const [pullRefreshing, setPullRefreshing] = useState(false);

  useEffect(() => {
    void loadRecentJobSearches().then(setRecent);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 400);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    if (debouncedQ.length < 3) return;
    let cancelled = false;
    void addRecentJobSearch(debouncedQ).then((next) => {
      if (!cancelled) setRecent(next);
    });
    return () => {
      cancelled = true;
    };
  }, [debouncedQ]);

  const profileQuery = useQuery({
    queryKey: ["profile", "me"],
    queryFn: fetchOwnProfile,
    staleTime: 45_000,
  });

  const dashQuery = useQuery({
    queryKey: ["analytics", "candidate-dashboard"],
    queryFn: fetchCandidateDashboard,
    staleTime: 45_000,
  });

  const hubJobsQuery = useQuery({
    queryKey: ["public-jobs", debouncedQ],
    queryFn: () =>
      fetchPublicJobs({
        q: debouncedQ || undefined,
        page: 1,
        perPage: 25,
      }),
    staleTime: 60_000,
  });

  const firstName =
    profileQuery.data && typeof (profileQuery.data as { firstName?: unknown }).firstName === "string"
      ? String((profileQuery.data as { firstName: string }).firstName)
      : "";

  const completionPct =
    profileQuery.data && typeof (profileQuery.data as { profileCompletion?: unknown }).profileCompletion === "number"
      ? (profileQuery.data as { profileCompletion: number }).profileCompletion
      : null;

  const quickStats = useMemo(() => {
    const d = dashQuery.data;
    if (!d) return null;
    return {
      applied: d.stats.totalApplied,
      saved: d.savedJobs?.length ?? 0,
      interviews: d.stats.interviews,
    };
  }, [dashQuery.data]);

  const hubJobs = hubJobsQuery.data?.data ?? [];

  const listBootloading = hubJobsQuery.isLoading && !hubJobsQuery.data;
  const activeError = hubJobsQuery.isError;

  const onRefresh = useCallback(() => {
    setPullRefreshing(true);
    void Promise.all([hubJobsQuery.refetch(), dashQuery.refetch(), profileQuery.refetch()]).finally(() =>
      setPullRefreshing(false),
    );
  }, [hubJobsQuery, dashQuery, profileQuery]);

  const listHeader = (
    <>
      <JobsHomePersonalHeader
        firstName={firstName}
        completionPct={completionPct}
        stats={quickStats}
        statsLoading={dashQuery.isLoading && !dashQuery.data}
        onProfile={() => router.push("/(tabs)/profile")}
        onApplied={() => router.push("/(tabs)/applications")}
        onSaved={() => router.push("/(tabs)/saved")}
        onDashboard={() => router.push("/dashboard")}
      />

      <View style={styles.hubSection}>
        <Text style={styles.hubSectionLabel}>Your hub</Text>
        <View style={styles.shortcutGrid}>
          <Pressable
            style={[styles.shortcutTile, cardSurfaceStyle(false)]}
            onPress={() => router.push("/dashboard")}
            accessibilityRole="button"
            accessibilityLabel="Open dashboard"
          >
            <View style={styles.shortcutIconWrap}>
              <Ionicons name="stats-chart-outline" size={22} color={colors.textMarketing} />
            </View>
            <Text style={styles.shortcutTitle}>Dashboard</Text>
            <Text style={styles.shortcutSub}>Stats & trends</Text>
          </Pressable>
          <Pressable
            style={[styles.shortcutTile, cardSurfaceStyle(false)]}
            onPress={() => router.push("/alerts")}
            accessibilityRole="button"
            accessibilityLabel="Job alerts"
          >
            <View style={styles.shortcutIconWrap}>
              <Ionicons name="notifications-outline" size={22} color={colors.textMarketing} />
            </View>
            <Text style={styles.shortcutTitle}>Alerts</Text>
            <Text style={styles.shortcutSub}>Saved searches</Text>
          </Pressable>
          <Pressable
            style={[styles.shortcutTile, cardSurfaceStyle(false)]}
            onPress={() => router.push("/tools-resources")}
            accessibilityRole="button"
            accessibilityLabel="Tools and resources"
          >
            <View style={styles.shortcutIconWrap}>
              <Ionicons name="library-outline" size={22} color={colors.textMarketing} />
            </View>
            <Text style={styles.shortcutTitle}>Tools & resources</Text>
            <Text style={styles.shortcutSub}>Guides, blog, legal</Text>
          </Pressable>
          <Pressable
            style={[styles.shortcutTile, cardSurfaceStyle(false)]}
            onPress={() => router.push("/ats-assistant")}
            accessibilityRole="button"
            accessibilityLabel="ATS assistant"
          >
            <View style={styles.shortcutIconWrap}>
              <Ionicons name="document-text-outline" size={22} color={colors.textMarketing} />
            </View>
            <Text style={styles.shortcutTitle}>ATS assistant</Text>
            <Text style={styles.shortcutSub}>CV vs job match</Text>
          </Pressable>
        </View>
        <View style={styles.quickLinksRow}>
          <Pressable onPress={() => router.push("/guides")} accessibilityRole="link">
            <Text style={styles.quickLink}>Guides hub</Text>
          </Pressable>
          <Text style={styles.quickDot}> · </Text>
          <Pressable onPress={() => router.push("/visa-wizard")} accessibilityRole="link">
            <Text style={styles.quickLink}>Visa wizard</Text>
          </Pressable>
        </View>
      </View>

      <Pressable
        style={[styles.curatedRow, cardSurfaceStyle(false)]}
        onPress={() => router.push("/curated-listings")}
        accessibilityRole="button"
        accessibilityLabel="Open curated listings on a separate screen"
      >
        <View style={styles.curatedRowText}>
          <Text style={styles.curatedRowTitle}>Curated listings</Text>
          <Text style={styles.curatedRowSub}>Agency campaigns, partner-curated and wider-web — not mixed with employer posts below</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </Pressable>

      <View style={styles.feedIntroOuter}>
        <Text style={styles.feedIntroLabel}>Employer listings</Text>
        <Text style={styles.feedIntroHint}>
          Companies posting their own roles on Global Sponsor Hub. Recruitment agencies list separately under Curated above.
        </Text>
      </View>

      <View style={styles.searchOuter}>
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={20} color={colors.placeholder} style={styles.searchIcon} />
          <TextInput
            style={styles.search}
            placeholder="Search employer-posted roles…"
            placeholderTextColor={colors.placeholder}
            value={q}
            onChangeText={setQ}
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Search employer job listings"
            returnKeyType="search"
          />
          {q.length > 0 ? (
            <Pressable onPress={() => setQ("")} hitSlop={12} accessibilityRole="button" accessibilityLabel="Clear search">
              <Ionicons name="close-circle" size={22} color={colors.placeholder} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {recent.length > 0 ? (
        <View style={styles.recentOuter}>
          <Text style={styles.recentLabel}>Recent searches</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentScroll}>
            {recent.map((term) => (
              <Pressable
                key={term}
                style={styles.recentChip}
                onPress={() => setQ(term)}
                accessibilityRole="button"
              >
                <Text style={styles.recentChipText} numberOfLines={1}>
                  {term}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}
    </>
  );

  const emptyBody = listBootloading ? (
    <View style={styles.emptyWrap}>
      <ActivityIndicator size="large" color={colors.brand} />
      <Text style={styles.loadingHint}>Loading employer listings…</Text>
    </View>
  ) : activeError ? (
    <View style={styles.emptyWrap}>
      <Ionicons name="cloud-offline-outline" size={44} color={colors.textMuted} />
      <Text style={styles.errTitle}>Could not load listings</Text>
      <Text style={styles.errSub}>Check your connection and pull down to retry.</Text>
      <Pressable style={styles.retryBtn} onPress={() => void hubJobsQuery.refetch()} accessibilityRole="button">
        <Text style={styles.retryBtnText}>Try again</Text>
      </Pressable>
    </View>
  ) : hubJobs.length === 0 ? (
    <View style={styles.emptyWrap}>
      <Ionicons name="search-outline" size={44} color={colors.borderStrong} />
      <Text style={styles.empty}>
        {debouncedQ
          ? "No employer listings match that search — try another keyword."
          : "No employer listings right now. Pull to refresh."}
      </Text>
      {debouncedQ ? (
        <Pressable style={styles.retryBtn} onPress={() => setQ("")} accessibilityRole="button">
          <Text style={styles.retryBtnText}>Clear search</Text>
        </Pressable>
      ) : (
        <Pressable style={styles.secondaryCta} onPress={() => router.push("/curated-listings")} accessibilityRole="button">
          <Text style={styles.secondaryCtaText}>Browse curated listings (separate) →</Text>
        </Pressable>
      )}
    </View>
  ) : null;

  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <FlatList
          data={activeError ? [] : hubJobs}
          keyExtractor={(item) => item._id}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={emptyBody}
          refreshControl={<RefreshControl refreshing={pullRefreshing} onRefresh={onRefresh} />}
          contentContainerStyle={[styles.listPad, hubJobs.length === 0 && !listBootloading && styles.listPadGrow]}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <HubJobCard job={item as Job} onPress={() => router.push(`/job/${(item as Job)._id}`)} />
          )}
        />
      </SafeAreaView>
    </GshScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  hubSection: { marginHorizontal: 16, marginTop: 12 },
  hubSectionLabel: {
    fontSize: 11,
    fontFamily: fontFamily.medium,
    color: colors.textMuted,
    letterSpacing: 0.4,
    marginBottom: 12,
  },
  shortcutGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  shortcutTile: {
    flexBasis: "47%",
    flexGrow: 1,
    maxWidth: "48%",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: radii.lg,
    alignItems: "flex-start",
  },
  shortcutIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    backgroundColor: colors.surfaceMuted,
  },
  shortcutTitle: { fontSize: 15, fontFamily: fontFamily.semiBold, color: colors.textPrimary, letterSpacing: -0.2 },
  shortcutSub: { marginTop: 3, fontSize: 12, fontFamily: fontFamily.regular, color: colors.textMuted, lineHeight: 16 },
  quickLinksRow: {
    marginTop: 14,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  quickLink: { fontSize: 13, fontFamily: fontFamily.medium, color: colors.textSecondary },
  quickDot: { fontSize: 13, color: colors.borderStrong },
  curatedRow: {
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: radii.lg,
  },
  curatedRowText: { flex: 1 },
  curatedRowTitle: { fontSize: 15, fontFamily: fontFamily.semiBold, color: colors.textPrimary },
  curatedRowSub: { marginTop: 4, fontSize: 12, fontFamily: fontFamily.regular, color: colors.textMuted, lineHeight: 17 },
  feedIntroOuter: { paddingHorizontal: 16, marginTop: 16, marginBottom: 4 },
  feedIntroLabel: {
    fontSize: 11,
    fontFamily: fontFamily.medium,
    color: colors.textMuted,
    letterSpacing: 0.35,
    marginBottom: 6,
  },
  feedIntroHint: {
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    lineHeight: 19,
  },
  searchOuter: { paddingHorizontal: 16, paddingVertical: 12 },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.92)",
    paddingHorizontal: 12,
  },
  searchIcon: { marginRight: 4 },
  search: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: fontFamily.regular,
    color: colors.textPrimary,
  },
  recentOuter: { paddingHorizontal: 16, marginBottom: 8 },
  recentLabel: {
    fontSize: 11,
    fontFamily: fontFamily.medium,
    color: colors.textMuted,
    letterSpacing: 0.35,
    marginBottom: 8,
  },
  recentScroll: { flexDirection: "row", gap: 8, paddingBottom: 4 },
  recentChip: {
    maxWidth: 220,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  recentChipText: { fontSize: 13, fontFamily: fontFamily.medium, color: colors.textSecondary },
  listPad: { paddingHorizontal: 16, paddingBottom: 24, gap: 10 },
  listPadGrow: { flexGrow: 1 },
  card: {
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  cardTitle: { flex: 1, fontSize: 16, fontFamily: fontFamily.semiBold, color: colors.textPrimary, letterSpacing: -0.25 },
  kindBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  kindBadgeHub: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
  },
  kindBadgeText: { fontSize: 10, fontFamily: fontFamily.medium, color: colors.textMuted },
  cardCompany: { marginTop: 10, fontSize: 15, fontFamily: fontFamily.semiBold, color: colors.textPrimary },
  cardMeta: { marginTop: 3, fontSize: 13, fontFamily: fontFamily.regular, color: colors.textMuted },
  chipStrip: {
    marginTop: 10,
    marginHorizontal: -2,
    maxHeight: 28,
  },
  chipStripContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingRight: 8,
  },
  listChip: {
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: radii.pill,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    flexShrink: 0,
  },
  listChipText: {
    fontSize: 11,
    fontFamily: fontFamily.medium,
    color: colors.textSecondary,
    letterSpacing: 0.1,
  },
  cardSalary: { marginTop: 10, fontSize: 14, fontFamily: fontFamily.semiBold, color: colors.teal },
  cardFooter: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
    paddingTop: 10,
  },
  cardCta: { fontSize: 13, fontFamily: fontFamily.medium, color: colors.textSecondary },
  emptyWrap: { alignItems: "center", paddingHorizontal: 24, paddingVertical: 32, gap: 12 },
  loadingHint: { fontFamily: fontFamily.medium, fontSize: 15, color: colors.textMuted },
  errTitle: { fontFamily: fontFamily.semiBold, fontSize: 17, color: colors.textPrimary },
  errSub: { fontFamily: fontFamily.regular, fontSize: 14, color: colors.textMuted, textAlign: "center", lineHeight: 20 },
  retryBtn: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: radii.md,
    backgroundColor: colors.brand,
  },
  retryBtnText: { fontFamily: fontFamily.semiBold, fontSize: 15, color: colors.white },
  secondaryCta: { marginTop: 8, paddingVertical: 12 },
  secondaryCtaText: { fontFamily: fontFamily.semiBold, fontSize: 15, color: colors.brand },
  empty: {
    textAlign: "center",
    color: colors.textMuted,
    fontSize: 15,
    fontFamily: fontFamily.regular,
    lineHeight: 22,
  },
});
