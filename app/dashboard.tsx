import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshScreenIntro, GshSectionTitle } from "@/components/gsh-ui-kit";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { fetchCandidateDashboard } from "@/lib/api-client";
import { cardCuratedSurfaceStyle, cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";
import type { DashboardChartPoint } from "@/types/models";

type IonName = ComponentProps<typeof Ionicons>["name"];

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
    <View style={[styles.trendCard, cardSurfaceStyle(false)]}>
      <View style={styles.trendHead}>
        <Text style={styles.trendTitle}>Activity</Text>
        <Text style={styles.trendSub}>Last {rows.length} months · stacked by type</Text>
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

function StatBox({
  label,
  value,
  icon,
  tint,
  onPress,
}: {
  label: string;
  value: number;
  icon: IonName;
  tint: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.statBox, { backgroundColor: tint }, pressed && styles.statBoxPressed]}
      onPress={onPress}
      accessibilityRole="button"
    >
      <View style={styles.statIconWrap}>
        <Ionicons name={icon} size={20} color={colors.navy} />
      </View>
      <Text style={styles.statVal}>{value}</Text>
      <Text style={styles.statLab}>{label}</Text>
    </Pressable>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const q = useQuery({ queryKey: ["analytics", "candidate-dashboard"], queryFn: fetchCandidateDashboard });

  const onRefresh = useCallback(() => void q.refetch(), [q]);

  if (q.isLoading && !q.data) {
    return (
      <GshScreenBackground>
        <SafeAreaView style={styles.safe} edges={["bottom"]}>
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.brand} accessibilityLabel="Loading dashboard" />
            <Text style={styles.loadingHint}>Loading your dashboard…</Text>
          </View>
        </SafeAreaView>
      </GshScreenBackground>
    );
  }

  if (q.isError || !q.data) {
    return (
      <GshScreenBackground>
        <SafeAreaView style={styles.safe} edges={["bottom"]}>
          <ScrollView contentContainerStyle={styles.centerPad} refreshControl={<RefreshControl refreshing={q.isFetching} onRefresh={onRefresh} />}>
            <View
              accessible
              accessibilityRole="alert"
              accessibilityLabel="Dashboard unavailable. Pull down to retry when you are back online."
              style={styles.errorAnnounce}
            >
              <Ionicons name="stats-chart-outline" size={48} color={colors.borderStrong} importantForAccessibility="no" />
              <GshScreenIntro title="Dashboard unavailable" subtitle="Pull down to retry when you are back online." style={{ marginBottom: 0 }} />
            </View>
            <LinearGradient colors={[colors.teal, colors.brand]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.errorAccent} />
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
        </SafeAreaView>
      </GshScreenBackground>
    );
  }

  const d = q.data;
  const pct = d.profile.completionPercentage;
  const savedCount = d.savedJobs?.length ?? 0;
  const chartSlice = d.chartData.slice(-6);
  const recentSlice = d.recentApplications.slice(0, 8);

  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <ScrollView
          contentContainerStyle={styles.pad}
          refreshControl={<RefreshControl refreshing={q.isFetching} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
        >
          <GshScreenIntro
            eyebrow="Your hub"
            title="Dashboard"
            subtitle="Applications, interviews, and fresh roles — at a glance."
            style={{ marginBottom: 12 }}
          />
          <LinearGradient colors={[colors.teal, colors.brand]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.accentBar} />

          <LinearGradient
            colors={["#f5f3ff", "#ffffff"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileShell}
          >
            <View style={styles.profileTop}>
              <View style={styles.profileCopy}>
                <Text style={styles.profileEyebrow}>Profile strength</Text>
                <Text style={styles.big}>{pct}%</Text>
                <Text style={styles.muted}>{d.profile.isComplete ? "Looking strong — keep it updated" : "Finish key fields to stand out to employers"}</Text>
              </View>
              <View style={styles.profileRing}>
                <Ionicons name="person-circle-outline" size={44} color={colors.brand} />
              </View>
            </View>
            <View style={styles.progOuter}>
              <LinearGradient
                colors={[colors.teal, colors.brand]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={[styles.progInner, { width: `${Math.min(100, Math.max(0, pct))}%` }]}
              />
            </View>
            <Pressable style={styles.linkBtn} onPress={() => router.push("/(tabs)/profile")} accessibilityRole="button">
              <Text style={styles.linkBtnText}>Edit profile</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.brand} />
            </Pressable>
          </LinearGradient>

          <View style={styles.statsRow}>
            <StatBox
              label="Applied"
              value={d.stats.totalApplied}
              icon="paper-plane-outline"
              tint="rgba(14, 205, 209, 0.14)"
              onPress={() => router.push("/(tabs)/applications")}
            />
            <StatBox
              label="Saved"
              value={savedCount}
              icon="bookmark-outline"
              tint="rgba(97, 10, 144, 0.1)"
              onPress={() => router.push("/(tabs)/saved")}
            />
            <StatBox
              label="Interviews"
              value={d.stats.interviews}
              icon="calendar-outline"
              tint="rgba(14, 205, 209, 0.1)"
              onPress={() => router.push("/(tabs)/applications")}
            />
            <StatBox
              label="Responses"
              value={d.stats.responses}
              icon="mail-unread-outline"
              tint="rgba(148, 163, 184, 0.22)"
              onPress={() => router.push("/(tabs)/applications")}
            />
          </View>

          <GshSectionTitle
            title="Applications trend"
            hint="Volume by month — purple is applications, teal is interviews."
            topSpacing="lg"
          />
          <ApplicationsTrendChart rows={chartSlice} />

          <GshSectionTitle
            title="Fresh direct listings"
            hint="Employer-posted roles on Global Sponsor Hub from the last week."
            actionLabel="Browse jobs"
            onAction={() => router.push("/(tabs)")}
          />
          {d.latestJobs.slice(0, 8).map((job) => (
            <Pressable
              key={job._id}
              style={[styles.jobCard, cardSurfaceStyle(true)]}
              onPress={() => router.push(`/job/${job._id}`)}
              accessibilityRole="button"
            >
              <View style={styles.jobAccentTeal} />
              <View style={styles.jobCardBody}>
                <View style={styles.jobCardTop}>
                  <Text style={styles.listTitle} numberOfLines={2}>
                    {job.title}
                  </Text>
                  <View style={styles.kindPillHub}>
                    <Text style={styles.kindPillHubText}>Hub</Text>
                  </View>
                </View>
                <Text style={styles.listSub} numberOfLines={2}>
                  {job.companyName}
                  {(job.location || job.locationCity) && ` · ${[job.locationCity, job.location].filter(Boolean).join(" · ")}`}
                </Text>
                <View style={styles.jobCardFooter}>
                  <Text style={styles.jobCardCta}>View role</Text>
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </View>
              </View>
            </Pressable>
          ))}

          {d.latestCuratedExternal && d.latestCuratedExternal.length > 0 ? (
            <>
              <GshSectionTitle
                title="Curated listings"
                hint={
                  typeof d.stats.curatedRolesPublished === "number"
                    ? `Partner and wider-web catalogue — ${d.stats.curatedRolesPublished} live on the public hub.`
                    : "Partner and wider-web catalogue — apply on external sites."
                }
                actionLabel="See all"
                onAction={() => router.push("/curated-listings")}
              />
              {d.latestCuratedExternal.map((job) => (
                <Pressable
                  key={job._id}
                  style={[styles.jobCard, cardCuratedSurfaceStyle(true)]}
                  onPress={() => router.push(`/external-job/${job._id}`)}
                  accessibilityRole="button"
                >
                  <View style={styles.jobAccentPurple} />
                  <View style={styles.jobCardBody}>
                    <View style={styles.jobCardTop}>
                      <Text style={styles.listTitle} numberOfLines={2}>
                        {job.title}
                      </Text>
                      <View style={styles.kindPillCurated}>
                        <Text style={styles.kindPillCuratedText}>Curated</Text>
                      </View>
                    </View>
                    <Text style={styles.listSub} numberOfLines={3}>
                      {job.companyName}
                      {(job.location || job.country) && ` · ${[job.location, job.country].filter(Boolean).join(" · ")}`}
                      {job.sponsorshipAvailable ? " · Sponsorship noted" : ""}
                    </Text>
                    <View style={styles.jobCardFooter}>
                      <Text style={styles.jobCardCtaExternal}>Open listing</Text>
                      <Ionicons name="open-outline" size={18} color={colors.textMuted} />
                    </View>
                  </View>
                </Pressable>
              ))}
            </>
          ) : null}

          <GshSectionTitle
            title="Recent applications"
            hint="Latest updates from your applications tab."
            actionLabel="Open"
            onAction={() => router.push("/(tabs)/applications")}
          />
          {recentSlice.map((a, i) => (
            <View key={`${a.jobTitle}-${i}`} style={[styles.timelineRow, cardSurfaceStyle(false)]}>
              <View style={styles.timelineRail}>
                <View style={styles.timelineDot} />
                {i < recentSlice.length - 1 ? <View style={styles.timelineLine} /> : null}
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.listTitle} numberOfLines={2}>
                  {a.jobTitle}
                </Text>
                <Text style={styles.listSub} numberOfLines={2}>
                  {a.companyName} · <Text style={styles.statusEm}>{a.status}</Text> · {new Date(a.appliedAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
          ))}

          <Pressable style={styles.learnCta} onPress={() => router.push("/tools-resources")} accessibilityRole="button">
            <LinearGradient colors={["rgba(97,10,144,0.12)", "rgba(14,205,209,0.12)"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.learnCtaGrad}>
              <View style={styles.learnCtaInner}>
                <Ionicons name="compass" size={26} color={colors.navy} />
                <View style={styles.learnCtaTextCol}>
                  <Text style={styles.learnCtaTitle}>Guides & resources</Text>
                  <Text style={styles.learnCtaSub}>Visa planning, career tools, and reading — in one place.</Text>
                </View>
                <Ionicons name="chevron-forward" size={22} color={colors.navy} />
              </View>
            </LinearGradient>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </GshScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, gap: 12 },
  centerPad: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 16,
  },
  errorAnnounce: { alignItems: "center", maxWidth: 340, gap: 4 },
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
  pad: { padding: 16, paddingBottom: 48 },
  accentBar: { height: 4, borderRadius: 2, marginBottom: 16 },
  profileShell: {
    padding: 20,
    marginBottom: 16,
    borderRadius: radii.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.92)",
    ...(Platform.OS === "android"
      ? { elevation: 5 }
      : {
          shadowColor: colors.purple,
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.14,
          shadowRadius: 16,
        }),
  },
  profileTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 },
  profileCopy: { flex: 1, minWidth: 0 },
  profileEyebrow: {
    fontSize: 12,
    fontFamily: fontFamily.semiBold,
    color: colors.textSecondary,
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  profileRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(97, 10, 144, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  big: { fontSize: 38, fontFamily: fontFamily.extraBold, color: colors.brand, marginTop: 2, letterSpacing: -1 },
  muted: { fontSize: 14, fontFamily: fontFamily.regular, color: colors.textMuted, marginTop: 6, lineHeight: 20 },
  progOuter: {
    marginTop: 16,
    height: 10,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  progInner: { height: "100%", borderRadius: radii.pill },
  linkBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  linkBtnText: { color: colors.brand, fontFamily: fontFamily.semiBold, fontSize: 15 },
  statsRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 8 },
  statBox: {
    width: "47%",
    flexGrow: 1,
    minWidth: "42%",
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: "flex-start",
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.85)",
  },
  statBoxPressed: { opacity: 0.88, transform: [{ scale: 0.99 }] },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    backgroundColor: "rgba(255,255,255,0.65)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
  },
  statVal: { fontSize: 24, fontFamily: fontFamily.extraBold, color: colors.navy, letterSpacing: -0.5 },
  statLab: { fontSize: 12, fontFamily: fontFamily.semiBold, color: colors.textSecondary, marginTop: 4 },
  trendCard: {
    padding: 16,
    borderRadius: radii.lg,
    marginBottom: 8,
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
  jobCard: {
    flexDirection: "row",
    marginBottom: 10,
    borderRadius: radii.lg,
    overflow: "hidden",
    alignItems: "stretch",
  },
  jobAccentTeal: { width: 5, backgroundColor: colors.teal },
  jobAccentPurple: { width: 5, backgroundColor: colors.purple },
  jobCardBody: { flex: 1, paddingVertical: 12, paddingHorizontal: 14, paddingLeft: 12 },
  jobCardTop: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  kindPillHub: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  kindPillHubText: { fontSize: 10, fontFamily: fontFamily.semiBold, color: colors.textSecondary },
  kindPillCurated: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  kindPillCuratedText: { fontSize: 10, fontFamily: fontFamily.semiBold, color: colors.textSecondary },
  listTitle: { flex: 1, fontSize: 15, fontFamily: fontFamily.bold, color: colors.navy, letterSpacing: -0.2 },
  listSub: { fontSize: 14, fontFamily: fontFamily.regular, color: colors.textMuted, marginTop: 6, lineHeight: 20 },
  jobCardFooter: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
  },
  jobCardCta: { fontSize: 12, fontFamily: fontFamily.semiBold, color: colors.textSecondary },
  jobCardCtaExternal: { fontSize: 12, fontFamily: fontFamily.semiBold, color: colors.textSecondary },
  timelineRow: {
    flexDirection: "row",
    marginBottom: 10,
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
  learnCta: { marginTop: 20, borderRadius: radii.lg, overflow: "hidden" },
  learnCtaGrad: { borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border },
  learnCtaInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  learnCtaTextCol: { flex: 1 },
  learnCtaTitle: { fontSize: 16, fontFamily: fontFamily.bold, color: colors.navy, letterSpacing: -0.2 },
  learnCtaSub: { marginTop: 4, fontSize: 13, fontFamily: fontFamily.regular, color: colors.textMuted, lineHeight: 18 },
});
