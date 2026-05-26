import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
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
import { GshDarkFeedHeading } from "@/components/GshDarkFeedHeading";
import { GshScreenShell } from "@/components/GshScreenShell";
import { GshTabHeroHeader } from "@/components/GshTabHeroHeader";
import {
  fetchPublicExternalJobListings,
  fetchPublicJobs,
  fetchSavedJobs,
  saveJob,
  unsaveJob,
} from "@/lib/api-client";
import { hapticLight } from "@/lib/haptics";
import {
  getEmployerSponsorBadge,
  getJobEmployerLabel,
  getJobLogoUrl,
  hubListingChipsPrioritized,
} from "@/lib/job-display";
import { mobilityChipStyle } from "@/lib/mobility-chip-styles";
import { addRecentJobSearch, loadRecentJobSearches } from "@/lib/recent-job-searches";
import { colors, feedCardStyle, fontFamily, radii } from "@/lib/theme";
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
  const chips = hubListingChipsPrioritized(job, CHIP_CAP);
  const sponsorBadge = getEmployerSponsorBadge(job);
  const metaLine = [job.locationCity, job.locationCountry].filter(Boolean).join(", ") || job.location || "";
  const meta = [metaLine, job.jobType].filter((x) => typeof x === "string" && x.length > 0).join(" · ") || "";
  const sal = formatSalary(job);

  return (
    <View style={[styles.card, feedCardStyle()]}>
      <View style={styles.cardAccentStrip} />
      <Pressable onPress={onPress} style={styles.cardMainHit} accessibilityRole="button">
        <CompanyLogo logoUrl={logoUrl} companyName={employer} size={40} radius={11} />
        <View style={styles.cardMid}>
          <Text style={styles.cardTitle} numberOfLines={2}>{job.title}</Text>
          <View style={styles.cardCompanyRow}>
            <Text style={styles.cardCompanyLine} numberOfLines={1}>{employer}</Text>
            {sponsorBadge ? (
              <View style={[styles.sponsorPill, sponsorBadge.positive && styles.sponsorPillActive]}>
                <Ionicons name="shield-checkmark" size={10} color={colors.brandDeep} />
                <Text style={styles.sponsorPillText} numberOfLines={1}>
                  {sponsorBadge.label}
                </Text>
              </View>
            ) : null}
          </View>
          {meta ? (
            <View style={styles.cardMetaRow}>
              <Ionicons name="location-outline" size={13} color={colors.textMuted} />
              <Text style={styles.cardMetaLine} numberOfLines={2}>{meta}</Text>
            </View>
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
          {sal ? <Text style={styles.cardSalary} numberOfLines={1}>{sal}</Text> : <View style={styles.cardSalarySpacer} />}
          <View style={styles.cardFooterEnd}>
            <Text style={styles.cardCta}>View role</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.brand} />
          </View>
        </View>
      </Pressable>
    </View>
  );
}

export default function JobsTabScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [feedTab, setFeedTab] = useState<"employer" | "curated">("employer");
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const [pullRefreshing, setPullRefreshing] = useState(false);
  const [topicsModalOpen, setTopicsModalOpen] = useState(false);
  const [listingInfoOpen, setListingInfoOpen] = useState(false);
  const params = useLocalSearchParams<{ location?: string }>();
  const [locationFilter, setLocationFilter] = useState("");

  useEffect(() => {
    const loc = typeof params.location === "string" ? decodeURIComponent(params.location).trim() : "";
    if (loc) setLocationFilter(loc);
  }, [params.location]);

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

  const savedJobIdByListingId = useMemo(() => {
    const m = new Map<string, string>();
    for (const row of savedJobsQuery.data ?? []) {
      const jid = row.jobId?._id;
      if (jid) m.set(jid, row._id);
    }
    return m;
  }, [savedJobsQuery.data]);

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
      savedJobsQuery.refetch(),
    ]).finally(() => setPullRefreshing(false));
  }, [hubJobsQuery, curatedJobsQuery, savedJobsQuery]);

  const listHeader = (
    <>
      <GshTabHeroHeader paddingTop={Math.max(insets.top, 20) + 8} tagline="Sponsored roles with visa and relocation support">
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
      </GshTabHeroHeader>

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

      <View style={styles.listHeadingWrap}>
        <GshDarkFeedHeading
          title={feedTab === "employer" ? "Roles for you" : "Curated picks"}
          subtitle={
            feedTab === "employer"
              ? "Employer-verified sponsor listings on Global Sponsor Hub"
              : "External roles we curate — apply on the source site"
          }
          actionLabel={feedTab === "curated" ? "See all" : undefined}
          onAction={feedTab === "curated" ? () => router.push("/curated-listings") : undefined}
        />
        <Pressable
          onPress={() => setListingInfoOpen(true)}
          hitSlop={10}
          style={styles.listInfoBtn}
          accessibilityRole="button"
          accessibilityLabel="How this feed works"
        >
          <Ionicons name="information-circle-outline" size={20} color={colors.teal} />
        </Pressable>
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
    <GshScreenShell constrainTabletWidth>
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
        renderItem={({ item }) => (
          <View style={styles.listRow}>
            {feedTab === "employer" ? (
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
            )}
          </View>
        )}
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
    </GshScreenShell>
  );
}

const styles = StyleSheet.create({
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

  feedControls: {
    paddingTop: 12,
    paddingBottom: 4,
    paddingHorizontal: 16,
  },
  segmentHost: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: radii.pill,
    padding: 3,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
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
  segmentText: { fontSize: 13, fontFamily: fontFamily.semiBold, color: "rgba(255,255,255,0.55)" },
  segmentTextOn: { color: colors.navy },
  segmentTextOnCurated: { color: colors.secondary },

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

  listHeadingWrap: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    gap: 4,
  },
  listInfoBtn: { marginTop: 20, padding: 4 },

  /** No horizontal pad here — hero is full-bleed like Home; rows use listRow. */
  listPad: { paddingBottom: 32, gap: 10 },
  listRow: { paddingHorizontal: 16 },
  listPadGrow: { flexGrow: 1 },
  card: {
    paddingVertical: 14,
    paddingRight: 14,
    paddingLeft: 16,
    position: "relative",
    overflow: "hidden",
    minHeight: 128,
  },
  cardAccentStrip: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: 4,
    backgroundColor: colors.teal,
  },
  cardMainHit: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
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
    marginBottom: 2,
    lineHeight: 20,
  },
  cardCompanyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  cardCompanyLine: { fontSize: 13, fontFamily: fontFamily.medium, color: colors.textSecondary, flexShrink: 1 },
  sponsorPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.pill,
    backgroundColor: colors.brandSoft,
    maxWidth: "55%",
  },
  sponsorPillActive: { backgroundColor: "rgba(16,185,129,0.12)" },
  sponsorPillText: {
    fontSize: 10,
    fontFamily: fontFamily.semiBold,
    color: colors.brandDeep,
    letterSpacing: 0.3,
    flexShrink: 1,
  },
  cardMetaRow: { marginTop: 4, flexDirection: "row", alignItems: "flex-start", gap: 4, paddingRight: 4 },
  cardMetaLine: { flex: 1, fontSize: 12, fontFamily: fontFamily.regular, color: colors.textMuted, lineHeight: 17 },
  chipWrap: { marginTop: 6, flexDirection: "row", flexWrap: "wrap", gap: 4 },
  listChip: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: radii.pill },
  listChipText: { fontSize: 10, fontFamily: fontFamily.medium },
  cardFooter: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  cardFooterEnd: { flexDirection: "row", alignItems: "center", gap: 4 },
  cardSalary: { fontSize: 13, fontFamily: fontFamily.bold, color: colors.brand },
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
