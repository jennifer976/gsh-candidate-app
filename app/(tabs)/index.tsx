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
import {
  fetchCandidateDashboard,
  fetchOwnProfile,
  fetchPublicExternalJobListings,
  fetchPublicJobs,
} from "@/lib/api-client";
import { addRecentJobSearch, loadRecentJobSearches } from "@/lib/recent-job-searches";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";
import type { ExternalJobListingPublic, Job } from "@/types/models";

type FeedTab = "hub" | "external";

function formatSalary(job: Job): string {
  const cur = job.salaryCurrency || "GBP";
  const sym = cur === "GBP" ? "£" : cur === "EUR" ? "€" : cur === "USD" ? "$" : `${cur} `;
  if (job.minSalary != null && job.maxSalary != null) {
    return `${sym}${job.minSalary.toLocaleString()}–${job.maxSalary.toLocaleString()}`;
  }
  if (job.minSalary != null) return `From ${sym}${job.minSalary.toLocaleString()}`;
  return "";
}

function externalMatchesQuery(listing: ExternalJobListingPublic, q: string): boolean {
  const dq = q.trim().toLowerCase();
  if (!dq) return true;
  const tokens = dq.split(/\s+/).filter(Boolean);
  const hay = [
    listing.title,
    listing.companyName,
    listing.location,
    listing.summary,
    listing.country,
    ...(listing.mobilityTags || []),
    listing.agencyName,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return tokens.every((t) => hay.includes(t));
}

export default function JobsScreen() {
  const router = useRouter();
  const [feedTab, setFeedTab] = useState<FeedTab>("hub");
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [recent, setRecent] = useState<string[]>([]);

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
  });

  const extListQuery = useQuery({
    queryKey: ["external-job-listings", "public"],
    queryFn: () => fetchPublicExternalJobListings(),
    staleTime: 120_000,
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
  const externalRows = extListQuery.data?.data ?? [];
  const externalFiltered = useMemo(
    () => externalRows.filter((row) => externalMatchesQuery(row, debouncedQ)),
    [externalRows, debouncedQ]
  );

  const activeData = feedTab === "hub" ? hubJobs : externalFiltered;

  const listBootloading =
    feedTab === "hub" ? hubJobsQuery.isLoading && !hubJobsQuery.data : extListQuery.isLoading && !extListQuery.data;

  const activeError = feedTab === "hub" ? hubJobsQuery.isError : extListQuery.isError;

  const onRefresh = useCallback(() => {
    void hubJobsQuery.refetch();
    void extListQuery.refetch();
    void dashQuery.refetch();
    void profileQuery.refetch();
  }, [hubJobsQuery, extListQuery, dashQuery, profileQuery]);

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

      <Pressable
        style={[styles.alertsBanner, cardSurfaceStyle(true)]}
        onPress={() => router.push("/alerts")}
        accessibilityRole="button"
        accessibilityLabel="Job alerts and saved searches"
      >
        <View style={styles.alertsRow}>
          <View style={styles.alertsIconWrap}>
            <Ionicons name="notifications" size={22} color={colors.brand} />
          </View>
          <View style={styles.alertsTextCol}>
            <Text style={styles.alertsBannerTitle}>Job alerts & saved searches</Text>
            <Text style={styles.alertsBannerSub}>Matches, email prefs, keyword alerts</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={colors.textMuted} accessibilityElementsHidden />
        </View>
      </Pressable>

      <Pressable
        style={[cardSurfaceStyle(true), styles.learnBanner]}
        onPress={() => router.push("/learn")}
        accessibilityRole="button"
        accessibilityLabel="Guides blog and resources"
      >
        <View style={styles.learnRow}>
          <View style={styles.learnIconWrap}>
            <Ionicons name="book-outline" size={22} color={colors.teal} />
          </View>
          <View style={styles.learnTextCol}>
            <Text style={styles.learnBannerTitle}>Guides, blog & curated board</Text>
            <Text style={styles.learnBannerSub}>Browse content from globalsponsorhub.com inside the app viewer</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={colors.textMuted} accessibilityElementsHidden />
        </View>
      </Pressable>

      <View style={styles.feedToggleOuter}>
        <Text style={styles.feedToggleLabel}>Job feed</Text>
        <View style={styles.feedToggle}>
          <Pressable
            style={[styles.feedChip, feedTab === "hub" && styles.feedChipOn]}
            onPress={() => setFeedTab("hub")}
            accessibilityRole="tab"
            accessibilityState={{ selected: feedTab === "hub" }}
          >
            <Text style={[styles.feedChipText, feedTab === "hub" && styles.feedChipTextOn]}>Employer postings</Text>
          </Pressable>
          <Pressable
            style={[styles.feedChip, feedTab === "external" && styles.feedChipOn]}
            onPress={() => setFeedTab("external")}
            accessibilityRole="tab"
            accessibilityState={{ selected: feedTab === "external" }}
          >
            <Text style={[styles.feedChipText, feedTab === "external" && styles.feedChipTextOn]}>Curated external</Text>
          </Pressable>
        </View>
        <Text style={styles.feedHint}>
          {feedTab === "hub"
            ? "Roles employers publish directly on Global Sponsor Hub."
            : "Partner-curated & aggregated listings — apply on the employer’s ATS."}
        </Text>
      </View>

      <View style={styles.searchOuter}>
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={20} color={colors.placeholder} style={styles.searchIcon} />
          <TextInput
            style={styles.search}
            placeholder={
              feedTab === "hub"
                ? "Search employer-posted roles…"
                : "Filter curated listings by title, company, location…"
            }
            placeholderTextColor={colors.placeholder}
            value={q}
            onChangeText={setQ}
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Search jobs"
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
      <Text style={styles.loadingHint}>{feedTab === "hub" ? "Finding employer roles…" : "Loading curated listings…"}</Text>
    </View>
  ) : activeError ? (
    <View style={styles.emptyWrap}>
      <Ionicons name="cloud-offline-outline" size={44} color={colors.textMuted} />
      <Text style={styles.errTitle}>Could not load {feedTab === "hub" ? "jobs" : "curated listings"}</Text>
      <Text style={styles.errSub}>Check your connection and pull down to retry.</Text>
      <Pressable
        style={styles.retryBtn}
        onPress={() => void (feedTab === "hub" ? hubJobsQuery.refetch() : extListQuery.refetch())}
        accessibilityRole="button"
      >
        <Text style={styles.retryBtnText}>Try again</Text>
      </Pressable>
    </View>
  ) : activeData.length === 0 ? (
    <View style={styles.emptyWrap}>
      <Ionicons name="search-outline" size={44} color={colors.borderStrong} />
      <Text style={styles.empty}>
        {feedTab === "hub"
          ? debouncedQ
            ? "No employer-posted roles match that search yet — try another keyword."
            : "No employer-posted roles right now. Pull to refresh or try curated external."
          : debouncedQ
            ? "No curated listings match that filter — clear search or try employer postings."
            : "No curated listings available yet. Pull to refresh."}
      </Text>
      {debouncedQ ? (
        <Pressable style={styles.retryBtn} onPress={() => setQ("")} accessibilityRole="button">
          <Text style={styles.retryBtnText}>Clear search</Text>
        </Pressable>
      ) : feedTab === "hub" ? (
        <Pressable style={styles.secondaryCta} onPress={() => setFeedTab("external")} accessibilityRole="button">
          <Text style={styles.secondaryCtaText}>Browse curated external →</Text>
        </Pressable>
      ) : (
        <Pressable style={styles.secondaryCta} onPress={() => setFeedTab("hub")} accessibilityRole="button">
          <Text style={styles.secondaryCtaText}>Browse employer postings →</Text>
        </Pressable>
      )}
    </View>
  ) : null;

  const refreshing = hubJobsQuery.isFetching || extListQuery.isFetching || dashQuery.isFetching || profileQuery.isFetching;

  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <FlatList
          data={activeError ? [] : activeData}
          keyExtractor={(item) => `${feedTab === "hub" ? "h" : "e"}-${item._id}`}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={emptyBody}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={[styles.listPad, activeData.length === 0 && !listBootloading && styles.listPadGrow]}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) =>
            feedTab === "hub" ? (
              <Pressable
                style={[styles.card, cardSurfaceStyle(true)]}
                onPress={() => router.push(`/job/${(item as Job)._id}`)}
                accessibilityRole="button"
              >
                <View style={styles.cardTop}>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {(item as Job).title}
                  </Text>
                  <View style={[styles.kindBadge, styles.kindBadgeHub]}>
                    <Text style={styles.kindBadgeText}>Hub</Text>
                  </View>
                </View>
                <Text style={styles.cardCompany} numberOfLines={1}>
                  {(item as Job).companyName || "Employer"}
                </Text>
                <Text style={styles.cardMeta} numberOfLines={1}>
                  {[(item as Job).locationCity, (item as Job).locationCountry].filter(Boolean).join(", ") ||
                    (item as Job).location ||
                    ""}
                  {(item as Job).jobType ? ` · ${(item as Job).jobType}` : ""}
                </Text>
                {formatSalary(item as Job) ? (
                  <Text style={styles.cardSalary}>{formatSalary(item as Job)}</Text>
                ) : null}
                <View style={styles.cardFooter}>
                  <Text style={styles.cardCta}>View role</Text>
                  <Ionicons name="arrow-forward-circle" size={22} color={colors.teal} />
                </View>
              </Pressable>
            ) : (
              <Pressable
                style={[styles.card, cardSurfaceStyle(true)]}
                onPress={() => router.push(`/external-job/${(item as ExternalJobListingPublic)._id}`)}
                accessibilityRole="button"
              >
                <View style={styles.cardTop}>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {(item as ExternalJobListingPublic).title}
                  </Text>
                  <View style={[styles.kindBadge, styles.kindBadgeExt]}>
                    <Text style={[styles.kindBadgeText, styles.kindBadgeTextExt]}>Curated</Text>
                  </View>
                </View>
                <Text style={styles.cardCompany} numberOfLines={1}>
                  {(item as ExternalJobListingPublic).companyName}
                </Text>
                <Text style={styles.cardMeta} numberOfLines={2}>
                  {[(item as ExternalJobListingPublic).location, (item as ExternalJobListingPublic).country]
                    .filter(Boolean)
                    .join(" · ")}
                  {(item as ExternalJobListingPublic).sponsorshipAvailable ? " · Sponsorship noted" : ""}
                </Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.cardCta}>Details & apply</Text>
                  <Ionicons name="open-outline" size={22} color={colors.teal} />
                </View>
              </Pressable>
            )
          }
        />
      </SafeAreaView>
    </GshScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  alertsBanner: {
    marginHorizontal: 16,
    marginTop: 10,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  alertsRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  alertsIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radii.sm,
    backgroundColor: colors.purpleMuted,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.purpleBorder,
  },
  alertsTextCol: { flex: 1 },
  alertsBannerTitle: { fontSize: 15, fontFamily: fontFamily.bold, color: colors.purpleTextDark },
  alertsBannerSub: { marginTop: 4, fontSize: 13, fontFamily: fontFamily.regular, color: colors.purpleText, lineHeight: 18 },
  learnBanner: {
    marginHorizontal: 16,
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "rgba(14, 205, 209, 0.28)",
  },
  learnRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  learnIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radii.sm,
    backgroundColor: "rgba(14, 205, 209, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(14, 205, 209, 0.35)",
  },
  learnTextCol: { flex: 1 },
  learnBannerTitle: { fontSize: 15, fontFamily: fontFamily.bold, color: colors.textPrimary },
  learnBannerSub: { marginTop: 4, fontSize: 13, fontFamily: fontFamily.regular, color: colors.textMuted, lineHeight: 18 },
  feedToggleOuter: { paddingHorizontal: 16, marginTop: 14, marginBottom: 4 },
  feedToggleLabel: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.75,
    marginBottom: 8,
  },
  feedToggle: { flexDirection: "row", gap: 10 },
  feedChip: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: "center",
  },
  feedChipOn: {
    borderColor: colors.brand,
    backgroundColor: colors.purpleMuted,
  },
  feedChipText: {
    fontSize: 13,
    fontFamily: fontFamily.semiBold,
    color: colors.textMuted,
    textAlign: "center",
  },
  feedChipTextOn: {
    color: colors.purpleTextDark,
  },
  feedHint: {
    marginTop: 10,
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    lineHeight: 18,
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
    fontSize: 12,
    fontFamily: fontFamily.bold,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 8,
  },
  recentScroll: { flexDirection: "row", gap: 8, paddingBottom: 4 },
  recentChip: {
    maxWidth: 220,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radii.pill,
    backgroundColor: colors.purpleMuted,
    borderWidth: 1,
    borderColor: colors.purpleBorder,
  },
  recentChipText: { fontSize: 14, fontFamily: fontFamily.medium, color: colors.purpleTextDark },
  listPad: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
  listPadGrow: { flexGrow: 1 },
  card: {
    padding: 16,
  },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  cardTitle: { flex: 1, fontSize: 17, fontFamily: fontFamily.bold, color: colors.textPrimary, letterSpacing: -0.2 },
  kindBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  kindBadgeHub: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
  },
  kindBadgeExt: {
    backgroundColor: "rgba(14, 205, 209, 0.12)",
    borderColor: "rgba(14, 205, 209, 0.4)",
  },
  kindBadgeText: { fontSize: 11, fontFamily: fontFamily.bold, color: colors.textMuted },
  kindBadgeTextExt: { color: colors.textMarketing },
  cardCompany: { marginTop: 8, fontSize: 15, fontFamily: fontFamily.semiBold, color: colors.textMarketing },
  cardMeta: { marginTop: 4, fontSize: 14, fontFamily: fontFamily.regular, color: colors.textMuted },
  cardSalary: { marginTop: 10, fontSize: 14, fontFamily: fontFamily.semiBold, color: colors.teal },
  cardFooter: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceMuted,
    paddingTop: 12,
  },
  cardCta: { fontSize: 14, fontFamily: fontFamily.semiBold, color: colors.brand },
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
