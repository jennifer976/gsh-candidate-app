import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  DiscoverListingInfoModal,
  DiscoverTopicsFilterModal,
} from "@/components/CandidateDiscoverRails";
import { CompanyLogo } from "@/components/CompanyLogo";
import { CuratedExternalJobCard } from "@/components/CuratedExternalJobCard";
import { JobCardSkeleton } from "@/components/SkeletonLoader";
import { brandLogoWhite } from "@/lib/brand-assets";
import {
  fetchCandidateDashboard,
  fetchOwnProfile,
  fetchPublicExternalJobListings,
  fetchPublicJobs,
  fetchSavedJobs,
  saveJob,
  unsaveJob,
} from "@/lib/api-client";
import { hapticLight, hapticSuccess } from "@/lib/haptics";
import { getJobEmployerLabel, getJobLogoUrl, hubListingChips } from "@/lib/job-display";
import { mobilityChipStyle } from "@/lib/mobility-chip-styles";
import { addRecentJobSearch, loadRecentJobSearches } from "@/lib/recent-job-searches";
import { colors, fontFamily, radii } from "@/lib/theme";
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
  const logoUrl = getJobLogoUrl(job);
  const chips = hubListingChips(job, CHIP_CAP);
  const metaLine = [job.locationCity, job.locationCountry].filter(Boolean).join(", ") || job.location || "";
  const meta = [metaLine, job.jobType].filter((x) => typeof x === "string" && x.length > 0).join(" · ") || "";
  const sal = formatSalary(job);

  return (
    <View style={styles.card}>
      <Pressable onPress={onPress} style={styles.cardMainHit} accessibilityRole="button">
        <CompanyLogo logoUrl={logoUrl} companyName={employer} size={48} radius={13} />
        <View style={styles.cardMid}>
          <Text style={styles.cardTitle} numberOfLines={2}>{job.title}</Text>
          <Text style={styles.cardCompanyLine} numberOfLines={1}>{employer}</Text>
          {meta ? (
            <Text style={styles.cardMetaLine} numberOfLines={1}>{meta}</Text>
          ) : null}
          {chips.length > 0 ? (
            <View style={styles.chipWrap}>
              {chips.map((c) => {
                const pal = mobilityChipStyle(c);
                return (
                  <View key={c} style={[styles.listChip, pal.wrap]}>
                    <Text style={[styles.listChipText, pal.text]} numberOfLines={1}>{c}</Text>
                  </View>
                );
              })}
            </View>
          ) : null}
        </View>
        <Pressable
          onPress={() => { void hapticLight(); onToggleBookmark(); }}
          hitSlop={10}
          style={styles.cardBookmarkHit}
          accessibilityRole="button"
          accessibilityLabel={savedRowId ? "Remove from saved jobs" : "Save job"}
          disabled={bookmarkLoading}
        >
          {bookmarkLoading ? (
            <ActivityIndicator size="small" color={colors.brand} />
          ) : (
            <Ionicons
              name={savedRowId ? "bookmark" : "bookmark-outline"}
              size={22}
              color={savedRowId ? colors.brand : colors.textMuted}
            />
          )}
        </Pressable>
      </Pressable>
      <Pressable onPress={onPress} accessibilityRole="button">
        <View style={styles.cardFooter}>
          {sal ? (
            <Text style={styles.cardSalary} numberOfLines={1}>{sal}</Text>
          ) : (
            <View style={styles.cardSalarySpacer} />
          )}
          <View style={styles.cardFooterEnd}>
            <Text style={styles.cardCta}>View role</Text>
            <Ionicons name="arrow-forward" size={15} color={colors.brand} />
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
  const [locationFilter, setLocationFilter] = useState("");

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
    return () => { cancelled = true; };
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
    queryKey: ["public-jobs", debouncedQ, locationFilter],
    queryFn: () =>
      fetchPublicJobs({
        q: debouncedQ || undefined,
        location: locationFilter.trim() || undefined,
        page: 1,
        perPage: 25,
      }),
    staleTime: 60_000,
  });

  const curatedJobsQuery = useQuery({
    queryKey: ["external-job-listings", "home-tab", debouncedQ, locationFilter],
    queryFn: () => {
      const loc = locationFilter.trim();
      const combinedQ = [debouncedQ, loc].filter(Boolean).join(" ").trim();
      return fetchPublicExternalJobListings({ q: combinedQ || undefined, page: 1, perPage: 35 });
    },
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
      Alert.alert("Could not save", e && typeof e === "object" && "message" in e
        ? String((e as { message: string }).message) : "Try again."),
  });

  const unsaveJobMut = useMutation({
    mutationFn: (savedRowId: string) => unsaveJob(savedRowId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["saved-jobs"] });
      void qc.invalidateQueries({ queryKey: ["analytics", "candidate-dashboard"] });
    },
    onError: (e: unknown) =>
      Alert.alert("Could not update", e && typeof e === "object" && "message" in e
        ? String((e as { message: string }).message) : "Try again."),
  });

  const firstName =
    profileQuery.data && typeof (profileQuery.data as { firstName?: unknown }).firstName === "string"
      ? String((profileQuery.data as { firstName: string }).firstName)
      : "";

  const savedJobIdByListingId = useMemo(() => {
    const m = new Map<string, string>();
    for (const row of savedJobsQuery.data ?? []) {
      const jid = row.jobId?._id;
      if (jid) m.set(jid, row._id);
    }
    return m;
  }, [savedJobsQuery.data]);

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

  const greeting = firstName ? `Hello, ${firstName}` : "Hello";

  const listHeader = (
    <>
      {/* ── Navy hero ── */}
      <LinearGradient
        colors={[colors.navy, colors.navyDeep]}
        style={[styles.hero, { paddingTop: Math.max(insets.top, 16) }]}
      >
        <View style={styles.heroTopRow}>
          <Image
            source={brandLogoWhite}
            style={styles.heroLogo}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
            accessibilityLabel="Global Sponsor Hub"
          />
          <View style={styles.heroActions}>
            <Pressable
              onPress={() => router.push("/notification-feed")}
              style={styles.heroIconBtn}
              accessibilityRole="button"
              accessibilityLabel="Notifications"
            >
              <Ionicons name="notifications-outline" size={22} color="rgba(255,255,255,0.9)" />
            </Pressable>
            <Pressable
              onPress={() => router.push("/(tabs)/messages")}
              style={styles.heroIconBtn}
              accessibilityRole="button"
              accessibilityLabel="Messages"
            >
              <Ionicons name="chatbubble-outline" size={22} color="rgba(255,255,255,0.9)" />
            </Pressable>
          </View>
        </View>

        <Text style={styles.heroGreetingLabel}>Good to see you</Text>
        <Text style={styles.heroGreeting}>{greeting}</Text>

        {dashQuery.isLoading && !dashQuery.data ? (
          <View style={styles.statsLoading}>
            <ActivityIndicator size="small" color="rgba(255,255,255,0.5)" />
          </View>
        ) : quickStats ? (
          <View style={styles.statsRow}>
            <Pressable style={styles.statCell} onPress={() => router.push("/(tabs)/applications")} accessibilityRole="button">
              <Text style={styles.statNum}>{quickStats.applied}</Text>
              <Text style={styles.statLab}>Applied</Text>
            </Pressable>
            <View style={styles.statDivider} />
            <Pressable style={styles.statCell} onPress={() => router.push("/(tabs)/saved")} accessibilityRole="button">
              <Text style={styles.statNum}>{quickStats.saved}</Text>
              <Text style={styles.statLab}>Saved</Text>
            </Pressable>
            <View style={styles.statDivider} />
            <Pressable style={styles.statCell} onPress={() => router.push("/dashboard")} accessibilityRole="button">
              <Text style={styles.statNum}>{quickStats.interviews}</Text>
              <Text style={styles.statLab}>Interviews</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={() => router.push("/dashboard")} style={styles.statsFallback} accessibilityRole="button">
            <Text style={styles.statsFallbackText}>Open dashboard →</Text>
          </Pressable>
        )}

        <View style={styles.heroSearch}>
          <Ionicons name="search" size={19} color="rgba(255,255,255,0.5)" style={styles.heroSearchIcon} />
          <TextInput
            style={styles.heroSearchInput}
            placeholder={feedTab === "employer" ? "Role, skill, employer, location…" : "Search curated roles…"}
            placeholderTextColor="rgba(255,255,255,0.38)"
            value={q}
            onChangeText={setQ}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            accessibilityLabel="Search jobs"
          />
          {q.length > 0 ? (
            <Pressable onPress={() => setQ("")} hitSlop={12} accessibilityRole="button" accessibilityLabel="Clear search">
              <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.45)" />
            </Pressable>
          ) : (
            <Pressable
              onPress={() => setTopicsModalOpen(true)}
              hitSlop={8}
              style={styles.heroFilterBtn}
              accessibilityRole="button"
              accessibilityLabel="Open filters"
            >
              <Ionicons name="options-outline" size={18} color="rgba(255,255,255,0.8)" />
              <Text style={styles.heroFilterLabel}>Filter</Text>
            </Pressable>
          )}
        </View>
      </LinearGradient>

      {/* ── Feed controls ── */}
      <View style={styles.feedControls}>
        <View style={styles.segmentHost}>
          <Pressable
            style={[styles.segmentCell, feedTab === "employer" && styles.segmentCellOn]}
            onPress={() => { void hapticLight(); setFeedTab("employer"); }}
            accessibilityRole="button"
            accessibilityState={{ selected: feedTab === "employer" }}
          >
            <Text style={[styles.segmentText, feedTab === "employer" && styles.segmentTextOn]}>
              Employer posts
            </Text>
          </Pressable>
          <Pressable
            style={[styles.segmentCell, feedTab === "curated" && styles.segmentCellOnCurated]}
            onPress={() => { void hapticLight(); setFeedTab("curated"); }}
            accessibilityRole="button"
            accessibilityState={{ selected: feedTab === "curated" }}
          >
            <Text style={[styles.segmentText, feedTab === "curated" && styles.segmentTextOnCurated]}>
              Curated picks
            </Text>
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickNavScroll}>
          {([
            { icon: "stats-chart-outline", label: "Dashboard", onPress: () => router.push("/dashboard") },
            { icon: "notifications-outline", label: "Alerts", onPress: () => router.push("/alerts") },
            { icon: "construct-outline", label: "Tools", onPress: () => router.push("/tools-resources") },
            { icon: "document-text-outline", label: "ATS check", onPress: () => router.push("/ats-assistant") },
          ] as const).map((it) => (
            <Pressable key={it.label} style={styles.quickNavPill} onPress={it.onPress} accessibilityRole="button">
              <Ionicons name={it.icon} size={15} color={colors.navy} />
              <Text style={styles.quickNavPillText}>{it.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* ── Recent searches ── */}
      {recent.length > 0 ? (
        <View style={styles.recentOuter}>
          <Text style={styles.recentLabel}>Recent</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentScroll}>
            {recent.map((term) => (
              <Pressable key={term} style={styles.recentChip} onPress={() => setQ(term)} accessibilityRole="button">
                <Ionicons name="time-outline" size={12} color={colors.textMuted} />
                <Text style={styles.recentChipText} numberOfLines={1}>{term}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}

      {/* ── Section heading ── */}
      <View style={styles.listHeadingRow}>
        <Text style={styles.listHeading}>
          {feedTab === "employer" ? "Roles for you" : "Curated picks"}
        </Text>
        <View style={styles.listHeadingRight}>
          {feedTab === "curated" ? (
            <Pressable onPress={() => router.push("/curated-listings")} accessibilityRole="link">
              <Text style={styles.listHeadingLink}>See all</Text>
            </Pressable>
          ) : null}
          <Pressable
            onPress={() => setListingInfoOpen(true)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="How this feed works"
          >
            <Ionicons name="information-circle-outline" size={20} color={colors.textMuted} />
          </Pressable>
        </View>
      </View>
    </>
  );

  const emptyBody = listBootloading ? (
    <View style={styles.skeletonList}>
      <JobCardSkeleton />
      <JobCardSkeleton />
      <JobCardSkeleton />
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
        {debouncedQ
          ? "Nothing matching that search — try a broader term or clear it."
          : "No listings right now — pull down to refresh."}
      </Text>
      {debouncedQ ? (
        <Pressable style={styles.retryBtn} onPress={() => setQ("")} accessibilityRole="button">
          <Text style={styles.retryBtnText}>Clear search</Text>
        </Pressable>
      ) : feedTab === "employer" ? (
        <Pressable style={styles.secondaryCta} onPress={() => { void hapticLight(); setFeedTab("curated"); }} accessibilityRole="button">
          <Text style={styles.secondaryCtaText}>Try curated picks →</Text>
        </Pressable>
      ) : null}
    </View>
  ) : null;

  return (
    <View style={styles.shell}>
      <FlatList
        data={activeError ? [] : listRows}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={emptyBody}
        refreshControl={
          <RefreshControl refreshing={pullRefreshing} onRefresh={onRefresh} tintColor={colors.white} />
        }
        contentContainerStyle={[
          styles.listPad,
          listRows.length === 0 && !listBootloading && styles.listPadGrow,
        ]}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) =>
          feedTab === "employer" ? (
            <HubJobCard
              job={item as Job}
              onPress={() => router.push(`/job/${(item as Job)._id}`)}
              savedRowId={savedJobIdByListingId.get((item as Job)._id)}
              bookmarkLoading={
                (saveJobMut.isPending && saveJobMut.variables === (item as Job)._id) ||
                (unsaveJobMut.isPending &&
                  unsaveJobMut.variables === savedJobIdByListingId.get((item as Job)._id))
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
        location={locationFilter}
        onPickExplore={setQ}
        onPickCountry={setLocationFilter}
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
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: colors.navyDeep },

  // Hero
  hero: { paddingHorizontal: 20, paddingBottom: 24 },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
    paddingTop: 4,
  },
  heroLogo: { width: 200, height: 44, maxWidth: "72%" },
  heroActions: { flexDirection: "row", gap: 4 },
  heroIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroGreetingLabel: {
    fontSize: 13,
    fontFamily: fontFamily.medium,
    color: "rgba(255,255,255,0.55)",
    marginBottom: 4,
  },
  heroGreeting: {
    fontSize: 26,
    fontFamily: fontFamily.extraBold,
    color: colors.white,
    letterSpacing: -0.5,
    marginBottom: 18,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.09)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    marginBottom: 18,
    overflow: "hidden",
  },
  statCell: { flex: 1, alignItems: "center", paddingVertical: 12 },
  statDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    marginVertical: 12,
  },
  statNum: {
    fontSize: 22,
    fontFamily: fontFamily.extraBold,
    color: colors.white,
    letterSpacing: -0.4,
  },
  statLab: {
    marginTop: 2,
    fontSize: 11,
    fontFamily: fontFamily.medium,
    color: "rgba(255,255,255,0.5)",
  },
  statsLoading: {
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  statsFallback: { marginBottom: 18, paddingVertical: 10 },
  statsFallbackText: {
    fontSize: 14,
    fontFamily: fontFamily.semiBold,
    color: "rgba(255,255,255,0.6)",
  },
  heroSearch: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  heroSearchIcon: { marginRight: 8 },
  heroSearchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: fontFamily.regular,
    color: colors.white,
  },
  heroFilterBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  heroFilterLabel: {
    fontSize: 13,
    fontFamily: fontFamily.semiBold,
    color: "rgba(255,255,255,0.8)",
  },

  // Feed controls — white band below navy hero
  feedControls: {
    backgroundColor: colors.white,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  segmentHost: {
    flexDirection: "row",
    marginHorizontal: 16,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.pill,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  segmentCell: {
    flex: 1,
    paddingVertical: 9,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
  },
  segmentCellOn: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.teal,
    shadowColor: colors.teal,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentCellOnCurated: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.purpleBorder,
    shadowColor: colors.purple,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: { fontSize: 13, fontFamily: fontFamily.semiBold, color: colors.textMuted },
  segmentTextOn: { color: colors.navy },
  segmentTextOnCurated: { color: colors.brand },

  quickNavScroll: { paddingHorizontal: 16, gap: 8 },
  quickNavPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickNavPillText: { fontSize: 12, fontFamily: fontFamily.semiBold, color: colors.textSecondary },

  // Recent
  recentOuter: { paddingTop: 12, paddingHorizontal: 16 },
  recentLabel: {
    fontSize: 11,
    fontFamily: fontFamily.semiBold,
    color: "rgba(255,255,255,0.35)",
    letterSpacing: 0.4,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  recentScroll: { gap: 8, paddingBottom: 4 },
  recentChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: colors.borderOnDark,
  },
  recentChipText: {
    fontSize: 13,
    fontFamily: fontFamily.medium,
    color: "rgba(255,255,255,0.7)",
    maxWidth: 160,
  },

  // Heading
  listHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 10,
  },
  listHeading: {
    fontSize: 19,
    fontFamily: fontFamily.extraBold,
    color: colors.white,
    letterSpacing: -0.4,
  },
  listHeadingRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  listHeadingLink: { fontSize: 14, fontFamily: fontFamily.semiBold, color: colors.teal },

  // Cards — white cards on dark canvas = high contrast, premium feel
  listPad: { paddingBottom: 32, gap: 12, paddingHorizontal: 16 },
  listPadGrow: { flexGrow: 1 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 0,
  },
  cardMainHit: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    minWidth: 0,
  },
  cardAvatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  cardAvatarText: { fontSize: 18, fontFamily: fontFamily.bold },
  cardMid: { flex: 1, minWidth: 0 },
  cardBookmarkHit: { paddingTop: 2, paddingLeft: 4 },
  cardTitle: {
    fontSize: 15,
    fontFamily: fontFamily.bold,
    color: colors.navy,
    letterSpacing: -0.2,
    marginBottom: 3,
  },
  cardCompanyLine: { fontSize: 13, fontFamily: fontFamily.medium, color: colors.textSecondary },
  cardMetaLine: { marginTop: 2, fontSize: 12, fontFamily: fontFamily.regular, color: colors.textMuted },
  chipWrap: { marginTop: 8, flexDirection: "row", flexWrap: "wrap", gap: 5 },
  listChip: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: radii.pill },
  listChipText: { fontSize: 10, fontFamily: fontFamily.medium },
  cardFooter: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  cardFooterEnd: { flexDirection: "row", alignItems: "center", gap: 4 },
  cardSalary: { fontSize: 14, fontFamily: fontFamily.bold, color: colors.brand },
  cardSalarySpacer: { flex: 1 },
  cardCta: { fontSize: 13, fontFamily: fontFamily.semiBold, color: colors.brand },

  // Empty/error
  skeletonList: { paddingHorizontal: 16, paddingTop: 12, gap: 0 },
  emptyWrap: { alignItems: "center", paddingHorizontal: 24, paddingVertical: 40, gap: 12 },
  loadingHint: { fontFamily: fontFamily.medium, fontSize: 15, color: colors.textMuted },
  errTitle: { fontFamily: fontFamily.semiBold, fontSize: 17, color: colors.navy },
  errSub: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
  retryBtn: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: radii.md,
    backgroundColor: colors.brand,
  },
  retryBtnText: { fontFamily: fontFamily.semiBold, fontSize: 15, color: colors.white },
  secondaryCta: { marginTop: 4, paddingVertical: 10 },
  secondaryCtaText: { fontFamily: fontFamily.semiBold, fontSize: 15, color: colors.brand },
  empty: {
    textAlign: "center",
    color: colors.textMuted,
    fontSize: 15,
    fontFamily: fontFamily.regular,
    lineHeight: 22,
  },
});
