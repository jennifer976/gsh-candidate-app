import { applicationStatusLabel } from "@/lib/i18n/catalog";
import { useAppCopy } from "@/lib/i18n";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { useReducedMotion } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DashboardHubJobPreview } from "@/components/DashboardHubJobPreview";
import { GshChromeIconButton } from "@/components/GshChromeIconButton";
import { GshHomeDestinationRail } from "@/components/GshHomeDestinationRail";
import { GshPressable } from "@/components/GshPressable";
import { GshScreenShell } from "@/components/GshScreenShell";
import { GshEmptyState } from "@/components/GshEmptyState";
import { brandLogo } from "@/lib/brand-assets";
import {
  fetchCandidateDashboard,
  fetchConversations,
  fetchJobMatches,
  fetchOwnProfile,
  fetchUnreadNotificationCount,
} from "@/lib/api-client";
import { presentApiError } from "@/lib/api-error";
import { getCandidateCompletionBreakdown } from "@/lib/profile-completion";
import { enterDown, enterUp, MOTION } from "@/lib/motion";
import { FEED_SECTION_GAP } from "@/lib/screen-layout";
import { colors, fontFamily, radii } from "@/lib/theme";

function StatusChip({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string | number;
  onPress: () => void;
}) {
  return (
    <GshPressable
      style={styles.statusChip}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}`}
      pressScale={0.96}
    >
      <Text style={styles.statusValue}>{value}</Text>
      <Text style={styles.statusLabel}>{label}</Text>
    </GshPressable>
  );
}

export default function HomeScreen() {
  const { t, locale } = useAppCopy();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();

  const q = useQuery({
    queryKey: ["analytics", "candidate-dashboard"],
    queryFn: fetchCandidateDashboard,
  });
  const profileQuery = useQuery({
    queryKey: ["profile", "me"],
    queryFn: fetchOwnProfile,
    staleTime: 45_000,
  });
  const conversationsQuery = useQuery({
    queryKey: ["message-conversations"],
    queryFn: fetchConversations,
    staleTime: 60_000,
  });
  const matchesQuery = useQuery({
    queryKey: ["candidate", "job-matches", "home"],
    queryFn: () => fetchJobMatches({ unread: true, limit: 1 }),
    staleTime: 30_000,
  });
  const notificationsQuery = useQuery({
    queryKey: ["notifications-unread"],
    queryFn: fetchUnreadNotificationCount,
    staleTime: 30_000,
  });

  const firstName =
    profileQuery.data &&
    typeof (profileQuery.data as { firstName?: unknown }).firstName === "string"
      ? String((profileQuery.data as { firstName: string }).firstName)
      : "";
  const discoveryOn =
    (profileQuery.data as { employerDiscoveryConsent?: { enabled?: unknown } } | undefined)
      ?.employerDiscoveryConsent?.enabled === true;

  const onRefresh = useCallback(() => {
    void q.refetch();
    void profileQuery.refetch();
    void matchesQuery.refetch();
  }, [q, profileQuery, matchesQuery]);

  if (q.isLoading && !q.data) {
    return (
      <GshScreenShell constrainTabletWidth>
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color={colors.cyan}
            accessibilityLabel={t("homeLoadingLabel")}
          />
          <Text style={styles.loadingHint}>{t("homeLoading")}</Text>
        </View>
      </GshScreenShell>
    );
  }

  if (q.isError || !q.data) {
    const errCopy = presentApiError(q.error, locale);
    return (
      <GshScreenShell constrainTabletWidth>
        <ScrollView
          contentContainerStyle={styles.centerPad}
          refreshControl={
            <RefreshControl
              refreshing={q.isFetching}
              onRefresh={onRefresh}
              tintColor={colors.navy}
            />
          }
        >
          <View
            accessible
            accessibilityRole="alert"
            accessibilityLabel={`${errCopy.title}. ${errCopy.subtitle}`}
            style={styles.errorAnnounce}
          >
            <Ionicons
              name="briefcase-outline"
              size={48}
              color={colors.cyan}
              importantForAccessibility="no"
            />
            <Text style={styles.errorTitle}>{errCopy.title}</Text>
            <Text style={styles.errorSub}>{errCopy.subtitle}</Text>
          </View>
          <Pressable
            style={styles.retryBtn}
            onPress={() => void q.refetch()}
            accessibilityRole="button"
            accessibilityLabel={t("retry")}
            accessibilityHint={t("homeReloadHint")}
          >
            <Text style={styles.retryText}>{t("retry")}</Text>
          </Pressable>
        </ScrollView>
      </GshScreenShell>
    );
  }

  const d = q.data;
  const missing = profileQuery.data
    ? getCandidateCompletionBreakdown(profileQuery.data, locale).missing
    : [];
  const recentSlice = (d.recentApplications ?? []).slice(0, 5);
  const savedJobRows = (d.savedJobs ?? []).filter(
    (job): job is NonNullable<typeof job> =>
      Boolean(job && typeof job === "object" && job._id),
  );
  const savedCount = savedJobRows.length;
  const greeting = firstName
    ? t("homeGreetingName", { name: firstName })
    : t("homeGreeting");
  const chatCount = conversationsQuery.data?.length ?? 0;
  const unreadMessages = (conversationsQuery.data ?? []).reduce(
    (total, row) =>
      total + Math.max(0, row.unreadCount ?? (row.read === false ? 1 : 0)),
    0,
  );
  const unreadNotifications = notificationsQuery.data?.unreadCount ?? 0;
  const latestJobs = (d.latestJobs ?? []).slice(0, 6);
  const latestJobCount = latestJobs.length;
  const unreadMatches = matchesQuery.data?.unreadCount ?? 0;
  const appliedCount = d.stats.totalApplied ?? 0;
  const isNewUser =
    appliedCount === 0 && savedCount === 0 && latestJobCount === 0;

  const next =
    unreadMatches > 0
      ? {
          title: t("homeMatches"),
          href: "/alerts" as const,
        }
      : missing.length > 0
        ? {
            title: t("homeProfileStep"),
            href: "/(tabs)/profile" as const,
          }
        : !discoveryOn
          ? {
              title: t("homeMatchingNudge"),
              href: "/mobility-profile" as const,
            }
          : {
              title: t("homeBrowse"),
              href: "/(tabs)/jobs" as const,
            };

  const toolTiles = [
    {
      icon: "airplane-outline" as const,
      label: t("screenRelocationhelp"),
      href: "/relocation-help" as const,
    },
    {
      icon: "people-outline" as const,
      label: t("resourcesSpecialists"),
      href: "/partners" as const,
    },
    {
      icon: "map-outline" as const,
      label: t("resourcesGuides"),
      href: "/guides" as const,
    },
    {
      icon: "library-outline" as const,
      label: t("homeTools"),
      href: "/tools-resources" as const,
    },
  ] as const;

  return (
    <GshScreenShell constrainTabletWidth style={styles.shell}>
      <ScrollView
        contentContainerStyle={styles.scrollPad}
        refreshControl={
          <RefreshControl
            refreshing={q.isFetching}
            onRefresh={onRefresh}
            tintColor={colors.navy}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.appBar, { paddingTop: Math.max(insets.top, 12) + 4 }]}>
          <Image
            source={brandLogo}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="Global Sponsor Hub"
          />
          <View style={styles.appBarActions}>
            <GshChromeIconButton
              icon="notifications-outline"
              onPress={() => router.push("/notification-feed")}
              accessibilityLabel={t("inbox")}
              badgeCount={unreadNotifications}
            />
            <GshChromeIconButton
              icon="chatbubble-outline"
              onPress={() => router.push("/(tabs)/messages")}
              accessibilityLabel={t("messages")}
              badgeCount={unreadMessages}
            />
          </View>
        </View>
        <Text style={styles.largeTitle}>{greeting}</Text>

        <Animated.View entering={enterUp(MOTION.primary, reduceMotion)} style={styles.statusRow}>
          <StatusChip
            label={t("homeMatches")}
            value={matchesQuery.isError ? "—" : unreadMatches}
            onPress={() => router.push("/alerts")}
          />
          <StatusChip
            label={t("saved")}
            value={savedCount}
            onPress={() => router.push("/saved")}
          />
          <StatusChip
            label={t("applications")}
            value={appliedCount}
            onPress={() => router.push("/(tabs)/applications")}
          />
        </Animated.View>

        <Animated.View entering={enterUp(MOTION.secondary, reduceMotion)} style={styles.destBlock}>
          <GshHomeDestinationRail />
        </Animated.View>

        <View style={styles.bodyPad}>
          <Animated.View entering={enterUp(MOTION.secondary + 40, reduceMotion)}>
            <GshPressable
              style={styles.taskCard}
              onPress={() => router.push(next.href)}
              accessibilityRole="button"
              pressScale={0.98}
            >
              <View style={styles.taskIcon}>
                <Ionicons name="flash" size={20} color={colors.navy} />
              </View>
              <View style={styles.taskCopy}>
                <Text style={styles.taskEyebrow}>{t("homeNextStep")}</Text>
                <Text style={styles.taskTitle} numberOfLines={2}>
                  {next.title}
                </Text>
              </View>
              <View style={styles.taskChevron}>
                <Ionicons name="arrow-forward" size={18} color={colors.navy} />
              </View>
            </GshPressable>
          </Animated.View>

          {isNewUser ? (
            <Animated.View entering={enterDown(MOTION.tertiary, reduceMotion)}>
              <GshEmptyState
                icon="compass-outline"
                title={t("homeEmpty")}
                actionLabel={t("homeBrowse")}
                onAction={() => router.push("/(tabs)/jobs")}
                useBrandMark
              />
            </Animated.View>
          ) : null}
        </View>

        {latestJobCount > 0 ? (
          <Animated.View entering={enterUp(MOTION.tertiary, reduceMotion)}>
            <View style={styles.railHeaderPad}>
              <Text style={styles.sectionTitle}>{t("homeNew")}</Text>
              <GshPressable
                onPress={() => router.push("/(tabs)/jobs")}
                accessibilityRole="button"
                haptic={false}
                style={styles.seeAllHit}
              >
                <Text style={styles.seeAll}>{t("homeBrowseAll")}</Text>
              </GshPressable>
            </View>
            <View style={styles.featuredPad}>
              <DashboardHubJobPreview
                job={latestJobs[0]}
                variant="hero"
                featuredLabel={t("homeFeatured")}
                viewLabel={t("jobsView")}
                onPress={() => router.push(`/job/${latestJobs[0]._id}`)}
              />
            </View>
            {latestJobs.length > 1 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.jobRail}
                decelerationRate="fast"
                snapToInterval={292}
              >
                {latestJobs.slice(1).map((job) => (
                  <View key={job._id} style={styles.jobCardWrap}>
                    <DashboardHubJobPreview
                      job={job}
                      variant="card"
                      viewLabel={t("jobsView")}
                      onPress={() => router.push(`/job/${job._id}`)}
                    />
                  </View>
                ))}
              </ScrollView>
            ) : null}
          </Animated.View>
        ) : null}

        <View style={styles.bodyPad}>
          {recentSlice.length > 0 ? (
            <Animated.View
              entering={enterUp(MOTION.tertiary + 60, reduceMotion)}
              style={styles.section}
            >
              <Text style={styles.sectionTitle}>{t("homeRecent")}</Text>
              <View style={styles.listGroup}>
                {recentSlice.map((a, i) => (
                  <View key={`${a.jobTitle}-${i}`}>
                    <GshPressable
                      style={styles.appRow}
                      onPress={() => router.push("/(tabs)/applications")}
                      accessibilityRole="button"
                    >
                      <View style={styles.appText}>
                        <Text style={styles.listTitle} numberOfLines={2}>
                          {a.jobTitle}
                        </Text>
                        <Text style={styles.listSub} numberOfLines={2}>
                          {a.companyName} ·{" "}
                          <Text style={styles.statusEm}>
                            {applicationStatusLabel(a.status, locale)}
                          </Text>
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                    </GshPressable>
                    {i < recentSlice.length - 1 ? <View style={styles.listHairline} /> : null}
                  </View>
                ))}
              </View>
            </Animated.View>
          ) : null}

          {chatCount > 0 ? (
            <Animated.View entering={enterUp(MOTION.tertiary + 80, reduceMotion)}>
              <GshPressable
                style={styles.messageCard}
                onPress={() => router.push("/(tabs)/messages")}
                accessibilityRole="button"
              >
                <View style={styles.toolIconWell}>
                  <Ionicons name="chatbubbles-outline" size={22} color={colors.navy} />
                </View>
                <Text style={styles.toolRowLabel}>{t("messages")}</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </GshPressable>
            </Animated.View>
          ) : null}

          <Animated.View
            entering={enterUp(MOTION.tertiary + 100, reduceMotion)}
            style={styles.toolsBlock}
          >
            <Text style={styles.sectionTitle}>{t("homeTools")}</Text>
            <View style={styles.toolGrid}>
              {toolTiles.map((row) => (
                <GshPressable
                  key={row.href}
                  style={styles.toolTile}
                  onPress={() => router.push(row.href)}
                  accessibilityRole="button"
                  pressScale={0.97}
                >
                  <View style={styles.toolIconWell}>
                    <Ionicons name={row.icon} size={22} color={colors.navy} />
                  </View>
                  <Text style={styles.toolTileLabel} numberOfLines={2}>
                    {row.label}
                  </Text>
                </GshPressable>
              ))}
            </View>
          </Animated.View>
        </View>
      </ScrollView>
    </GshScreenShell>
  );
}

const styles = StyleSheet.create({
  shell: { backgroundColor: colors.pale },
  scrollPad: { paddingBottom: Platform.OS === "ios" ? 96 : 48 },
  appBar: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: { width: 168, height: 36, maxWidth: "62%" },
  appBarActions: { flexDirection: "row", gap: 8 },
  largeTitle: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    fontSize: 34,
    lineHeight: 40,
    fontFamily: fontFamily.headingStrong,
    color: colors.navy,
    letterSpacing: -0.8,
  },
  destBlock: { paddingTop: 6 },
  bodyPad: {
    paddingHorizontal: 16,
    paddingTop: FEED_SECTION_GAP,
    paddingBottom: 4,
    gap: 12,
  },
  statusRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
  },
  statusChip: {
    flex: 1,
    minHeight: 64,
    borderRadius: radii.lg,
    backgroundColor: colors.navy,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  statusValue: {
    fontSize: 24,
    fontFamily: fontFamily.headingStrong,
    color: colors.cyan,
    letterSpacing: -0.4,
  },
  statusLabel: {
    marginTop: 2,
    fontSize: 11,
    fontFamily: fontFamily.semiBold,
    color: "rgba(255,255,255,0.72)",
  },
  taskCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    minHeight: 72,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: radii.lg,
    backgroundColor: colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  taskIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cyan,
    alignItems: "center",
    justifyContent: "center",
  },
  taskCopy: { flex: 1, minWidth: 0 },
  taskEyebrow: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: colors.navy,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  taskTitle: {
    marginTop: 3,
    fontSize: 17,
    fontFamily: fontFamily.heading,
    color: colors.navy,
    letterSpacing: -0.3,
  },
  taskChevron: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.cyan,
    alignItems: "center",
    justifyContent: "center",
  },
  railHeaderPad: {
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    marginTop: FEED_SECTION_GAP,
  },
  featuredPad: { paddingHorizontal: 16, marginBottom: 12 },
  jobRail: { paddingHorizontal: 16, gap: 12, paddingBottom: 4 },
  jobCardWrap: { width: 280 },
  seeAllHit: { minHeight: 44, justifyContent: "center" },
  seeAll: {
    fontSize: 15,
    fontFamily: fontFamily.semiBold,
    color: colors.navy,
  },
  section: { paddingTop: 4, gap: 10 },
  sectionTitle: {
    fontSize: 22,
    fontFamily: fontFamily.heading,
    color: colors.navy,
    letterSpacing: -0.4,
  },
  listGroup: {
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.white,
    overflow: "hidden",
  },
  listHairline: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: 14,
  },
  appRow: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.white,
  },
  appText: { flex: 1, minWidth: 0 },
  listTitle: {
    fontSize: 16,
    fontFamily: fontFamily.semiBold,
    color: colors.navy,
    letterSpacing: -0.2,
  },
  listSub: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    marginTop: 4,
    lineHeight: 20,
  },
  statusEm: { fontFamily: fontFamily.semiBold, color: colors.textSecondary },
  messageCard: {
    minHeight: 64,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  toolsBlock: { paddingTop: 8, gap: 12 },
  toolGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  toolTile: {
    width: "48%",
    flexGrow: 1,
    minHeight: 108,
    padding: 14,
    borderRadius: radii.lg,
    backgroundColor: colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    gap: 12,
  },
  toolIconWell: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  toolTileLabel: {
    fontSize: 15,
    fontFamily: fontFamily.semiBold,
    color: colors.navy,
    letterSpacing: -0.2,
    lineHeight: 20,
  },
  toolRowLabel: {
    flex: 1,
    fontSize: 16,
    fontFamily: fontFamily.semiBold,
    color: colors.navy,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 12,
  },
  centerPad: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 16,
  },
  errorAnnounce: { alignItems: "center", maxWidth: 340, gap: 8 },
  errorTitle: {
    fontSize: 20,
    fontFamily: fontFamily.bold,
    color: colors.navy,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  errorSub: {
    fontSize: 15,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
  },
  loadingHint: {
    fontFamily: fontFamily.medium,
    fontSize: 15,
    color: colors.textMuted,
  },
  retryBtn: {
    marginTop: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: radii.pill,
    backgroundColor: colors.brand,
  },
  retryText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    color: colors.white,
  },
});

