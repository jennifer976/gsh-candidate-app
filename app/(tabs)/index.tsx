import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import {
  DiscoverFeaturedStrip,
  DiscoverListingInfoModal,
  DiscoverTopicsFilterModal,
  DiscoverTopicsFilterTrigger,
} from "@/components/CandidateDiscoverRails";
import { CuratedExternalJobCard } from "@/components/CuratedExternalJobCard";
import { JobsHomePersonalHeader } from "@/components/JobsHomePersonalHeader";
import { brandMark } from "@/lib/brand-assets";
import {
  fetchCandidateDashboard,
  fetchOwnProfile,
  fetchPublicExternalJobListings,
  fetchPublicJobs,
  fetchSavedJobs,
  saveJob,
  unsaveJob,
} from "@/lib/api-client";
import { getJobEmployerLabel, hubListingChips } from "@/lib/job-display";
import { mobilityChipStyle } from "@/lib/mobility-chip-styles";
import { addRecentJobSearch, loadRecentJobSearches } from "@/lib/recent-job-searches";
import { colors, discoverFeedCardStyle, discoverSearchFieldStyle, fontFamily, radii } from "@/lib/theme";
import type { CandidateProfile, ExternalJobListingPublic, Job } from "@/types/models";

function formatSalary(job: Job): string {
  const cur = job.salaryCurrency || "GBP";
  const sym = cur === "GBP" ? "£" : cur === "EUR" ? "€" : cur === "USD" ? "$" : `${cur} `;
  if (job.minSalary != null && job.maxSalary != null) {
    return `${sym}${job.minSalary.toLocaleString()}–${job.maxSalary.toLocaleString()}`;
  }
  if (job.minSalary != null) return `From ${sym}${job.minSalary.toLocaleString()}`;
  return "";
}

const CHIP_CAP = 2;

function DiscoverQuickNav({ router }: { router: ReturnType<typeof useRouter> }) {
  const items: {
    icon: "stats-chart-outline" | "notifications-outline" | "library-outline" | "document-text-outline";
    label: string;
    onPress: () => void;
    a11y: string;
  }[] = [
    { icon: "stats-chart-outline", label: "Dashboard", onPress: () => router.push("/dashboard"), a11y: "Open dashboard" },
    { icon: "notifications-outline", label: "Alerts", onPress: () => router.push("/alerts"), a11y: "Job alerts" },
    { icon: "library-outline", label: "Tools", onPress: () => router.push("/tools-resources"), a11y: "Tools and resources" },
    { icon: "document-text-outline", label: "ATS", onPress: () => router.push("/ats-assistant"), a11y: "ATS match assistant" },
  ];
  return (
    <View style={[styles.quickNavShell, discoverFeedCardStyle()]}>
      <View style={styles.quickNav}>
        {items.map((it) => (
          <Pressable key={it.label} style={styles.quickNavItem} onPress={it.onPress} accessibilityRole="button" accessibilityLabel={it.a11y}>
            <View style={styles.quickNavIconCircle}>
              <Ionicons name={it.icon} size={20} color={colors.navy} />
            </View>
            <Text style={styles.quickNavLabel} numberOfLines={1}>
              {it.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function HubJobCard({
  job,
  onPress,
  savedRowId,
  bookmarkLoading,
  onToggleBookmark,
}: {
  job: Job;
  onPress: () => void;
  savedRowId: string | undefined;
  bookmarkLoading: boolean;
  onToggleBookmark: () => void;
}) {
  const employer = getJobEmployerLabel(job);
  const chips = hubListingChips(job, CHIP_CAP);
  const metaLine = [job.locationCity, job.locationCountry].filter(Boolean).join(", ") || job.location || "";
  const meta = [metaLine, job.jobType].filter((x) => typeof x === "string" && x.length > 0).join(" · ") || "";
  const sal = formatSalary(job);
  const initial = (employer.trim().charAt(0) || "G").toUpperCase();

  return (
    <View style={[styles.card, discoverFeedCardStyle()]}>
      <View style={styles.cardTopRow}>
        <Pressable onPress={onPress} style={styles.cardMainHit} accessibilityRole="button">
          <View style={styles.cardAvatar}>
            <Text style={styles.cardAvatarText}>{initial}</Text>
          </View>
          <View style={styles.cardMid}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {job.title}
            </Text>
            <Text style={styles.cardCompanyLine} numberOfLines={1}>
              {employer}
            </Text>
            {meta ? (
              <Text style={styles.cardMetaLine} numberOfLines={1}>
                {meta}
              </Text>
            ) : null}
            {chips.length > 0 ? (
              <View style={styles.chipWrap}>
                {chips.map((c) => {
                  const pal = mobilityChipStyle(c);
                  return (
                    <View key={c} style={[styles.listChip, pal.wrap]}>
                      <Text style={[styles.listChipText, pal.text]} numberOfLines={1}>
                        {c}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ) : null}
          </View>
        </Pressable>
        <Pressable
          onPress={() => {
            onToggleBookmark();
          }}
          hitSlop={10}
          style={styles.cardBookmarkHit}
          accessibilityRole="button"
          accessibilityLabel={savedRowId ? "Remove from saved jobs" : "Save job"}
          disabled={bookmarkLoading}
        >
          {bookmarkLoading ? (
            <ActivityIndicator size="small" color={colors.brand} />
          ) : (
            <Ionicons name={savedRowId ? "bookmark" : "bookmark-outline"} size={22} color={savedRowId ? colors.brand : colors.textMuted} />
          )}
        </Pressable>
      </View>
      <Pressable onPress={onPress} accessibilityRole="button">
        <View style={styles.cardFooter}>
          {sal ? (
            <Text style={styles.cardSalary} numberOfLines={1}>
              {sal}
            </Text>
          ) : (
            <View style={styles.cardSalarySpacer} />
          )}
          <View style={styles.cardFooterEnd}>
            <Text style={styles.cardCta}>View</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </View>
        </View>
      </Pressable>
    </View>
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
  const [topicsModalOpen, setTopicsModalOpen] = useState(false);
  const [listingInfoOpen, setListingInfoOpen] = useState(false);

  const qc = useQueryClient();
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

  const savedJobsQuery = useQuery({
    queryKey: ["saved-jobs"],
    queryFn: fetchSavedJobs,
    staleTime: 60_000,
  });

  const saveJobMut = useMutation({
    mutationFn: (jobId: string) => saveJob(jobId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["saved-jobs"] });
      void qc.invalidateQueries({ queryKey: ["analytics", "candidate-dashboard"] });
    },
    onError: (e: unknown) =>
      Alert.alert(
        "Could not save",
        e && typeof e === "object" && "message" in e ? String((e as { message: string }).message) : "Try again."
      ),
  });

  const unsaveJobMut = useMutation({
    mutationFn: (savedRowId: string) => unsaveJob(savedRowId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["saved-jobs"] });
      void qc.invalidateQueries({ queryKey: ["analytics", "candidate-dashboard"] });
    },
    onError: (e: unknown) =>
      Alert.alert(
        "Could not update",
        e && typeof e === "object" && "message" in e ? String((e as { message: string }).message) : "Try again."
      ),
  });
  const firstName =
    profileQuery.data && typeof (profileQuery.data as { firstName?: unknown }).firstName === "string"
      ? String((profileQuery.data as { firstName: string }).firstName)
      : "";

  const profileLocation =
    profileQuery.data && typeof (profileQuery.data as CandidateProfile).location === "string"
      ? String((profileQuery.data as CandidateProfile).location).trim()
      : "";

  const savedJobIdByListingId = useMemo(() => {
    const m = new Map<string, string>();
    for (const row of savedJobsQuery.data ?? []) {
      const jid = row.jobId?._id;
      if (jid) m.set(jid, row._id);
    }
    return m;
  }, [savedJobsQuery.data]);
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
      savedJobsQuery.refetch(),
    ]).finally(() => setPullRefreshing(false));
  }, [hubJobsQuery, curatedJobsQuery, dashQuery, profileQuery, savedJobsQuery]);

  const featuredJobs = dashQuery.data?.latestJobs?.slice(0, 8) ?? [];

  const listHeader = (
    <>
      <JobsHomePersonalHeader
        compact
        feedVisual
        focusLine={profileLocation || null}
        firstName={firstName}
        completionPct={completionPct}
        stats={quickStats}
        statsLoading={dashQuery.isLoading && !dashQuery.data}
        onProfile={() => router.push("/(tabs)/profile")}
        onApplied={() => router.push("/(tabs)/applications")}
        onSaved={() => router.push("/(tabs)/saved")}
        onDashboard={() => router.push("/dashboard")}
      />

      <View style={[styles.discoverDeck, discoverFeedCardStyle()]}>
        <View style={[styles.searchWrap, discoverSearchFieldStyle()]}>
          <Ionicons name="search" size={20} color={colors.placeholder} style={styles.searchIcon} />
          <TextInput
            style={styles.search}
            placeholder={feedTab === "employer" ? "Search roles, employers, skills…" : "Search curated roles…"}
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

        <View style={styles.segmentHost}>
          <Pressable
            style={[styles.segmentCell, feedTab === "employer" && styles.segmentCellOn]}
            onPress={() => setFeedTab("employer")}
            accessibilityRole="button"
            accessibilityState={{ selected: feedTab === "employer" }}
          >
            <Text style={[styles.segmentText, feedTab === "employer" && styles.segmentTextOn]}>Employer posts</Text>
          </Pressable>
          <Pressable
            style={[styles.segmentCell, feedTab === "curated" && styles.segmentCellOnCurated]}
            onPress={() => setFeedTab("curated")}
            accessibilityRole="button"
            accessibilityState={{ selected: feedTab === "curated" }}
          >
            <Text style={[styles.segmentText, feedTab === "curated" && styles.segmentTextOnCurated]}>Curated links</Text>
          </Pressable>
        </View>

        <View style={styles.deckMetaRow}>
          <Text style={styles.deckSubOneLine} numberOfLines={2}>
            {feedTab === "employer"
              ? "Direct employers — apply in the app where enabled."
              : "Partner links — you apply on the employer’s careers site."}
          </Text>
          <Pressable
            onPress={() => setListingInfoOpen(true)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="How this feed works"
          >
            <Ionicons name="information-circle-outline" size={22} color={colors.brand} />
          </Pressable>
        </View>

        <DiscoverTopicsFilterTrigger query={q} onPress={() => setTopicsModalOpen(true)} />
      </View>

      <DiscoverFeaturedStrip
        jobs={featuredJobs}
        onOpen={(id) => router.push(`/job/${id}`)}
        onViewAll={() => {
          setFeedTab("employer");
          setQ("");
        }}
      />

      {recent.length > 0 ? (
        <View style={styles.recentOuter}>
          <Text style={styles.recentLabel}>Recent searches</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentScroll}>
            {recent.map((term) => (
              <Pressable key={term} style={styles.recentChip} onPress={() => setQ(term)} accessibilityRole="button">
                <Text style={styles.recentChipText} numberOfLines={1}>
                  {term}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}

      <DiscoverQuickNav router={router} />

      <View style={styles.listHeadingRow}>
        <Text style={styles.listHeading}>
          {feedTab === "employer" ? "Roles for you" : "Curated picks"}
        </Text>
        {feedTab === "curated" ? (
          <Pressable onPress={() => router.push("/curated-listings")} accessibilityRole="link">
            <Text style={styles.listHeadingLink}>See all</Text>
          </Pressable>
        ) : null}
      </View>
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
    <View style={styles.discoverAppShell}>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <View style={styles.discoverShell}>
          <View style={[styles.discoverTopBar, discoverFeedCardStyle(), { paddingTop: Math.max(insets.top, 12) }]}>
            <View style={styles.discoverBrandBlock}>
              <Image source={brandMark} style={styles.discoverMark} resizeMode="contain" accessibilityIgnoresInvertColors />
              <View style={styles.discoverBrandText}>
                <Text style={styles.discoverTitle}>Discover</Text>
                <Text style={styles.discoverSubtitle} numberOfLines={1}>
                  Sponsored & global roles
                </Text>
              </View>
            </View>
            <View style={styles.discoverTopActions}>
              <Pressable
                onPress={() => router.push("/notification-feed")}
                style={styles.discoverTopIconBtn}
                accessibilityRole="button"
                accessibilityLabel="Notifications"
              >
                <Ionicons name="notifications-outline" size={23} color={colors.navy} />
              </Pressable>
              <Pressable
                onPress={() => router.push("/(tabs)/messages")}
                style={styles.discoverTopIconBtn}
                accessibilityRole="button"
                accessibilityLabel="Messages"
              >
                <Ionicons name="chatbubbles-outline" size={23} color={colors.navy} />
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
              <HubJobCard
                job={item as Job}
                onPress={() => router.push(`/job/${(item as Job)._id}`)}
                savedRowId={savedJobIdByListingId.get((item as Job)._id)}
                bookmarkLoading={
                  (saveJobMut.isPending && saveJobMut.variables === (item as Job)._id) ||
                  (unsaveJobMut.isPending && unsaveJobMut.variables === savedJobIdByListingId.get((item as Job)._id))
                }
                onToggleBookmark={() => {
                  const j = item as Job;
                  const sid = savedJobIdByListingId.get(j._id);
                  if (sid) unsaveJobMut.mutate(sid);
                  else saveJobMut.mutate(j._id);
                }}
              />
            ) : (
              <CuratedExternalJobCard
                job={item as ExternalJobListingPublic}
                onPress={() => router.push(`/external-job/${(item as ExternalJobListingPublic)._id}`)}
              />
            )
          }
        />
        <DiscoverTopicsFilterModal
          visible={topicsModalOpen}
          onClose={() => setTopicsModalOpen(false)}
          query={q}
          onPickExplore={setQ}
          onPickMobility={(term) => {
            setFeedTab("employer");
            setQ(term);
          }}
        />
        <DiscoverListingInfoModal
          visible={listingInfoOpen}
          onClose={() => setListingInfoOpen(false)}
          feedTab={feedTab}
        />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  discoverAppShell: { flex: 1, backgroundColor: colors.discoverCanvas },
  discoverShell: { flex: 1, backgroundColor: colors.discoverCanvas },
  discoverList: { flex: 1, backgroundColor: colors.discoverCanvas },
  discoverTopBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 14,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 6,
  },
  discoverBrandBlock: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1, minWidth: 0 },
  discoverMark: { width: 40, height: 40, borderRadius: 12 },
  discoverBrandText: { flex: 1, minWidth: 0 },
  discoverTitle: {
    fontSize: 22,
    fontFamily: fontFamily.extraBold,
    color: colors.navy,
    letterSpacing: -0.5,
  },
  discoverSubtitle: {
    marginTop: 2,
    fontSize: 13,
    fontFamily: fontFamily.medium,
    color: colors.textMuted,
  },
  discoverTopActions: { flexDirection: "row", alignItems: "center" },
  discoverTopIconBtn: { padding: 8, marginLeft: 2 },
  discoverDeck: {
    marginHorizontal: 16,
    marginTop: 4,
    padding: 16,
    gap: 14,
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  segmentHost: {
    flexDirection: "row",
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.pill,
    padding: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  segmentCell: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
  },
  segmentCellOn: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "rgba(14, 205, 209, 0.5)",
    shadowColor: colors.teal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  segmentCellOnCurated: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.purpleBorder,
    shadowColor: colors.purple,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  segmentText: {
    fontSize: 13,
    fontFamily: fontFamily.semiBold,
    color: colors.textMuted,
  },
  segmentTextOn: { color: colors.navy },
  segmentTextOnCurated: { color: colors.purpleTextDark },
  deckMetaRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  deckSubOneLine: {
    flex: 1,
    fontSize: 12,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    lineHeight: 17,
  },
  quickNavShell: {
    marginHorizontal: 16,
    marginTop: 6,
    marginBottom: 4,
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  quickNav: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickNavItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 6,
    minWidth: 0,
  },
  quickNavIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  quickNavLabel: {
    marginTop: 6,
    fontSize: 10,
    fontFamily: fontFamily.semiBold,
    color: colors.textSecondary,
    textAlign: "center",
  },
  listHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    gap: 12,
  },
  listHeading: {
    flex: 1,
    fontSize: 20,
    fontFamily: fontFamily.extraBold,
    color: colors.navy,
    letterSpacing: -0.45,
  },
  listHeadingLink: {
    fontSize: 14,
    fontFamily: fontFamily.semiBold,
    color: colors.brand,
  },
  searchIcon: { marginRight: 4 },
  searchFilterBtn: { padding: 4, marginLeft: 4 },
  search: {
    flex: 1,
    paddingVertical: 11,
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
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radii.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#64748b",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  recentChipText: { fontSize: 13, fontFamily: fontFamily.medium, color: colors.textSecondary },
  listPad: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 32, gap: 14 },
  listPadGrow: { flexGrow: 1 },
  card: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  cardMainHit: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    minWidth: 0,
  },
  cardAvatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#64748b",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
  },
  cardAvatarText: { fontSize: 17, fontFamily: fontFamily.bold, color: colors.navy },
  cardMid: { flex: 1, minWidth: 0 },
  cardBookmarkHit: { paddingTop: 2, paddingLeft: 2 },
  cardTitle: { fontSize: 16, fontFamily: fontFamily.bold, color: colors.navy, letterSpacing: -0.25 },
  cardCompanyLine: {
    marginTop: 4,
    fontSize: 13,
    fontFamily: fontFamily.semiBold,
    color: colors.textPrimary,
  },
  cardMetaLine: {
    marginTop: 2,
    fontSize: 12,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
  },
  chipWrap: {
    marginTop: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
  },
  listChip: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: radii.pill,
    maxWidth: "100%",
  },
  listChipText: {
    fontSize: 10,
    fontFamily: fontFamily.medium,
    letterSpacing: 0.05,
  },
  cardSalary: {
    flex: 1,
    marginRight: 12,
    fontSize: 14,
    fontFamily: fontFamily.bold,
    color: colors.brand,
  },
  cardSalarySpacer: { flex: 1 },
  cardFooter: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 4,
  },
  cardFooterEnd: { flexDirection: "row", alignItems: "center", gap: 4 },
  cardCta: { fontSize: 13, fontFamily: fontFamily.semiBold, color: colors.brand },
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
