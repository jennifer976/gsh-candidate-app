import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  InteractionManager,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CuratedExternalJobCard } from "@/components/CuratedExternalJobCard";
import { DashboardHubJobPreview } from "@/components/DashboardHubJobPreview";
import { GshDarkFeedHeading } from "@/components/GshDarkFeedHeading";
import { GshTabHeroHeader } from "@/components/GshTabHeroHeader";
import { GshActionChip } from "@/components/GshActionChip";
import { GshEmptyState } from "@/components/GshEmptyState";
import { GshGradientPrimaryButton } from "@/components/GshGradientPrimaryButton";
import { GshLinkRow } from "@/components/gsh-ui-kit";
import { GshScreenShell } from "@/components/GshScreenShell";
import { fetchCandidateDashboard, fetchConversations, fetchOwnProfile } from "@/lib/api-client";
import { presentApiError } from "@/lib/api-error";
import { hapticLight } from "@/lib/haptics";
import { FEED_ITEM_GAP, FEED_SECTION_GAP } from "@/lib/screen-layout";
import { colors, feedCardStyle, fontFamily, radii } from "@/lib/theme";

const FEATURE_TOOLS = [
  { label: "Directory", icon: "people-outline" as const, href: "/partners" },
  { label: "Expert insights", icon: "school-outline" as const, href: "/expert-insights" },
  { label: "ATS check", icon: "document-text-outline" as const, href: "/ats-assistant" },
  { label: "Visa wizard", icon: "sparkles-outline" as const, href: "/visa-wizard" },
] as const;
import type { DashboardChartPoint, ExternalJobListingPublic } from "@/types/models";

function shortMonth(label: string): string {
  const t = label.trim();
  if (t.length <= 4) return t;
  const parts = t.split(/[\s/-]/);
  const first = parts[0] ?? t;
  return first.length > 4 ? first.slice(0, 3) : first;
}

function ApplicationsTrendChart({ rows }: { rows: DashboardChartPoint[] }) {
  const totals = useMemo(() => rows.map((r) => r.applications + r.interviews + r.responses), [rows]);
  const maxTotal = Math.max(1, ...totals);
  const trackH = 120;

  return (
    <View style={[styles.trendCard, feedCardStyle()]}>
      <View style={styles.trendHead}>
        <Text style={styles.trendTitle}>Activity</Text>
        <Text style={styles.trendSub}>Last {rows.length} months</Text>
      </View>
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.brand }]} />
          <Text style={styles.legendText}>Applied</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.teal }]} />
          <Text style={styles.legendText}>Interviews</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.borderStrong }]} />
          <Text style={styles.legendText}>Responses</Text>
        </View>
      </View>
      <View style={styles.trendBarsRow}>
        {rows.map((row) => {
          const total = row.applications + row.interviews + row.responses;
          const colH = total === 0 ? 4 : Math.max(14, (total / maxTotal) * trackH);
          const hResp = total ? (row.responses / total) * colH : 0;
          const hInt = total ? (row.interviews / total) * colH : 0;
          const hApp = total ? (row.applications / total) * colH : 0;
          return (
            <View key={row.month} style={styles.trendCol}>
              <View style={[styles.trendTrack, { height: trackH }]}>
                <View style={[styles.trendStack, { height: colH }]}>
                  {hResp > 0 ? (
                    <View style={[styles.trendSeg, { height: hResp, backgroundColor: colors.borderStrong }]} />
                  ) : null}
                  {hInt > 0 ? (
                    <View style={[styles.trendSeg, { height: hInt, backgroundColor: colors.teal }]} />
                  ) : null}
                  {hApp > 0 ? (
                    <View style={[styles.trendSeg, { height: hApp, backgroundColor: colors.brand }]} />
                  ) : null}
                </View>
              </View>
              <Text style={styles.trendMonth} numberOfLines={1}>
                {shortMonth(row.month)}
              </Text>
              <Text style={styles.trendMicro} numberOfLines={1}>
                {total}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activityOpen, setActivityOpen] = useState(false);
  const [activityReady, setActivityReady] = useState(false);

  useEffect(() => {
    if (!activityOpen) {
      setActivityReady(false);
      return;
    }
    const task = InteractionManager.runAfterInteractions(() => setActivityReady(true));
    return () => task.cancel();
  }, [activityOpen]);

  const q = useQuery({ queryKey: ["analytics", "candidate-dashboard"], queryFn: fetchCandidateDashboard });
  const profileQuery = useQuery({ queryKey: ["profile", "me"], queryFn: fetchOwnProfile, staleTime: 45_000 });
  const conversationsQuery = useQuery({
    queryKey: ["message-conversations"],
    queryFn: fetchConversations,
    staleTime: 60_000,
  });

  const firstName =
    profileQuery.data && typeof (profileQuery.data as { firstName?: unknown }).firstName === "string"
      ? String((profileQuery.data as { firstName: string }).firstName)
      : "";

  const onRefresh = useCallback(() => {
    void q.refetch();
    void profileQuery.refetch();
  }, [q, profileQuery]);

  if (q.isLoading && !q.data) {
    return (
      <GshScreenShell>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.brand} accessibilityLabel="Loading home" />
          <Text style={styles.loadingHint}>Loading your hub…</Text>
        </View>
      </GshScreenShell>
    );
  }

  if (q.isError || !q.data) {
    const errCopy = presentApiError(q.error);
    return (
      <GshScreenShell>
        <ScrollView contentContainerStyle={styles.centerPad} refreshControl={<RefreshControl refreshing={q.isFetching} onRefresh={onRefresh} tintColor={colors.white} />}>
            <View
              accessible
              accessibilityRole="alert"
              accessibilityLabel={`${errCopy.title}. ${errCopy.subtitle}`}
              style={styles.errorAnnounce}
            >
              <Ionicons name="stats-chart-outline" size={48} color={colors.teal} importantForAccessibility="no" />
              <Text style={styles.errorTitle}>{errCopy.title}</Text>
              <Text style={styles.errorSub}>{errCopy.subtitle}</Text>
            </View>
            <View style={[styles.errorAccent, { backgroundColor: colors.brand }]} />
            <Pressable
              style={styles.retryBtn}
              onPress={() => void q.refetch()}
              accessibilityRole="button"
              accessibilityLabel="Try again"
              accessibilityHint="Reloads your dashboard from the server"
            >
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          </ScrollView>
      </GshScreenShell>
    );
  }

  const d = q.data;
  const pct = d.profile.completionPercentage;
  const chartSlice = (d.chartData ?? []).slice(-6);
  const recentSlice = (d.recentApplications ?? []).slice(0, 8);
  const savedJobRows = (d.savedJobs ?? []).filter(
    (job): job is NonNullable<typeof job> => Boolean(job && typeof job === "object" && job._id)
  );
  const savedCount = savedJobRows.length;

  const greeting = firstName ? `Hello, ${firstName}` : "Hello";
  const chatCount = conversationsQuery.data?.length ?? 0;
  const chartHasData = chartSlice.some((r) => r.applications + r.interviews + r.responses > 0);
  const latestJobCount = (d.latestJobs ?? []).length;
  const curatedCount = d.latestCuratedExternal?.length ?? 0;
  const hasActivity =
    chartHasData || savedCount > 0 || recentSlice.length > 0 || latestJobCount > 0 || curatedCount > 0;
  const isNewUser = d.stats.totalApplied === 0 && savedCount === 0 && !hasActivity;

  return (
    <GshScreenShell>
      <ScrollView
        contentContainerStyle={styles.scrollPad}
        refreshControl={<RefreshControl refreshing={q.isFetching} onRefresh={onRefresh} tintColor={colors.white} />}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        <GshTabHeroHeader paddingTop={Math.max(insets.top, 20) + 8} tagline="Sponsored roles with visa support">
          <Text style={styles.heroTitle}>{greeting}</Text>
        </GshTabHeroHeader>

        <View style={styles.actionBand}>
          <GshGradientPrimaryButton
            title="Search & browse jobs"
            onPress={() => {
              void hapticLight();
              router.push("/(tabs)/jobs");
            }}
            containerStyle={styles.primaryCta}
          />
          <View style={styles.chipRow}>
            <GshActionChip
              label="Saved"
              icon="bookmark-outline"
              count={savedCount}
              onPress={() => router.push("/saved")}
            />
            <GshActionChip
              label="Applied"
              icon="paper-plane-outline"
              count={d.stats.totalApplied}
              onPress={() => router.push("/(tabs)/applications")}
            />
            <GshActionChip
              label="Chats"
              icon="chatbubbles-outline"
              count={chatCount}
              onPress={() => router.push("/(tabs)/messages")}
            />
          </View>
          <Text style={styles.featuresLabel}>Key tools</Text>
          <View style={styles.featureRow}>
            {FEATURE_TOOLS.map((tool) => (
              <Pressable
                key={tool.label}
                style={styles.featureChip}
                onPress={() => {
                  void hapticLight();
                  router.push(tool.href);
                }}
                accessibilityRole="button"
              >
                <Ionicons name={tool.icon} size={17} color={colors.brandDeep} />
                <Text style={styles.featureChipText}>{tool.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.bodyPad}>
          {pct < 100 ? (
            <Pressable
              style={[styles.profileNudge, feedCardStyle()]}
              onPress={() => router.push("/(tabs)/profile")}
              accessibilityRole="button"
            >
              <View style={styles.profileNudgeLeft}>
                <Text style={styles.profileNudgeTitle}>Complete your profile</Text>
                <Text style={styles.profileNudgeSub}>{pct}% done · helps employers find you</Text>
              </View>
              <View style={styles.profileNudgeRing}>
                <Text style={styles.profileNudgePct}>{pct}%</Text>
              </View>
            </Pressable>
          ) : null}

          {isNewUser ? (
            <GshEmptyState
              icon="compass-outline"
              title="No activity yet — start by browsing sponsored roles."
              actionLabel="Browse jobs"
              onAction={() => router.push("/(tabs)/jobs")}
            />
          ) : null}

          <Pressable
            style={[styles.activityToggle, feedCardStyle()]}
            onPress={() => {
              void hapticLight();
              setActivityOpen((v) => !v);
            }}
            accessibilityRole="button"
            accessibilityState={{ expanded: activityOpen }}
          >
            <View style={styles.activityToggleText}>
              <Text style={styles.activityToggleTitle}>Activity & updates</Text>
              <Text style={styles.activityToggleSub}>
                {hasActivity ? "Trends, saved roles, listings, applications" : "Nothing to show yet"}
              </Text>
            </View>
            <Ionicons name={activityOpen ? "chevron-up" : "chevron-down"} size={22} color={colors.textMuted} />
          </Pressable>

          {activityOpen && hasActivity && !activityReady ? (
            <View style={styles.activityLoading}>
              <ActivityIndicator color={colors.brand} accessibilityLabel="Loading activity" />
            </View>
          ) : null}

          {activityOpen && hasActivity && activityReady ? (
            <View style={styles.activityPanel}>
              {chartHasData ? (
                <View style={styles.activitySection}>
                  <GshDarkFeedHeading inFeedGroup title="Applications trend" />
                  <ApplicationsTrendChart rows={chartSlice} />
                </View>
              ) : null}

              {savedCount > 0 ? (
                <View style={styles.activitySection}>
                  <GshDarkFeedHeading
                    inFeedGroup
                    title="Saved roles"
                    actionLabel="See all"
                    onAction={() => router.push("/saved")}
                  />
                  <View style={styles.savedGrid}>
                    {savedJobRows.slice(0, 6).map((job) => (
                      <Pressable
                        key={job._id}
                        style={[styles.savedCard, feedCardStyle()]}
                        onPress={() => router.push(`/job/${job._id}`)}
                        accessibilityRole="button"
                      >
                        <Text style={styles.savedTitle} numberOfLines={2}>{job.title}</Text>
                        <Text style={styles.savedSub} numberOfLines={1}>{job.companyName}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ) : null}

              {latestJobCount > 0 ? (
                <View style={styles.activitySection}>
                  <GshDarkFeedHeading
                    inFeedGroup
                    title="New listings"
                    actionLabel="Browse all"
                    onAction={() => router.push("/(tabs)/jobs")}
                  />
                  <View style={styles.feedCardStack}>
                    {(d.latestJobs ?? []).slice(0, 4).map((job) => (
                      <DashboardHubJobPreview key={job._id} job={job} onPress={() => router.push(`/job/${job._id}`)} />
                    ))}
                  </View>
                </View>
              ) : null}

              {curatedCount > 0 ? (
                <View style={styles.activitySection}>
                  <GshDarkFeedHeading
                    inFeedGroup
                    title="Curated picks"
                    actionLabel="See all"
                    onAction={() => router.push("/curated-listings")}
                  />
                  <View style={styles.feedCardStack}>
                    {d.latestCuratedExternal!.slice(0, 3).map((job) => (
                      <CuratedExternalJobCard
                        key={job._id}
                        job={job as ExternalJobListingPublic}
                        onPress={() => router.push(`/external-job/${job._id}`)}
                      />
                    ))}
                  </View>
                </View>
              ) : null}

              {recentSlice.length > 0 ? (
                <View style={styles.activitySection}>
                  <GshDarkFeedHeading
                    inFeedGroup
                    title="Recent applications"
                    actionLabel="Open"
                    onAction={() => router.push("/(tabs)/applications")}
                  />
                  <View style={styles.feedCardStack}>
                  {recentSlice.slice(0, 5).map((a, i) => (
                    <View key={`${a.jobTitle}-${i}`} style={[styles.timelineRow, feedCardStyle()]}>
                      <View style={styles.timelineRail}>
                        <View style={styles.timelineDot} />
                        {i < Math.min(recentSlice.length, 5) - 1 ? <View style={styles.timelineLine} /> : null}
                      </View>
                      <View style={styles.timelineContent}>
                        <Text style={styles.listTitle} numberOfLines={2}>{a.jobTitle}</Text>
                        <Text style={styles.listSub} numberOfLines={2}>
                          {a.companyName} · <Text style={styles.statusEm}>{a.status}</Text>
                        </Text>
                      </View>
                    </View>
                  ))}
                  </View>
                </View>
              ) : null}
            </View>
          ) : null}

          <GshLinkRow
            title="Guides & tools"
            subtitle="Expert insights · visa wizard · ATS check"
            icon="layers-outline"
            accent="purple"
            onPress={() => router.push("/tools-resources")}
          />
        </View>
      </ScrollView>
    </GshScreenShell>
  );
}

const styles = StyleSheet.create({
  scrollPad: { paddingBottom: 48 },
  bodyPad: {
    paddingHorizontal: 16,
    paddingTop: FEED_SECTION_GAP,
    paddingBottom: 4,
    gap: FEED_SECTION_GAP,
  },
  heroTitle: {
    fontSize: 26,
    fontFamily: fontFamily.extraBold,
    color: colors.white,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  actionBand: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 14,
  },
  primaryCta: { marginBottom: 0 },
  chipRow: { flexDirection: "row", gap: 8 },
  featuresLabel: {
    fontSize: 11,
    fontFamily: fontFamily.semiBold,
    color: colors.textMuted,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginTop: 2,
  },
  featureRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  featureChip: {
    width: "48%",
    flexGrow: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featureChipText: { fontSize: 11, fontFamily: fontFamily.semiBold, color: colors.navy },
  profileNudge: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  profileNudgeLeft: { flex: 1, minWidth: 0 },
  profileNudgeTitle: { fontSize: 15, fontFamily: fontFamily.bold, color: colors.navy },
  profileNudgeSub: { marginTop: 4, fontSize: 13, fontFamily: fontFamily.regular, color: colors.textMuted },
  profileNudgeRing: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brandSoft,
  },
  profileNudgePct: { fontSize: 12, fontFamily: fontFamily.bold, color: colors.brandDeep },
  activityToggle: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  activityToggleText: { flex: 1, minWidth: 0 },
  activityToggleTitle: { fontSize: 16, fontFamily: fontFamily.bold, color: colors.navy },
  activityToggleSub: { marginTop: 4, fontSize: 13, fontFamily: fontFamily.regular, color: colors.textMuted },
  activityLoading: { paddingVertical: 24, alignItems: "center" },
  activityPanel: { gap: FEED_SECTION_GAP },
  activitySection: { gap: FEED_ITEM_GAP },
  feedCardStack: { gap: FEED_ITEM_GAP },
  savedGrid: { flexDirection: "row", flexWrap: "wrap", gap: FEED_ITEM_GAP },
  savedCard: { width: "48%", minWidth: 140, flexGrow: 1, padding: 14 },
  savedTitle: { fontSize: 14, fontFamily: fontFamily.bold, color: colors.navy },
  savedSub: { marginTop: 4, fontSize: 12, fontFamily: fontFamily.regular, color: colors.textMuted },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, gap: 12 },
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
    color: colors.white,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  errorSub: {
    fontSize: 15,
    fontFamily: fontFamily.regular,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    lineHeight: 22,
  },
  errorAccent: { width: "100%", maxWidth: 280, height: 4, borderRadius: 2, marginTop: 4, marginBottom: 4 },
  loadingHint: { fontFamily: fontFamily.medium, fontSize: 15, color: colors.textMuted },
  retryBtn: {
    marginTop: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: radii.md,
    backgroundColor: colors.brand,
  },
  retryText: { fontFamily: fontFamily.semiBold, fontSize: 15, color: colors.white },
  trendCard: {
    padding: 16,
    borderRadius: radii.lg,
  },
  trendHead: { marginBottom: 12 },
  trendTitle: { fontSize: 15, fontFamily: fontFamily.bold, color: colors.navy },
  trendSub: { marginTop: 4, fontSize: 13, fontFamily: fontFamily.regular, color: colors.textMuted },
  legendRow: { flexDirection: "row", flexWrap: "wrap", gap: 14, marginBottom: 14 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12, fontFamily: fontFamily.medium, color: colors.textSecondary },
  trendBarsRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", paddingHorizontal: 4 },
  trendCol: { alignItems: "center", width: 36 },
  trendTrack: { justifyContent: "flex-end", alignItems: "center", width: 32 },
  trendStack: {
    width: 28,
    borderRadius: radii.sm,
    overflow: "hidden",
    justifyContent: "flex-end",
    flexDirection: "column-reverse",
  },
  trendSeg: { width: "100%" },
  trendMonth: { marginTop: 10, fontSize: 11, fontFamily: fontFamily.semiBold, color: colors.textSecondary, maxWidth: 40, textAlign: "center" },
  trendMicro: { marginTop: 2, fontSize: 10, fontFamily: fontFamily.medium, color: colors.textMuted },
  listTitle: { flex: 1, fontSize: 15, fontFamily: fontFamily.bold, color: colors.navy, letterSpacing: -0.2 },
  listSub: { fontSize: 14, fontFamily: fontFamily.regular, color: colors.textMuted, marginTop: 6, lineHeight: 20 },
  timelineRow: {
    flexDirection: "row",
    borderRadius: radii.lg,
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
    alignItems: "stretch",
  },
  timelineRail: { width: 18, alignItems: "center", alignSelf: "stretch" },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.brand,
    borderWidth: 2,
    borderColor: colors.white,
    marginTop: 4,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    marginTop: 4,
    minHeight: 28,
    backgroundColor: colors.border,
    borderRadius: 1,
  },
  timelineContent: { flex: 1, minWidth: 0 },
  statusEm: { fontFamily: fontFamily.semiBold, color: colors.textSecondary },
});
