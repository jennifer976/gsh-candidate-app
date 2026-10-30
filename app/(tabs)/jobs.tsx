import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { useAppCopy } from "@/lib/i18n";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
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
import { Icon } from "@/components/Icon";
import { JobCardSkeleton } from "@/components/SkeletonLoader";
import { GshScreenShell } from "@/components/GshScreenShell";
import { DepthButton, TitleWithStop } from "@/components/gsh-brand";
import { JobCard } from "@/components/v3/JobCard";
import {
  JobsFilterSheet,
  type JobsFilterDraft,
} from "@/components/v3/JobsFilterSheet";
import { tabBarBottomPadding } from "@/lib/android-insets";
import {
  fetchPublicExternalJobListings,
  fetchPublicJobs,
  fetchSavedJobs,
  saveJob,
  unsaveJob,
} from "@/lib/api-client";
import { hapticConfirm } from "@/lib/haptics";
import {
  jobCardFieldsFromExternal,
  jobCardFieldsFromJob,
} from "@/lib/jobCardFields";
import { useSignInPrompt } from "@/lib/useSignInPrompt";
import { colors, fontFamily, shadows } from "@/lib/theme";
import type { ExternalJobListingPublic, Job } from "@/types/models";

type FeedTab = "direct" | "connected" | "curated";
type SortMode = "newest" | "salary";

type ListRow =
  | { kind: "search" }
  | { kind: "meta" }
  | { kind: "job"; job: Job | ExternalJobListingPublic; lane: FeedTab };

function salarySortValue(job: Job | ExternalJobListingPublic): number {
  const j = job as Job;
  const max = typeof j.maxSalary === "number" ? j.maxSalary : null;
  const min = typeof j.minSalary === "number" ? j.minSalary : null;
  if (max != null && min != null) return Math.max(max, min);
  if (max != null) return max;
  if (min != null) return min;
  return -1;
}

function postedSortValue(job: Job | ExternalJobListingPublic): number {
  const j = job as Job & ExternalJobListingPublic;
  const raw =
    j.externalPostedAt ??
    j.createdAt ??
    (j as { updatedAt?: string }).updatedAt ??
    "";
  const t = new Date(raw).getTime();
  return Number.isFinite(t) ? t : 0;
}

function sortJobs<T extends Job | ExternalJobListingPublic>(
  rows: T[],
  sort: SortMode,
): T[] {
  const copy = [...rows];
  if (sort === "salary") {
    copy.sort((a, b) => salarySortValue(b) - salarySortValue(a));
  } else {
    copy.sort((a, b) => postedSortValue(b) - postedSortValue(a));
  }
  return copy;
}

function countActiveFilters(draft: JobsFilterDraft): number {
  return (
    (draft.location.trim() ? 1 : 0) +
    (draft.mobility ? 1 : 0) +
    (draft.workMode ? 1 : 0)
  );
}

export default function JobsTabScreen() {
  const { t, locale, intlLocale } = useAppCopy();
  const ac = useAccountCopy();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signedIn, openSignIn } = useSignInPrompt();
  const params = useLocalSearchParams<{
    q?: string;
    location?: string;
    benefit?: string;
    workMode?: string;
  }>();
  const qc = useQueryClient();

  const [feedTab, setFeedTab] = useState<FeedTab>("direct");
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [pullRefreshing, setPullRefreshing] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [workModeFilter, setWorkModeFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [mobilityFilter, setMobilityFilter] = useState("");
  const [visaRouteFilter, setVisaRouteFilter] = useState("");
  const [draft, setDraft] = useState<JobsFilterDraft>({
    location: "",
    mobility: "",
    workMode: "",
  });

  useEffect(() => {
    if (typeof params.q === "string") setQ(params.q.trim());
    if (typeof params.location === "string")
      setLocationFilter(params.location.trim());
    if (typeof params.benefit === "string")
      setMobilityFilter(params.benefit.trim());
    if (typeof params.workMode === "string") {
      setWorkModeFilter(
        ["remote", "hybrid", "onsite"].includes(params.workMode)
          ? params.workMode
          : "",
      );
    }
  }, [params.q, params.location, params.benefit, params.workMode]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQ(q.trim()), 400);
    return () => clearTimeout(timer);
  }, [q]);

  const hubJobsQuery = useInfiniteQuery({
    queryKey: [
      "public-jobs",
      debouncedQ,
      locationFilter,
      mobilityFilter,
      workModeFilter,
      visaRouteFilter,
    ],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      fetchPublicJobs({
        q: debouncedQ || undefined,
        location: locationFilter.trim() || undefined,
        benefit: mobilityFilter.trim() || undefined,
        workMode: workModeFilter || undefined,
        visaRoute: visaRouteFilter.trim() || undefined,
        page: pageParam,
        perPage: 25,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.perPage < lastPage.total
        ? lastPage.page + 1
        : undefined,
    staleTime: 60_000,
  });

  const curatedJobsQuery = useInfiniteQuery({
    queryKey: [
      "external-job-listings",
      "home-tab",
      debouncedQ,
      locationFilter,
      mobilityFilter,
      workModeFilter,
    ],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      fetchPublicExternalJobListings({
        q: debouncedQ || undefined,
        location: locationFilter.trim() || undefined,
        benefit: mobilityFilter || undefined,
        workMode: workModeFilter || undefined,
        sourceRelationship: "curated_external",
        page: pageParam,
        perPage: 25,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.perPage < lastPage.total
        ? lastPage.page + 1
        : undefined,
    staleTime: 60_000,
  });

  const connectedJobsQuery = useInfiniteQuery({
    queryKey: [
      "external-job-listings",
      "connected",
      debouncedQ,
      locationFilter,
      mobilityFilter,
      workModeFilter,
    ],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      fetchPublicExternalJobListings({
        q: debouncedQ || undefined,
        location: locationFilter.trim() || undefined,
        benefit: mobilityFilter || undefined,
        workMode: workModeFilter || undefined,
        sourceRelationship: "employer_connected",
        page: pageParam,
        perPage: 25,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.perPage < lastPage.total
        ? lastPage.page + 1
        : undefined,
    staleTime: 60_000,
  });

  const draftPreviewQuery = useQuery({
    queryKey: [
      "jobs-filter-preview",
      feedTab,
      debouncedQ,
      draft.location,
      draft.mobility,
      draft.workMode,
      visaRouteFilter,
    ],
    enabled: filterOpen,
    queryFn: async () => {
      if (feedTab === "direct") {
        return fetchPublicJobs({
          q: debouncedQ || undefined,
          location: draft.location.trim() || undefined,
          benefit: draft.mobility.trim() || undefined,
          workMode: draft.workMode || undefined,
          visaRoute: visaRouteFilter.trim() || undefined,
          page: 1,
          perPage: 1,
        });
      }
      return fetchPublicExternalJobListings({
        q: debouncedQ || undefined,
        location: draft.location.trim() || undefined,
        benefit: draft.mobility || undefined,
        workMode: draft.workMode || undefined,
        sourceRelationship:
          feedTab === "connected" ? "employer_connected" : "curated_external",
        page: 1,
        perPage: 1,
      });
    },
    staleTime: 15_000,
  });

  const savedJobsQuery = useQuery({
    queryKey: ["saved-jobs"],
    queryFn: fetchSavedJobs,
    enabled: signedIn,
    staleTime: 60_000,
  });

  const saveJobMut = useMutation({
    mutationFn: (jobId: string) => saveJob(jobId),
    onSuccess: () => {
      void hapticConfirm();
      void qc.invalidateQueries({ queryKey: ["saved-jobs"] });
      void qc.invalidateQueries({
        queryKey: ["analytics", "candidate-dashboard"],
      });
    },
    onError: () => Alert.alert(t("jobsSaveError"), t("jobsActionError")),
  });

  const unsaveJobMut = useMutation({
    mutationFn: (savedRowId: string) => unsaveJob(savedRowId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["saved-jobs"] });
      void qc.invalidateQueries({
        queryKey: ["analytics", "candidate-dashboard"],
      });
    },
    onError: () => Alert.alert(t("jobsUpdateError"), t("jobsActionError")),
  });

  const savedJobIdByListingId = useMemo(() => {
    const m = new Map<string, string>();
    for (const row of savedJobsQuery.data ?? []) {
      const jobRef = row.job ?? row.jobId;
      const jid =
        typeof jobRef === "string" ? jobRef : (jobRef?._id ?? jobRef?.id);
      const savedRowId = row.id ?? row._id;
      if (jid && savedRowId) m.set(jid, savedRowId);
    }
    return m;
  }, [savedJobsQuery.data]);

  const hubJobs = hubJobsQuery.data?.pages.flatMap((page) => page.data) ?? [];
  const curatedJobs =
    curatedJobsQuery.data?.pages.flatMap((page) => page.data) ?? [];
  const connectedJobs =
    connectedJobsQuery.data?.pages.flatMap((page) => page.data) ?? [];

  const laneRows =
    feedTab === "direct"
      ? hubJobs
      : feedTab === "connected"
        ? connectedJobs
        : curatedJobs;
  const laneQuery =
    feedTab === "direct"
      ? hubJobsQuery
      : feedTab === "connected"
        ? connectedJobsQuery
        : curatedJobsQuery;
  const laneLoading = laneQuery.isLoading && !laneQuery.data;
  const showingFallback =
    feedTab !== "curated" &&
    !laneLoading &&
    !laneQuery.isError &&
    laneRows.length === 0 &&
    !curatedJobsQuery.isError &&
    (curatedJobs.length > 0 || curatedJobsQuery.isLoading);
  const shownLane: FeedTab = showingFallback ? "curated" : feedTab;
  const shownQuery = showingFallback ? curatedJobsQuery : laneQuery;
  const unsortedRows = showingFallback ? curatedJobs : laneRows;
  const listRows = useMemo(
    () => sortJobs(unsortedRows, sortMode),
    [unsortedRows, sortMode],
  );

  const listBootloading =
    laneLoading ||
    (showingFallback &&
      curatedJobsQuery.isLoading &&
      !curatedJobsQuery.data);
  const activeError = laneQuery.isError;
  const activeHasNextPage = shownQuery.hasNextPage;
  const activeFetchingNextPage = shownQuery.isFetchingNextPage;
  const loadNextPage = useCallback(() => {
    if (!activeHasNextPage || activeFetchingNextPage) return;
    void shownQuery.fetchNextPage();
  }, [activeFetchingNextPage, activeHasNextPage, shownQuery]);

  const onRefresh = useCallback(() => {
    setPullRefreshing(true);
    void Promise.all([
      hubJobsQuery.refetch(),
      curatedJobsQuery.refetch(),
      connectedJobsQuery.refetch(),
      ...(signedIn ? [savedJobsQuery.refetch()] : []),
    ]).finally(() => setPullRefreshing(false));
  }, [
    hubJobsQuery,
    curatedJobsQuery,
    connectedJobsQuery,
    savedJobsQuery,
    signedIn,
  ]);

  const firstPageTotal = shownQuery.data?.pages[0]?.total;
  const resultCount =
    listBootloading || activeError
      ? null
      : shownLane === "direct" && visaRouteFilter
        ? listRows.length
        : typeof firstPageTotal === "number"
          ? firstPageTotal
          : null;

  const appliedFilters: JobsFilterDraft = {
    location: locationFilter,
    mobility: mobilityFilter,
    workMode: workModeFilter,
  };
  const filterCount = countActiveFilters(appliedFilters);
  const narrowed = Boolean(debouncedQ) || filterCount > 0;

  const previewCount =
    draftPreviewQuery.data && typeof draftPreviewQuery.data.total === "number"
      ? draftPreviewQuery.data.total
      : null;

  const openFilters = useCallback(() => {
    setDraft({
      location: locationFilter,
      mobility: mobilityFilter,
      workMode: workModeFilter,
    });
    setFilterOpen(true);
  }, [locationFilter, mobilityFilter, workModeFilter]);

  const clearFiltersOnly = useCallback(() => {
    setLocationFilter("");
    setMobilityFilter("");
    setWorkModeFilter("");
    setVisaRouteFilter("");
    setDraft({ location: "", mobility: "", workMode: "" });
  }, []);

  const clearAllFilters = useCallback(() => {
    setQ("");
    clearFiltersOnly();
  }, [clearFiltersOnly]);

  const applyDraft = useCallback(() => {
    setLocationFilter(draft.location);
    setMobilityFilter(draft.mobility);
    setWorkModeFilter(draft.workMode);
    setFilterOpen(false);
  }, [draft]);

  const workModeChipLabel =
    workModeFilter === "remote"
      ? "Remote"
      : workModeFilter === "hybrid"
        ? "Hybrid"
        : workModeFilter === "onsite"
          ? "On-site"
          : "Work mode";

  const countryChipLabel = locationFilter.trim() || "Country";

  const locationSuffix = locationFilter.trim()
    ? ` in ${locationFilter.trim()}`
    : " everywhere";

  const toggleSort = () =>
    setSortMode((s) => (s === "newest" ? "salary" : "newest"));

  const listData: ListRow[] = useMemo(() => {
    const head: ListRow[] = [{ kind: "search" }, { kind: "meta" }];
    if (activeError || listBootloading) return head;
    return [
      ...head,
      ...listRows.map((job) => ({
        kind: "job" as const,
        job,
        lane: shownLane,
      })),
    ];
  }, [activeError, listBootloading, listRows, shownLane]);

  const header = (
    <View style={[styles.header, { paddingTop: insets.top + 26 }]}>
      <View style={styles.headerTop}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <TitleWithStop eyebrow="International jobs" text="Jobs" />
        </View>
        <Pressable
          onPress={() => router.push("/alerts")}
          style={styles.alertsButton}
          accessibilityRole="button"
          accessibilityLabel="Job alerts"
        >
          <Icon name="bell-ring" size={22} color={colors.navy} strokeWidth={1.8} />
        </Pressable>
      </View>

      <View style={styles.segmentTrack}>
        {(
          [
            { id: "direct" as const, label: t("jobsDirectTab") },
            { id: "connected" as const, label: t("jobsConnectedTab") },
            { id: "curated" as const, label: t("jobsExternalTab") },
          ] as const
        ).map((opt) => {
          const on = feedTab === opt.id;
          return (
            <Pressable
              key={opt.id}
              onPress={() => setFeedTab(opt.id)}
              style={[styles.segment, on && styles.segmentOn]}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
            >
              <Text style={[styles.segmentText, on && styles.segmentTextOn]}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  const renderSearch = () => (
    <View style={styles.stickyBlock}>
      <View style={styles.searchRow}>
        <View style={styles.searchPill}>
          <Icon name="search" size={20} color={colors.text2} strokeWidth={1.8} />
          <TextInput
            style={styles.searchInput}
            placeholder="Job title, skill or company"
            placeholderTextColor={colors.muted}
            value={q}
            onChangeText={setQ}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            accessibilityLabel="Search jobs"
          />
          {q.length > 0 ? (
            <Pressable
              onPress={() => setQ("")}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              style={styles.clearSearchHit}
            >
              <Icon name="x" size={18} color={colors.muted} strokeWidth={1.8} />
            </Pressable>
          ) : null}
        </View>
        <Pressable
          onPress={openFilters}
          style={styles.filterBtn}
          accessibilityRole="button"
          accessibilityLabel="Filters"
        >
          <Icon name="sliders-horizontal" size={22} color={colors.white} strokeWidth={1.8} />
          {filterCount > 0 ? (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{filterCount}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>
    </View>
  );

  const renderMeta = () => (
    <View style={styles.metaBlock}>
      <View style={styles.chipFadeHost}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {(
            [
              {
                id: "visa",
                label: "Visa sponsorship",
                active: mobilityFilter === "Visa Sponsorship",
                onPress: () =>
                  setMobilityFilter((v) =>
                    v === "Visa Sponsorship" ? "" : "Visa Sponsorship",
                  ),
              },
              {
                id: "relocation",
                label: "Relocation support",
                active: mobilityFilter === "Relocation Support",
                onPress: () =>
                  setMobilityFilter((v) =>
                    v === "Relocation Support" ? "" : "Relocation Support",
                  ),
              },
              {
                id: "remote",
                label: "Global remote",
                active: workModeFilter === "remote",
                onPress: () =>
                  setWorkModeFilter((v) => (v === "remote" ? "" : "remote")),
              },
            ] as const
          ).map((chip) => (
            <Pressable
              key={chip.id}
              onPress={chip.onPress}
              style={[styles.quickChip, chip.active && styles.quickChipOn]}
              accessibilityRole="button"
              accessibilityState={{ selected: chip.active }}
            >
              <Text
                style={[
                  styles.quickChipText,
                  chip.active && styles.quickChipTextOn,
                ]}
              >
                {chip.label}
              </Text>
            </Pressable>
          ))}
          <Pressable
            onPress={openFilters}
            style={[
              styles.quickChip,
              Boolean(locationFilter.trim()) && styles.quickChipOn,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Country"
          >
            <Text
              style={[
                styles.quickChipText,
                Boolean(locationFilter.trim()) && styles.quickChipTextOn,
              ]}
              numberOfLines={1}
            >
              {countryChipLabel}
            </Text>
            <Icon
              name="chevron-down"
              size={16}
              color={locationFilter.trim() ? colors.white : colors.navy}
              strokeWidth={1.8}
            />
          </Pressable>
          <Pressable
            onPress={openFilters}
            style={[
              styles.quickChip,
              Boolean(workModeFilter) && styles.quickChipOn,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Work mode"
          >
            <Text
              style={[
                styles.quickChipText,
                Boolean(workModeFilter) && styles.quickChipTextOn,
              ]}
              numberOfLines={1}
            >
              {workModeChipLabel}
            </Text>
            <Icon
              name="chevron-down"
              size={16}
              color={workModeFilter ? colors.white : colors.navy}
              strokeWidth={1.8}
            />
          </Pressable>
        </ScrollView>
        <LinearGradient
          pointerEvents="none"
          colors={["rgba(243,245,249,0)", "#f3f5f9"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.chipFade}
        />
      </View>

      <View style={styles.resultsRow}>
        <View style={styles.resultsTextWrap}>
          {resultCount != null ? (
            <Text style={styles.resultsLine}>
              <Text style={styles.resultsCount}>
                {resultCount === 1
                  ? "1 role"
                  : `${new Intl.NumberFormat(intlLocale).format(resultCount)} roles`}
              </Text>
              <Text style={styles.resultsWhere}>{locationSuffix}</Text>
            </Text>
          ) : null}
          {showingFallback ? (
            <Text style={styles.fallbackHint}>
              {ac("Now showing external roles")}
            </Text>
          ) : null}
        </View>
        <Pressable
          onPress={toggleSort}
          style={styles.sortHit}
          accessibilityRole="button"
          accessibilityLabel={
            sortMode === "newest" ? "Newest" : "Highest salary"
          }
        >
          <Text style={styles.sortText}>
            {sortMode === "newest" ? "Newest" : "Highest salary"}
          </Text>
          <Icon name="chevron-down" size={16} color={colors.navy} strokeWidth={1.8} />
        </Pressable>
      </View>

      {listBootloading ? (
        <View style={styles.skeletonList}>
          <JobCardSkeleton />
          <JobCardSkeleton />
          <JobCardSkeleton />
        </View>
      ) : null}

      {activeError ? (
        <View style={styles.errorWrap}>
          <Text style={styles.emptyTitle}>{t("jobsError")}</Text>
          <Text style={styles.emptyBody}>{t("newsErrorHelp")}</Text>
          <DepthButton
            title={t("retry")}
            onPress={() => void laneQuery.refetch()}
            variant="navy"
            size="md"
            icon={null}
          />
        </View>
      ) : null}

      {!listBootloading && !activeError && listRows.length === 0 ? (
        <View style={styles.emptyWrap}>
          <View style={styles.emptyTile}>
            <Icon name="search" size={26} color={colors.text2} strokeWidth={1.8} />
          </View>
          <Text style={styles.emptyTitle}>No roles match yet</Text>
          <Text style={styles.emptyBody}>
            Try fewer filters or a different search.
          </Text>
          {narrowed ? (
            <Pressable
              onPress={clearAllFilters}
              style={styles.ghostHit}
              accessibilityRole="button"
              accessibilityLabel="Clear all filters"
            >
              <Text style={styles.ghostText}>Clear all filters</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );

  return (
    <GshScreenShell constrainTabletWidth style={styles.shell}>
      <FlatList
        data={listData}
        keyExtractor={(item, index) => {
          if (item.kind === "search") return "search";
          if (item.kind === "meta") return "meta";
          return item.job._id || `job-${index}`;
        }}
        stickyHeaderIndices={[0]}
        ListHeaderComponent={header}
        style={styles.listFlex}
        refreshControl={
          <RefreshControl
            refreshing={pullRefreshing}
            onRefresh={onRefresh}
            colors={["#0d194e"]}
            progressBackgroundColor="#ffffff"
            tintColor="#0d194e"
          />
        }
        contentContainerStyle={{
          paddingBottom: tabBarBottomPadding(insets.bottom),
        }}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item, index }) => {
          if (item.kind === "search") return renderSearch();
          if (item.kind === "meta") return renderMeta();

          const fields =
            item.lane === "direct"
              ? jobCardFieldsFromJob(item.job as Job, locale)
              : jobCardFieldsFromExternal(
                  item.job as ExternalJobListingPublic,
                  locale,
                );
          const jobId = item.job._id;
          const savedRowId = savedJobIdByListingId.get(jobId);
          const cardIndex = Math.max(0, index - 2);

          return (
            <View style={styles.listRow}>
              <JobCard
                index={cardIndex}
                title={fields.title}
                company={fields.company}
                logoUrl={fields.logoUrl}
                countryIso2={fields.countryIso2}
                countryLabel={fields.countryLabel}
                remote={fields.remote}
                salaryLabel={fields.salaryLabel}
                visaSponsorship={fields.visaSponsorship}
                relocationSupport={fields.relocationSupport}
                remoteTag={fields.remoteTag}
                jobType={fields.jobType}
                postedLabel={fields.postedLabel}
                saved={Boolean(savedRowId)}
                onPress={() => router.push(fields.href as never)}
                onToggleSave={
                  item.lane === "direct"
                    ? () => {
                        if (!signedIn) {
                          openSignIn("/(tabs)/jobs", {
                            kind: "save_job",
                            targetId: jobId,
                          });
                          return;
                        }
                        if (savedRowId) unsaveJobMut.mutate(savedRowId);
                        else saveJobMut.mutate(jobId);
                      }
                    : undefined
                }
              />
            </View>
          );
        }}
        onEndReached={loadNextPage}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          activeFetchingNextPage ? (
            <View style={styles.paginationLoader}>
              <ActivityIndicator color={colors.navy} />
            </View>
          ) : null
        }
      />

      <JobsFilterSheet
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        draft={draft}
        onChangeDraft={setDraft}
        onClearAll={clearFiltersOnly}
        onShow={applyDraft}
        resultCount={previewCount}
      />
    </GshScreenShell>
  );
}

const styles = StyleSheet.create({
  shell: { backgroundColor: colors.panel },
  listFlex: { flex: 1 },
  header: {
    backgroundColor: colors.panel,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  alertsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.card,
  },
  segmentTrack: {
    marginTop: 16,
    backgroundColor: "#e9ecf3",
    borderRadius: 14,
    padding: 4,
    flexDirection: "row",
    gap: 4,
  },
  segment: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentOn: {
    backgroundColor: colors.white,
    shadowColor: "#0d194e",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  segmentText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    color: colors.text2,
    textAlign: "center",
  },
  segmentTextOn: { color: colors.navy },
  stickyBlock: {
    backgroundColor: colors.panel,
    paddingTop: 12,
    paddingBottom: 2,
    paddingHorizontal: 16,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchPill: {
    flex: 1,
    minWidth: 0,
    height: 56,
    borderRadius: 999,
    backgroundColor: colors.white,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    ...shadows.card,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    fontFamily: fontFamily.medium,
    fontSize: 16,
    color: colors.navy,
    paddingVertical: 0,
  },
  clearSearchHit: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 4,
    backgroundColor: colors.cyan,
    borderWidth: 2,
    borderColor: colors.panel,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadgeText: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: colors.navy,
  },
  metaBlock: {
    backgroundColor: colors.panel,
    paddingBottom: 8,
  },
  chipFadeHost: { position: "relative" },
  chipRow: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  chipFade: {
    position: "absolute",
    top: 12,
    right: 0,
    bottom: 8,
    width: 32,
  },
  quickChip: {
    height: 44,
    borderRadius: 999,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    ...shadows.card,
  },
  quickChipOn: { backgroundColor: colors.navy },
  quickChipText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    color: colors.navy,
  },
  quickChipTextOn: { color: colors.white },
  resultsRow: {
    marginTop: 4,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  resultsTextWrap: { flex: 1, minWidth: 0 },
  resultsLine: {
    fontFamily: fontFamily.medium,
    fontSize: 15,
    color: colors.text2,
  },
  resultsCount: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    color: colors.navy,
  },
  resultsWhere: {
    fontFamily: fontFamily.medium,
    fontSize: 15,
    color: colors.text2,
  },
  fallbackHint: {
    marginTop: 2,
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: colors.muted,
  },
  sortHit: {
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 4,
  },
  sortText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    color: colors.navy,
  },
  listRow: { paddingHorizontal: 16 },
  skeletonList: { paddingHorizontal: 16, paddingTop: 12 },
  paginationLoader: { paddingVertical: 22, alignItems: "center" },
  emptyWrap: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 16,
    gap: 10,
  },
  emptyTile: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.card,
  },
  emptyTitle: {
    fontFamily: fontFamily.heading,
    fontSize: 18,
    color: colors.navy,
    textAlign: "center",
  },
  emptyBody: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text2,
    textAlign: "center",
  },
  ghostHit: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  ghostText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    color: colors.navy,
    textDecorationLine: "underline",
  },
  errorWrap: {
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 12,
    alignItems: "center",
  },
});
