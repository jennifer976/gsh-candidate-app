import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { useAppCopy } from "@/lib/i18n";
import {
  jobChipLabel,
  jobCountryLabel,
  jobMatchLabel,
  jobSalaryLabel,
} from "@/lib/job-presentation";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
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
import { tabBarBottomPadding } from "@/lib/android-insets";
import {
  DiscoverListingInfoModal,
  DiscoverTopicsFilterModal,
} from "@/components/CandidateDiscoverRails";
import { CompanyLogo } from "@/components/CompanyLogo";
import { CuratedExternalJobCard } from "@/components/CuratedExternalJobCard";
import { JobCardSkeleton } from "@/components/SkeletonLoader";
import { GshDarkFeedHeading } from "@/components/GshDarkFeedHeading";
import { GshScreenShell } from "@/components/GshScreenShell";
import { GshSwipeAction } from "@/components/GshSwipeAction";
import {
  BrandChip,
  BrandStatePanel,
  DecorRing,
  DepthPressable,
  DepthSurface,
  Eyebrow,
  PosterTitle,
  posterParts,
} from "@/components/gsh-brand";
import {
  fetchPublicExternalJobListings,
  fetchPublicJobs,
  fetchMyJobsCompatibilityBatch,
  fetchSavedJobs,
  saveJob,
  unsaveJob,
} from "@/lib/api-client";
import { compatibilityFirst, directJobIds } from "@/lib/compatibility";
import { hapticLight } from "@/lib/haptics";
import { useSignInPrompt } from "@/lib/useSignInPrompt";
import {
  getEmployerSponsorBadge,
  getJobEmployerLabel,
  getJobLogoUrl,
  hubListingChipsPrioritized,
} from "@/lib/job-display";
import { mobilityChipStyle } from "@/lib/mobility-chip-styles";
import {
  addRecentJobSearch,
  loadRecentJobSearches,
} from "@/lib/recent-job-searches";
import { colors, fontFamily, radii } from "@/lib/theme";
import type { ExternalJobListingPublic, Job } from "@/types/models";
import type { CompatibilityResult } from "@/types/mobility";

const COMPATIBILITY_ORDER_KEY = "@gsh_compatibility_first_v1";

const CHIP_CAP = 3;

function HubJobCard({
  job,
  onPress,
  savedRowId,
  bookmarkLoading,
  onToggleBookmark,
  compatibility,
}: {
  job: Job;
  onPress: () => void;
  savedRowId: string | undefined;
  bookmarkLoading: boolean;
  onToggleBookmark: () => void;
  compatibility?: CompatibilityResult;
}) {
  const { t, locale } = useAppCopy();

  const employer = getJobEmployerLabel(job, locale);
  const logoUrl = getJobLogoUrl(job);
  const chips = hubListingChipsPrioritized(job, CHIP_CAP);
  const sponsorBadge = getEmployerSponsorBadge(job, locale);
  const metaLine =
    [job.locationCity, jobCountryLabel(job.locationCountry || "", locale)]
      .filter(Boolean)
      .join(", ") ||
    job.location ||
    "";
  const meta =
    [metaLine, job.jobType]
      .filter((x) => typeof x === "string" && x.length > 0)
      .join(" · ") || "";
  const sal = jobSalaryLabel(job, locale);
  const appliesOnPlatform =
    (!job.listingKind || job.listingKind === "direct") && !job.externalListingId;

  return (
    <GshSwipeAction
      rightActions={[
        {
          label: savedRowId ? t("jobsUnsave") : t("jobsSave"),
          onPress: onToggleBookmark,
          tone: "primary",
        },
      ]}
    >
    <DepthSurface depth={5} radius={20} borderWidth={2} borderColor={colors.navy} innerStyle={styles.card}>
      <Pressable
        onPress={onPress}
        style={styles.cardMainHit}
        accessibilityRole="button"
      >
        <View style={styles.logoWell}>
          <CompanyLogo
            logoUrl={logoUrl}
            companyName={employer}
            size={64}
            radius={16}
          />
        </View>
        <View style={styles.cardMid}>
          <View style={styles.cardCompanyRow}>
            <Text style={styles.cardCompanyLine} numberOfLines={1}>
              {employer}
            </Text>
            {sponsorBadge ? (
              <View
                style={[
                  styles.sponsorPill,
                  sponsorBadge.positive && styles.sponsorPillActive,
                ]}
              >
                <Ionicons
                  name="shield-checkmark"
                  size={10}
                  color={colors.navy}
                />
                <Text style={styles.sponsorPillText} numberOfLines={1}>
                  {sponsorBadge.label}
                </Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {job.title}
          </Text>
          {meta ? (
            <View style={styles.cardMetaRow}>
              <Ionicons
                name="location-outline"
                size={14}
                color={colors.textMuted}
              />
              <Text style={styles.cardMetaLine} numberOfLines={2}>
                {meta}
              </Text>
            </View>
          ) : null}
          {sal ? (
            <Text style={styles.cardSalaryInline} numberOfLines={1}>
              {sal}
            </Text>
          ) : null}
          {chips.length > 0 ? (
            <View style={styles.chipWrap}>
              {chips.map((c) => {
                const pal = mobilityChipStyle(c);
                return (
                  <View key={c} style={[styles.listChip, pal.wrap]}>
                    <Text
                      style={[styles.listChipText, pal.text]}
                      numberOfLines={1}
                    >
                      {jobChipLabel(c, locale)}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : null}
          {compatibility ? (
            <View style={styles.compatibilityBadge}>
              <Text style={styles.compatibilityBadgeText}>
                {jobMatchLabel(compatibility.status, locale)}
              </Text>
            </View>
          ) : null}
        </View>
        <Pressable
          onPress={() => {
            void hapticLight();
            onToggleBookmark();
          }}
          hitSlop={10}
          style={styles.cardBookmarkHit}
          accessibilityRole="button"
          accessibilityLabel={savedRowId ? t("jobsUnsave") : t("jobsSave")}
          disabled={bookmarkLoading}
        >
          {bookmarkLoading ? (
            <ActivityIndicator size="small" color={colors.cyan} />
          ) : (
            <View style={[styles.bookmarkDisc, savedRowId ? styles.bookmarkDiscOn : null]}>
              <Ionicons
                name={savedRowId ? "bookmark" : "bookmark-outline"}
                size={18}
                color={colors.navy}
              />
            </View>
          )}
        </Pressable>
      </Pressable>
      <Pressable onPress={onPress} accessibilityRole="button">
        <View style={styles.cardFooter}>
          {appliesOnPlatform ? (
            <View style={styles.easyApplyRow}>
              <Ionicons name="flash" size={14} color={colors.navy} />
              <Text style={styles.easyApplyText}>{t("jobsEasyApply")}</Text>
            </View>
          ) : (
            <View />
          )}
          <View style={styles.cardFooterCta}>
            <Text style={styles.cardCta}>{t("jobsView")}</Text>
            <View style={styles.cardCtaArrow}>
              <Ionicons name="arrow-forward" size={14} color={colors.navy} />
            </View>
          </View>
        </View>
      </Pressable>
    </DepthSurface>
    </GshSwipeAction>
  );
}

export default function JobsTabScreen() {
  const { t, locale } = useAppCopy();

  const [sortHelpOpen, setSortHelpOpen] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [feedTab, setFeedTab] = useState<"direct" | "connected" | "curated">(
    "direct",
  );
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const [pullRefreshing, setPullRefreshing] = useState(false);
  const [topicsModalOpen, setTopicsModalOpen] = useState(false);
  const [listingInfoOpen, setListingInfoOpen] = useState(false);
  const ac = useAccountCopy();
  const { signedIn, openSignIn } = useSignInPrompt();
  const params = useLocalSearchParams<{
    q?: string;
    location?: string;
    benefit?: string;
    workMode?: string;
  }>();
  const [workModeFilter, setWorkModeFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [mobilityFilter, setMobilityFilter] = useState("");
  const [visaRouteFilter, setVisaRouteFilter] = useState("");
  const [compatibilityFirstEnabled, setCompatibilityFirstEnabled] =
    useState(false);

  useEffect(() => {
    // Expo Router already decodes parameters. Empty values intentionally clear an old linked filter.
    if (typeof params.q === "string") setQ(params.q.trim());
    if (typeof params.location === "string") setLocationFilter(params.location.trim());
    if (typeof params.benefit === "string") setMobilityFilter(params.benefit.trim());
    if (typeof params.workMode === "string") {
      setWorkModeFilter(["remote", "hybrid", "onsite"].includes(params.workMode) ? params.workMode : "");
    }
  }, [params.q, params.location, params.benefit, params.workMode]);

  const qc = useQueryClient();

  useEffect(() => {
    void loadRecentJobSearches().then(setRecent);
    void AsyncStorage.getItem(COMPATIBILITY_ORDER_KEY).then((value) =>
      setCompatibilityFirstEnabled(value === "1"),
    );
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
    queryFn: ({ pageParam }) => {
      return fetchPublicExternalJobListings({
        q: debouncedQ || undefined,
        location: locationFilter.trim() || undefined,
        benefit: mobilityFilter || undefined,
        workMode: workModeFilter || undefined,
        sourceRelationship: "curated_external",
        page: pageParam,
        perPage: 25,
      });
    },
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
    queryFn: ({ pageParam }) => {
      return fetchPublicExternalJobListings({
        q: debouncedQ || undefined,
        location: locationFilter.trim() || undefined,
        benefit: mobilityFilter || undefined,
        workMode: workModeFilter || undefined,
        sourceRelationship: "employer_connected",
        page: pageParam,
        perPage: 25,
      });
    },
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.perPage < lastPage.total
        ? lastPage.page + 1
        : undefined,
    staleTime: 60_000,
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
  const compatibilityIds = useMemo(() => directJobIds(hubJobs), [hubJobs]);
  const compatibilityQuery = useQuery({
    queryKey: ["compatibility", "jobs", compatibilityIds],
    queryFn: () => fetchMyJobsCompatibilityBatch(compatibilityIds),
    enabled: signedIn && compatibilityIds.length > 0,
    retry: false,
    staleTime: 60_000,
  });
  const compatibilityByJobId = useMemo(() => {
    const data = compatibilityQuery.data?.data;
    if (!data) return {} as Record<string, CompatibilityResult>;
    if (!Array.isArray(data)) return data;
    return Object.fromEntries(
      data.map((item) => [item.jobId, item.compatibility]),
    );
  }, [compatibilityQuery.data]);
  const orderedHubJobs = useMemo(
    () =>
      compatibilityFirstEnabled
        ? compatibilityFirst(hubJobs, compatibilityByJobId)
        : hubJobs,
    [compatibilityFirstEnabled, compatibilityByJobId, hubJobs],
  );
  const curatedJobs =
    curatedJobsQuery.data?.pages.flatMap((page) => page.data) ?? [];
  const connectedJobs =
    connectedJobsQuery.data?.pages.flatMap((page) => page.data) ?? [];
  const listRows =
    feedTab === "direct"
      ? orderedHubJobs
      : feedTab === "connected"
        ? connectedJobs
        : curatedJobs;

  const listBootloading =
    feedTab === "direct"
      ? hubJobsQuery.isLoading && !hubJobsQuery.data
      : feedTab === "connected"
        ? connectedJobsQuery.isLoading && !connectedJobsQuery.data
        : curatedJobsQuery.isLoading && !curatedJobsQuery.data;

  const activeError =
    feedTab === "direct"
      ? hubJobsQuery.isError
      : feedTab === "connected"
        ? connectedJobsQuery.isError
        : curatedJobsQuery.isError;
  const activeHasNextPage =
    feedTab === "direct"
      ? hubJobsQuery.hasNextPage
      : feedTab === "connected"
        ? connectedJobsQuery.hasNextPage
        : curatedJobsQuery.hasNextPage;
  const activeFetchingNextPage =
    feedTab === "direct"
      ? hubJobsQuery.isFetchingNextPage
      : feedTab === "connected"
        ? connectedJobsQuery.isFetchingNextPage
        : curatedJobsQuery.isFetchingNextPage;
  const loadNextPage = useCallback(() => {
    if (!activeHasNextPage || activeFetchingNextPage) return;
    if (feedTab === "direct") void hubJobsQuery.fetchNextPage();
    else if (feedTab === "connected") void connectedJobsQuery.fetchNextPage();
    else void curatedJobsQuery.fetchNextPage();
  }, [
    activeFetchingNextPage,
    activeHasNextPage,
    connectedJobsQuery,
    curatedJobsQuery,
    feedTab,
    hubJobsQuery,
  ]);
  const activeStructuredFilters = [
    ...(workModeFilter ? [{ id: "workMode", label: ac(({remote: "Remote", hybrid: "Hybrid", onsite: "On-site"} as Record<string, string>)[workModeFilter]) }] : []),
    ...(mobilityFilter
      ? [
          {
            id: "mobility",
            label: t("jobsMobilityLabel", {
              value: jobChipLabel(mobilityFilter, locale),
            }),
          },
        ]
      : []),
    ...(feedTab === "direct" && visaRouteFilter
      ? [{ id: "visa", label: t("jobsVisaLabel", { route: visaRouteFilter }) }]
      : []),
  ];

  const onRefresh = useCallback(() => {
    setPullRefreshing(true);
    void Promise.all([
      hubJobsQuery.refetch(),
      curatedJobsQuery.refetch(),
      connectedJobsQuery.refetch(),
      ...(signedIn ? [savedJobsQuery.refetch()] : []),
    ]).finally(() => setPullRefreshing(false));
  }, [hubJobsQuery, curatedJobsQuery, connectedJobsQuery, savedJobsQuery, signedIn]);

  const filterCount = activeStructuredFilters.length + (locationFilter ? 1 : 0);

  const listHeader = (
    <>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) + 12 }]}>
        <DecorRing size={220} thickness={30} color="rgba(66,224,227,0.18)" style={{ top: -100, right: -90 }} />
        <View style={styles.headerTop}>
          <Eyebrow>{t("jobs")}</Eyebrow>
          <Pressable
            onPress={() => router.push("/alerts")}
            style={styles.roundButton}
            accessibilityRole="button"
            accessibilityLabel={ac("Job alerts")}
          >
            <Ionicons name="notifications-outline" size={20} color={colors.navy} />
          </Pressable>
        </View>
        <PosterTitle {...posterParts(ac("Find your|next move."))} size={34} />
        <View style={styles.searchRow}>
          <DepthSurface
            depth={4}
            radius={18}
            borderWidth={2}
            borderColor={colors.navy}
            style={styles.searchWrap}
            innerStyle={styles.searchCapsule}
          >
            <Ionicons name="search" size={20} color={colors.navy} style={styles.heroSearchIcon} />
            <TextInput
              style={styles.heroSearchInput}
              placeholder={
                feedTab === "direct"
                  ? t("jobsSearchDirect")
                  : feedTab === "connected"
                    ? t("jobsSearchConnected")
                    : t("jobsSearchExternal")
              }
              placeholderTextColor={colors.placeholder}
              value={q}
              onChangeText={setQ}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              accessibilityLabel={t("jobsSearch")}
            />
            {q.length > 0 ? (
              <Pressable
                onPress={() => setQ("")}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel={t("jobsClear")}
              >
                <Ionicons name="close-circle" size={20} color={colors.textMuted} />
              </Pressable>
            ) : null}
          </DepthSurface>
          <DepthPressable
            onPress={() => setTopicsModalOpen(true)}
            face={colors.navy}
            depthColor={colors.navyDeep}
            depth={4}
            radius={18}
            accessibilityLabel={t("jobsOpenFilters")}
            innerStyle={styles.filterButton}
          >
            <Ionicons name="options-outline" size={22} color={colors.cyan} />
            {filterCount > 0 ? (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{filterCount}</Text>
              </View>
            ) : null}
          </DepthPressable>
        </View>
      </View>

      {/* ── Feed controls ── */}
      <View style={styles.feedControls}>
        <View style={styles.segmentHost}>
          <Pressable
            style={[
              styles.segmentCell,
              feedTab === "direct" && styles.segmentCellOn,
            ]}
            onPress={() => {
              void hapticLight();
              setFeedTab("direct");
            }}
            accessibilityRole="button"
            accessibilityState={{ selected: feedTab === "direct" }}
          >
            <Text
              style={[
                styles.segmentText,
                feedTab === "direct" && styles.segmentTextOn,
              ]}
            >
              {t("jobsDirectTab")}
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.segmentCell,
              feedTab === "connected" && styles.segmentCellOn,
            ]}
            onPress={() => {
              void hapticLight();
              setFeedTab("connected");
            }}
            accessibilityRole="button"
            accessibilityState={{ selected: feedTab === "connected" }}
          >
            <Text
              style={[
                styles.segmentText,
                feedTab === "connected" && styles.segmentTextOn,
              ]}
            >
              {t("jobsConnectedTab")}
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.segmentCell,
              feedTab === "curated" && styles.segmentCellOnCurated,
            ]}
            onPress={() => {
              void hapticLight();
              setFeedTab("curated");
            }}
            accessibilityRole="button"
            accessibilityState={{ selected: feedTab === "curated" }}
          >
            <Text
              style={[
                styles.segmentText,
                feedTab === "curated" && styles.segmentTextOnCurated,
              ]}
            >
              {t("jobsExternalTab")}
            </Text>
          </Pressable>
        </View>
        {signedIn && feedTab === "direct" && hubJobs.length > 1 ? (
          <View>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <Pressable
                style={[styles.compatibilityOrder, { flex: 1, minHeight: 44 }]}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: compatibilityFirstEnabled }}
                onPress={() => {
                  const next = !compatibilityFirstEnabled;
                  setCompatibilityFirstEnabled(next);
                  void AsyncStorage.setItem(
                    COMPATIBILITY_ORDER_KEY,
                    next ? "1" : "0",
                  );
                }}
              >
                <Ionicons
                  name={
                    compatibilityFirstEnabled
                      ? "checkmark-circle"
                      : "ellipse-outline"
                  }
                  size={18}
                  color={colors.teal}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.compatibilityOrderTitle}>
                    {t("jobsSort")}
                  </Text>
                  {/* no roles are hidden */}
                </View>
              </Pressable>
              <Pressable
                onPress={() => setSortHelpOpen((v) => !v)}
                accessibilityRole="button"
                accessibilityLabel={t("jobsSortHelp")}
                accessibilityState={{ expanded: sortHelpOpen }}
                style={{
                  minWidth: 44,
                  minHeight: 44,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons
                  name="help-circle-outline"
                  size={21}
                  color={colors.navy}
                />
              </Pressable>
            </View>
            {sortHelpOpen ? (
              <Text
                style={[
                  styles.compatibilityOrderHint,
                  { paddingHorizontal: 12, paddingBottom: 10 },
                ]}
              >
                {t("jobsSortBody")}
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillFilterScroll}
      >
        {(
          [
            {
              id: "remote",
              label: t("jobsPillRemote"),
              active: workModeFilter === "remote",
              onPress: () =>
                setWorkModeFilter((v) => (v === "remote" ? "" : "remote")),
            },
            {
              id: "hybrid",
              label: t("jobsPillHybrid"),
              active: workModeFilter === "hybrid",
              onPress: () =>
                setWorkModeFilter((v) => (v === "hybrid" ? "" : "hybrid")),
            },
            {
              id: "sponsorship",
              label: t("jobsPillSponsorship"),
              active: mobilityFilter === "Visa Sponsorship",
              onPress: () =>
                setMobilityFilter((v) =>
                  v === "Visa Sponsorship" ? "" : "Visa Sponsorship",
                ),
            },
            {
              id: "relocation",
              label: t("jobsPillRelocation"),
              active: mobilityFilter === "Relocation Support",
              onPress: () =>
                setMobilityFilter((v) =>
                  v === "Relocation Support" ? "" : "Relocation Support",
                ),
            },
          ] as const
        ).map((pill) => (
          <BrandChip
            key={pill.id}
            label={pill.label}
            selected={pill.active}
            onPress={() => {
              void hapticLight();
              pill.onPress();
            }}
          />
        ))}
      </ScrollView>

      {activeStructuredFilters.length > 0 ? (
        <View style={styles.activeFiltersOuter}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recentScroll}
          >
            {activeStructuredFilters.map(({ id, label }) => (
              <Pressable
                key={id}
                style={styles.recentChip}
                onPress={() => {
                  if (id === "workMode") setWorkModeFilter("");
                  if (id === "mobility") setMobilityFilter("");
                  if (id === "visa") setVisaRouteFilter("");
                }}
                accessibilityRole="button"
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={12}
                  color={colors.teal}
                />
                <Text style={styles.recentChipText} numberOfLines={1}>
                  {label}
                </Text>
                <Ionicons name="close" size={12} color={colors.textMuted} />
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}

      {/* ── Recent searches ── */}
      {recent.length > 0 ? (
        <View style={styles.recentOuter}>
          <Text style={styles.recentLabel}>{t("jobsRecent")}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recentScroll}
          >
            {recent.map((term) => (
              <Pressable
                key={term}
                style={styles.recentChip}
                onPress={() => setQ(term)}
                accessibilityRole="button"
              >
                <Ionicons
                  name="time-outline"
                  size={12}
                  color={colors.textMuted}
                />
                <Text style={styles.recentChipText} numberOfLines={1}>
                  {term}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}

      <View style={styles.listHeadingWrap}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <GshDarkFeedHeading
            title={
              feedTab === "direct"
                ? t("jobsDirectTitle")
                : feedTab === "connected"
                  ? t("jobsConnectedTitle")
                  : t("jobsExternalTitle")
            }
            subtitle={
              feedTab === "direct"
                ? t("jobsDirectDesc")
                : feedTab === "connected"
                  ? t("jobsConnectedDesc")
                  : t("jobsExternalDesc")
            }
            actionLabel={feedTab === "curated" ? t("homeSeeAll") : undefined}
            onAction={
              feedTab === "curated"
                ? () => router.push("/curated-listings")
                : undefined
            }
          />
        </View>
        <Pressable
          onPress={() => setListingInfoOpen(true)}
          hitSlop={10}
          style={styles.listInfoBtn}
          accessibilityRole="button"
          accessibilityLabel={t("jobsInfo")}
        >
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={colors.teal}
          />
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
    <BrandStatePanel
      icon="cloud-offline-outline"
      title={t("jobsError")}
      body={t("newsErrorHelp")}
      primary={{
        label: t("retry"),
        icon: "refresh",
        onPress: () =>
          void (feedTab === "direct"
            ? hubJobsQuery.refetch()
            : feedTab === "connected"
              ? connectedJobsQuery.refetch()
              : curatedJobsQuery.refetch()),
      }}
      style={styles.statePanel}
    />
  ) : listRows.length === 0 ? (
    <BrandStatePanel
      icon={debouncedQ ? "search-outline" : "briefcase-outline"}
      title={debouncedQ ? t("jobsNoMatches") : t("jobsEmpty")}
      body={
        debouncedQ
          ? ac("Try a different word, or clear your filters.")
          : ac("New roles are added every week. Set up an alert and we'll tell you.")
      }
      primary={
        debouncedQ
          ? { label: t("jobsClear"), icon: "close", onPress: () => setQ("") }
          : { label: ac("Set up a job alert"), icon: "notifications-outline", onPress: () => router.push("/alerts") }
      }
      secondary={
        !debouncedQ && feedTab === "direct"
          ? {
              label: t("jobsTryExternal"),
              onPress: () => {
                void hapticLight();
                setFeedTab("curated");
              },
            }
          : undefined
      }
      style={styles.statePanel}
    />
  ) : null;

  return (
    <GshScreenShell constrainTabletWidth style={styles.shell}>
      <FlatList
        data={activeError ? [] : listRows}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={emptyBody}
        style={styles.listFlex}
        refreshControl={
          <RefreshControl
            refreshing={pullRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.cyan}
          />
        }
        contentContainerStyle={[
          styles.listPad,
          { paddingBottom: tabBarBottomPadding(insets.bottom) },
          listRows.length === 0 && !listBootloading && styles.listPadGrow,
        ]}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <View style={styles.listRow}>
            {feedTab === "direct" ? (
              <HubJobCard
                job={item as Job}
                onPress={() => router.push(`/job/${(item as Job)._id}`)}
                savedRowId={savedJobIdByListingId.get((item as Job)._id)}
                bookmarkLoading={
                  (saveJobMut.isPending &&
                    saveJobMut.variables === (item as Job)._id) ||
                  (unsaveJobMut.isPending &&
                    unsaveJobMut.variables ===
                      savedJobIdByListingId.get((item as Job)._id))
                }
                onToggleBookmark={() => {
                  const j = item as Job;
                  if (!signedIn) {
                    openSignIn("/(tabs)/jobs", { kind: "save_job", targetId: j._id });
                    return;
                  }
                  const sid = savedJobIdByListingId.get(j._id);
                  if (sid) unsaveJobMut.mutate(sid);
                  else saveJobMut.mutate(j._id);
                }}
                compatibility={compatibilityByJobId[(item as Job)._id]}
              />
            ) : (
              <CuratedExternalJobCard
                job={item as ExternalJobListingPublic}
                onPress={() =>
                  router.push(
                    `/external-job/${(item as ExternalJobListingPublic)._id}`,
                  )
                }
              />
            )}
          </View>
        )}
        onEndReached={loadNextPage}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          activeFetchingNextPage ? (
            <View style={styles.paginationLoader}>
              <ActivityIndicator color={colors.brand} />
              <Text style={styles.paginationLoaderText}>
                {t("jobsLoadingMore")}
              </Text>
            </View>
          ) : null
        }
      />

      <DiscoverTopicsFilterModal
        visible={topicsModalOpen}
        onClose={() => setTopicsModalOpen(false)}
        query={q}
        location={locationFilter}
        workModeFilter={workModeFilter}
        onPickWorkMode={setWorkModeFilter}
        mobilityFilter={mobilityFilter}
        visaRouteFilter={visaRouteFilter}
        onPickExplore={setQ}
        onPickCountry={setLocationFilter}
        onPickMobilityFilter={setMobilityFilter}
        onPickVisaRoute={(route) => {
          setFeedTab("direct");
          setVisaRouteFilter(route);
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
  shell: { backgroundColor: colors.white },
  listFlex: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 6,
    overflow: "hidden",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  roundButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.navy,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  searchRow: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchWrap: { flex: 1, minWidth: 0 },
  searchCapsule: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    minHeight: 52,
  },
  filterButton: {
    width: 56,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: colors.cyan,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadgeText: {
    fontSize: 11,
    fontFamily: fontFamily.extraBold,
    color: colors.navy,
  },
  statePanel: { marginHorizontal: 16, marginTop: 12 },
  heroSearchIcon: { marginRight: 8 },
  heroSearchInput: {
    flex: 1,
    minWidth: 0,
    minHeight: 48,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: fontFamily.regular,
    color: colors.navy,
  },
  feedControls: {
    paddingTop: 12,
    paddingBottom: 4,
    paddingHorizontal: 16,
  },
  pillFilterScroll: {
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
  },
  compatibilityOrder: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    marginTop: 9,
    padding: 10,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
  },
  compatibilityOrderTitle: {
    fontSize: 13,
    fontFamily: fontFamily.bold,
    color: colors.navy,
  },
  compatibilityOrderHint: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 15,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
  },
  activeFiltersOuter: { paddingTop: 8, paddingHorizontal: 16 },
  segmentHost: {
    flexDirection: "row",
    backgroundColor: colors.pale,
    borderRadius: 16,
    padding: 4,
    borderWidth: 2,
    borderColor: colors.navy,
  },
  segmentCell: {
    flex: 1,
    minHeight: 44,
    paddingVertical: 9,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  segmentCellOn: { backgroundColor: colors.navy },
  segmentCellOnCurated: { backgroundColor: colors.navy },
  segmentText: {
    fontSize: 13,
    fontFamily: fontFamily.bold,
    color: "rgba(13,25,78,0.6)",
    textAlign: "center",
  },
  segmentTextOn: { fontFamily: fontFamily.extraBold, color: colors.cyan },
  segmentTextOnCurated: { fontFamily: fontFamily.extraBold, color: colors.cyan },

  // Recent
  recentOuter: { paddingTop: 12, paddingHorizontal: 16 },
  recentLabel: {
    fontSize: 11,
    fontFamily: fontFamily.semiBold,
    color: colors.textMuted,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  recentScroll: { gap: 8, paddingBottom: 4 },
  recentChip: {
    minHeight: 44,
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
  recentChipText: {
    fontSize: 13,
    fontFamily: fontFamily.medium,
    color: colors.textSecondary,
    maxWidth: 160,
  },

  listHeadingWrap: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    gap: 4,
  },
  listInfoBtn: {
    minWidth: 44,
    minHeight: 44,
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  /** No horizontal pad here — hero is full-bleed like Home; rows use listRow. */
  listPad: { gap: 10 },
  listRow: { paddingHorizontal: 16 },
  listPadGrow: { flexGrow: 1 },
  paginationLoader: { paddingVertical: 22, alignItems: "center", gap: 8 },
  paginationLoaderText: {
    fontSize: 12,
    fontFamily: fontFamily.semiBold,
    color: colors.textMuted,
  },
  card: {
    paddingVertical: 16,
    paddingHorizontal: 14,
    minHeight: 148,
  },
  bookmarkDisc: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: colors.navy,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  bookmarkDiscOn: { backgroundColor: colors.cyan },
  cardMainHit: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    minWidth: 0,
  },
  logoWell: {
    borderRadius: 18,
    backgroundColor: colors.pale,
    padding: 2,
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
  cardBookmarkHit: {
    width: 44,
    height: 44,
    alignItems: "flex-end",
    justifyContent: "flex-start",
    paddingTop: 2,
  },
  cardTitle: {
    fontSize: 17,
    fontFamily: fontFamily.heading,
    color: colors.navy,
    letterSpacing: -0.3,
    marginTop: 4,
    marginBottom: 4,
    lineHeight: 22,
  },
  cardCompanyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  cardCompanyLine: {
    fontSize: 13,
    fontFamily: fontFamily.medium,
    color: colors.textSecondary,
    flexShrink: 1,
  },
  sponsorPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.pill,
    backgroundColor: colors.brandSoft,
    maxWidth: "100%",
  },
  sponsorPillActive: { backgroundColor: colors.brandSoft },
  sponsorPillText: {
    fontSize: 10,
    fontFamily: fontFamily.semiBold,
    color: colors.navy,
    letterSpacing: 0.3,
    flexShrink: 1,
  },
  cardMetaRow: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 4,
    paddingRight: 4,
  },
  cardMetaLine: {
    flex: 1,
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    lineHeight: 18,
  },
  cardSalaryInline: {
    marginTop: 4,
    fontSize: 14,
    fontFamily: fontFamily.semiBold,
    color: colors.navy,
  },
  chipWrap: { marginTop: 8, flexDirection: "row", flexWrap: "wrap", gap: 6 },
  listChip: {
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: radii.pill,
  },
  listChipText: { fontSize: 11, fontFamily: fontFamily.medium },
  compatibilityBadge: {
    alignSelf: "flex-start",
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.brandSoft,
    borderWidth: 1,
    borderColor: "rgba(66,224,227,0.45)",
  },
  compatibilityBadgeText: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
    color: colors.navy,
  },
  cardFooter: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  easyApplyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: "rgba(66,224,227,0.22)",
  },
  easyApplyText: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
    color: colors.navy,
  },
  cardFooterEnd: { flexDirection: "row", alignItems: "center", gap: 4 },
  cardFooterCta: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardSalary: {
    fontSize: 15,
    fontFamily: fontFamily.heading,
    color: colors.navy,
    letterSpacing: -0.2,
    flex: 1,
    paddingRight: 8,
  },
  cardSalarySpacer: { flex: 1 },
  cardCta: {
    fontSize: 14,
    fontFamily: fontFamily.bold,
    color: colors.navy,
  },
  cardCtaArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.cyan,
    alignItems: "center",
    justifyContent: "center",
  },

  // Empty/error
  skeletonList: { paddingHorizontal: 16, paddingTop: 12, gap: 0 },
});
