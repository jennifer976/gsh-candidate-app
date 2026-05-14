import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { DiscoverExploreChips, DiscoverFeaturedStrip, DiscoverMobilityChips } from "@/components/CandidateDiscoverRails";
import { CuratedExternalJobCard } from "@/components/CuratedExternalJobCard";
import { JobsHomePersonalHeader } from "@/components/JobsHomePersonalHeader";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import {
  fetchCandidateDashboard,
  fetchOwnProfile,
  fetchPublicExternalJobListings,
  fetchPublicJobs,
} from "@/lib/api-client";
import { getJobEmployerLabel, hubListingChips } from "@/lib/job-display";
import { mobilityChipStyle } from "@/lib/mobility-chip-styles";
import { addRecentJobSearch, loadRecentJobSearches } from "@/lib/recent-job-searches";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";
import type { ExternalJobListingPublic, Job } from "@/types/models";

function formatSalary(job: Job): string {
  const cur = job.salaryCurrency || "GBP";
  const sym = cur === "GBP" ? "£" : cur === "EUR" ? "€" : cur === "USD" ? "$" : `${cur} `;
  if (job.minSalary != null && job.maxSalary != null) {
    return `${sym}${job.minSalary.toLocaleString()}–${job.maxSalary.toLocaleString()}`;
  }
  if (job.minSalary != null) return `From ${sym}${job.minSalary.toLocaleString()}`;
  return "";
}

const CHIP_CAP = 4;

function HubJobCard({ job, onPress }: { job: Job; onPress: () => void }) {
  const employer = getJobEmployerLabel(job);
  const chips = hubListingChips(job, CHIP_CAP);
  const metaLine = [job.locationCity, job.locationCountry].filter(Boolean).join(", ") || job.location || "";
  const meta =
    [metaLine, job.jobType].filter((x) => typeof x === "string" && x.length > 0).join(" · ") || "";

  return (
    <Pressable style={[styles.card, cardSurfaceStyle(false)]} onPress={onPress} accessibilityRole="button">
      <Text style={styles.cardTitle} numberOfLines={2}>
        {job.title}
      </Text>
      <View style={styles.badgeRow}>
        <View style={[styles.kindBadge, styles.kindBadgeHub]}>
          <Text style={styles.kindBadgeText}>Employer</Text>
        </View>
      </View>
      <Text style={styles.cardCompany} numberOfLines={1}>
        {employer}
      </Text>
      {meta ? (
        <Text style={styles.cardMeta} numberOfLines={2}>
          {meta}
        </Text>
      ) : null}
      {chips.length > 0 ? (
        <View style={styles.chipWrap}>
          {chips.map((c) => {
            const pal = mobilityChipStyle(c);
            return (
              <View key={c} style={[styles.listChip, pal.wrap]}>
                <Text style={[styles.listChipText, pal.text]} numberOfLines={2}>
                  {c}
                </Text>
              </View>
            );
          })}
        </View>
      ) : null}
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
  const insets = useSafeAreaInsets();
  const [feedTab, setFeedTab] = useState<"employer" | "curated">("employer");
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

  /** Employer + curated load together so switching tabs hits React Query cache first (prefetch). */
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

  const curatedJobsQuery = useQuery({
    queryKey: ["external-job-listings", "home-tab", debouncedQ],
    queryFn: () =>
      fetchPublicExternalJobListings({
        q: debouncedQ || undefined,
        page: 1,
        perPage: 35,
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
  const curatedJobs = curatedJobsQuery.data?.data ?? [];

  const listRows = feedTab === "employer" ? hubJobs : curatedJobs;

  const listBootloading =
    feedTab === "employer"
      ? hubJobsQuery.isLoading && !hubJobsQuery.data
      : curatedJobsQuery.isLoading && !curatedJobsQuery.data;

  const activeError = feedTab === "employer" ? hubJobsQuery.isError : curatedJobsQuery.isError;

  const onRefresh = useCallback(() => {
    setPullRefreshing(true);
    void Promise.all([
      hubJobsQuery.refetch(),
      curatedJobsQuery.refetch(),
      dashQuery.refetch(),
      profileQuery.refetch(),
    ]).finally(() => setPullRefreshing(false));
  }, [hubJobsQuery, curatedJobsQuery, dashQuery, profileQuery]);

  const featuredJobs = dashQuery.data?.latestJobs?.slice(0, 8) ?? [];

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

      <View style={styles.searchOuter}>
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={20} color={colors.placeholder} style={styles.searchIcon} />
          <TextInput
            style={styles.search}
            placeholder={
              feedTab === "employer" ? "Search jobs, companies or keywords." : "Search curated roles…"
            }
            placeholderTextColor={colors.placeholder}
            value={q}
            onChangeText={setQ}
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel={feedTab === "employer" ? "Search employer job listings" : "Search curated external job listings"}
            returnKeyType="search"
          />
          <Pressable
            onPress={() => router.push("/alerts")}
            hitSlop={10}
            style={styles.searchFilterBtn}
            accessibilityRole="button"
            accessibilityLabel="Job alerts and saved searches"
          >
            <Ionicons name="options-outline" size={22} color={colors.placeholder} />
          </Pressable>
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

      <DiscoverMobilityChips
        onPick={(term) => {
          setFeedTab("employer");
          setQ(term);
        }}
      />

      <DiscoverFeaturedStrip
        jobs={featuredJobs}
        onOpen={(id) => router.push(`/job/${id}`)}
        onViewAll={() => {
          setFeedTab("employer");
          setQ("");
        }}
      />

      <DiscoverExploreChips query={q} onPick={setQ} />

      <View style={styles.hubSection}>
        <Text style={styles.hubSectionLabel}>Your hub</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hubScroll}>
          <Pressable
            style={[styles.shortcutTileH, cardSurfaceStyle(false)]}
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
            style={[styles.shortcutTileH, cardSurfaceStyle(false)]}
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
            style={[styles.shortcutTileH, cardSurfaceStyle(false)]}
            onPress={() => router.push("/tools-resources")}
            accessibilityRole="button"
            accessibilityLabel="Tools and resources"
          >
            <View style={styles.shortcutIconWrap}>
              <Ionicons name="library-outline" size={22} color={colors.textMarketing} />
            </View>
            <Text style={styles.shortcutTitle}>Tools</Text>
            <Text style={styles.shortcutSub}>Guides & legal</Text>
          </Pressable>
          <Pressable
            style={[styles.shortcutTileH, cardSurfaceStyle(false)]}
            onPress={() => router.push("/ats-assistant")}
            accessibilityRole="button"
            accessibilityLabel="ATS assistant"
          >
            <View style={styles.shortcutIconWrap}>
              <Ionicons name="document-text-outline" size={22} color={colors.textMarketing} />
            </View>
            <Text style={styles.shortcutTitle}>ATS match</Text>
            <Text style={styles.shortcutSub}>CV vs job</Text>
          </Pressable>
        </ScrollView>
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

      <View style={styles.feedTabsOuter}>
        <Text style={styles.feedTabsLabel}>Job feed</Text>
        <View style={styles.feedTabsRow}>
          <Pressable
            style={[styles.feedTab, feedTab === "employer" && styles.feedTabActive]}
            onPress={() => setFeedTab("employer")}
            accessibilityRole="button"
            accessibilityState={{ selected: feedTab === "employer" }}
          >
            <Text style={[styles.feedTabText, feedTab === "employer" && styles.feedTabTextActive]}>Employer</Text>
          </Pressable>
          <Pressable
            style={[styles.feedTab, feedTab === "curated" && styles.feedTabActiveCurated]}
            onPress={() => setFeedTab("curated")}
            accessibilityRole="button"
            accessibilityState={{ selected: feedTab === "curated" }}
          >
            <Text style={[styles.feedTabText, feedTab === "curated" && styles.feedTabTextActiveCurated]}>Curated</Text>
          </Pressable>
        </View>
      </View>

      {feedTab === "employer" ? (
        <View style={styles.feedIntroOuter}>
          <Text style={styles.feedIntroLabel}>Employer listings</Text>
          <Text style={styles.feedIntroHint}>
            Direct employer posts on Global Sponsor Hub. Switch to Curated for agency-submitted and wider-web links (apply on external sites).
          </Text>
        </View>
      ) : (
        <View style={styles.feedIntroOuter}>
          <Text style={styles.feedIntroLabel}>Curated external roles</Text>
          <Text style={styles.feedIntroHint}>
            Hand-picked or agency-submitted links to careers hosted elsewhere. You apply on the employer or ATS site — not inside this app.
          </Text>
          <Pressable onPress={() => router.push("/curated-listings")} accessibilityRole="link" style={styles.feedIntroLinkWrap}>
            <Text style={styles.feedIntroLink}>Open full curated browser →</Text>
          </Pressable>
        </View>
      )}
    </>
  );

  const emptyBody = listBootloading ? (
    <View style={styles.emptyWrap}>
      <ActivityIndicator size="large" color={colors.brand} />
      <Text style={styles.loadingHint}>
        {feedTab === "employer" ? "Loading employer listings…" : "Loading curated listings…"}
      </Text>
    </View>
  ) : activeError ? (
    <View style={styles.emptyWrap}>
      <Ionicons name="cloud-offline-outline" size={44} color={colors.textMuted} />
      <Text style={styles.errTitle}>Could not load listings</Text>
      <Text style={styles.errSub}>Check your connection and pull down to retry.</Text>
      <Pressable
        style={styles.retryBtn}
        onPress={() => void (feedTab === "employer" ? hubJobsQuery.refetch() : curatedJobsQuery.refetch())}
        accessibilityRole="button"
      >
        <Text style={styles.retryBtnText}>Try again</Text>
      </Pressable>
    </View>
  ) : listRows.length === 0 ? (
    <View style={styles.emptyWrap}>
      <Ionicons name="search-outline" size={44} color={colors.borderStrong} />
      <Text style={styles.empty}>
        {feedTab === "employer"
          ? debouncedQ
            ? "No employer listings match that search — try another keyword."
            : "No employer listings right now. Pull to refresh."
          : debouncedQ
            ? "No curated listings match that search — try another keyword."
            : "No curated listings right now. Pull to refresh."}
      </Text>
      {debouncedQ ? (
        <Pressable style={styles.retryBtn} onPress={() => setQ("")} accessibilityRole="button">
          <Text style={styles.retryBtnText}>Clear search</Text>
        </Pressable>
      ) : feedTab === "employer" ? (
        <Pressable style={styles.secondaryCta} onPress={() => setFeedTab("curated")} accessibilityRole="button">
          <Text style={styles.secondaryCtaText}>Try curated listings →</Text>
        </Pressable>
      ) : (
        <Pressable style={styles.secondaryCta} onPress={() => router.push("/curated-listings")} accessibilityRole="button">
          <Text style={styles.secondaryCtaText}>Open full curated browser →</Text>
        </Pressable>
      )}
    </View>
  ) : null;

  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <View style={styles.discoverShell}>
          <View style={[styles.discoverTopBar, { paddingTop: Math.max(insets.top, 10) }]}>
            <Image
              source={require("../../assets/brand-mark.webp")}
              style={styles.discoverTopLogo}
              resizeMode="contain"
              accessibilityLabel="Global Sponsor Hub"
              accessibilityIgnoresInvertColors
            />
            <View style={styles.discoverTopActions}>
              <Pressable
                onPress={() => router.push("/notification-feed")}
                style={styles.discoverTopIconBtn}
                accessibilityRole="button"
                accessibilityLabel="Notifications"
              >
                <Ionicons name="notifications-outline" size={22} color={colors.white} />
              </Pressable>
              <Pressable
                onPress={() => router.push("/(tabs)/messages")}
                style={styles.discoverTopIconBtn}
                accessibilityRole="button"
                accessibilityLabel="Messages"
              >
                <Ionicons name="chatbubbles-outline" size={22} color={colors.white} />
              </Pressable>
            </View>
          </View>
          <FlatList
          data={activeError ? [] : listRows}
          keyExtractor={(item) => item._id}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={emptyBody}
          refreshControl={<RefreshControl refreshing={pullRefreshing} onRefresh={onRefresh} />}
          contentContainerStyle={[
            styles.listPad,
            listRows.length === 0 && !listBootloading && styles.listPadGrow,
          ]}
          keyboardShouldPersistTaps="handled"
          style={styles.discoverList}
          renderItem={({ item }) =>
            feedTab === "employer" ? (
              <HubJobCard job={item as Job} onPress={() => router.push(`/job/${(item as Job)._id}`)} />
            ) : (
              <CuratedExternalJobCard
                job={item as ExternalJobListingPublic}
                onPress={() => router.push(`/external-job/${(item as ExternalJobListingPublic)._id}`)}
              />
            )
          }
        />
        </View>
      </SafeAreaView>
    </GshScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  discoverShell: { flex: 1 },
  discoverList: { flex: 1 },
  discoverTopBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.navy,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.14)",
  },
  discoverTopLogo: {
    width: 44,
    height: 44,
  },
  discoverTopActions: { flexDirection: "row", alignItems: "center" },
  discoverTopIconBtn: { padding: 8, marginLeft: 2 },
  hubSection: { marginTop: 12 },
  hubSectionLabel: {
    marginHorizontal: 16,
    fontSize: 11,
    fontFamily: fontFamily.medium,
    color: colors.textMuted,
    letterSpacing: 0.4,
    marginBottom: 10,
  },
  hubScroll: { paddingHorizontal: 16, gap: 10, paddingBottom: 2 },
  shortcutTileH: {
    width: 138,
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
  feedTabsOuter: { marginHorizontal: 16, marginTop: 14 },
  feedTabsLabel: {
    fontSize: 11,
    fontFamily: fontFamily.medium,
    color: colors.textMuted,
    letterSpacing: 0.35,
    marginBottom: 8,
  },
  feedTabsRow: { flexDirection: "row", gap: 10 },
  feedTab: {
    flex: 1,
    paddingVertical: 11,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  feedTabActive: {
    borderColor: "rgba(14, 205, 209, 0.55)",
    backgroundColor: "rgba(14, 205, 209, 0.09)",
  },
  feedTabActiveCurated: {
    borderColor: colors.purpleBorder,
    backgroundColor: colors.purpleMuted,
  },
  feedTabText: { fontSize: 14, fontFamily: fontFamily.semiBold, color: colors.textMuted },
  feedTabTextActive: { color: colors.navy },
  feedTabTextActiveCurated: { color: colors.purpleTextDark },
  feedIntroOuter: { paddingHorizontal: 16, marginTop: 14, marginBottom: 4 },
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
  feedIntroLinkWrap: { marginTop: 10, alignSelf: "flex-start" },
  feedIntroLink: { fontSize: 13, fontFamily: fontFamily.semiBold, color: colors.brand },
  searchOuter: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 8 },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.92)",
    paddingHorizontal: 12,
  },
  searchIcon: { marginRight: 4 },
  searchFilterBtn: { padding: 4, marginLeft: 4 },
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
  cardTitle: { fontSize: 16, fontFamily: fontFamily.semiBold, color: colors.textPrimary, letterSpacing: -0.25 },
  badgeRow: { marginTop: 8, flexDirection: "row", flexWrap: "wrap", gap: 8 },
  kindBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  kindBadgeHub: {
    backgroundColor: "rgba(14, 205, 209, 0.12)",
    borderColor: "rgba(14, 205, 209, 0.35)",
  },
  kindBadgeText: { fontSize: 10, fontFamily: fontFamily.bold, color: "#0f766e", letterSpacing: 0.15 },
  chipWrap: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  cardCompany: { marginTop: 10, fontSize: 15, fontFamily: fontFamily.semiBold, color: colors.textPrimary },
  cardMeta: { marginTop: 3, fontSize: 13, fontFamily: fontFamily.regular, color: colors.textMuted },
  listChip: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radii.pill,
    maxWidth: "100%",
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
  errTitle: { fontFamily: fontFamily.semiBold, fontSize: 17, color: colors.navy },
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
