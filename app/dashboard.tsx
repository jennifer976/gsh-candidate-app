import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { fetchCandidateDashboard } from "@/lib/api-client";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";

export default function DashboardScreen() {
  const router = useRouter();
  const q = useQuery({ queryKey: ["analytics", "candidate-dashboard"], queryFn: fetchCandidateDashboard });

  const onRefresh = useCallback(() => void q.refetch(), [q]);

  if (q.isLoading && !q.data) {
    return (
      <GshScreenBackground>
        <SafeAreaView style={styles.safe} edges={["bottom"]}>
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.brand} />
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
            <Ionicons name="stats-chart-outline" size={48} color={colors.borderStrong} />
            <Text style={styles.errTitle}>Dashboard unavailable</Text>
            <Text style={styles.errSub}>Pull down to retry when you are back online.</Text>
            <Pressable style={styles.retryBtn} onPress={() => void q.refetch()} accessibilityRole="button">
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

  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <ScrollView
          contentContainerStyle={styles.pad}
          refreshControl={<RefreshControl refreshing={q.isFetching} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.h1}>Dashboard</Text>
          <Text style={styles.lead}>Track applications, interviews, and fresh roles in one place.</Text>

          <View style={[styles.card, cardSurfaceStyle(true)]}>
            <Text style={styles.cardLabel}>Profile strength</Text>
            <Text style={styles.big}>{pct}%</Text>
            <Text style={styles.muted}>{d.profile.isComplete ? "Looking strong" : "Keep going — finish key fields"}</Text>
            <Pressable style={styles.linkBtn} onPress={() => router.push("/(tabs)/profile")} accessibilityRole="button">
              <Text style={styles.linkBtnText}>Edit profile →</Text>
            </Pressable>
          </View>

          <View style={styles.statsRow}>
            <StatBox
              label="Applied"
              value={d.stats.totalApplied}
              onPress={() => router.push("/(tabs)/applications")}
            />
            <StatBox label="Saved" value={savedCount} onPress={() => router.push("/(tabs)/saved")} />
            <StatBox label="Interviews" value={d.stats.interviews} onPress={() => router.push("/(tabs)/applications")} />
            <StatBox label="Responses" value={d.stats.responses} onPress={() => router.push("/(tabs)/applications")} />
          </View>

          <Text style={styles.section}>Applications trend</Text>
          {d.chartData.slice(-6).map((row) => (
            <Text key={row.month} style={styles.chartLine}>
              {row.month}: {row.applications} applied · {row.interviews} interviews · {row.responses} responses
            </Text>
          ))}

          <Text style={styles.section}>Fresh hub listings</Text>
          <Text style={styles.sectionHint}>Employer-posted roles on Global Sponsor Hub (last week).</Text>
          {d.latestJobs.slice(0, 8).map((job) => (
            <Pressable
              key={job._id}
              style={[styles.jobPickRow, cardSurfaceStyle(true)]}
              onPress={() => router.push(`/job/${job._id}`)}
              accessibilityRole="button"
            >
              <View style={styles.jobPickText}>
                <Text style={styles.listTitle} numberOfLines={1}>
                  {job.title}
                </Text>
                <Text style={styles.listSub} numberOfLines={1}>
                  {job.companyName} · {job.location || job.locationCity || ""}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.placeholder} />
            </Pressable>
          ))}

          {d.latestCuratedExternal && d.latestCuratedExternal.length > 0 ? (
            <>
              <Text style={styles.section}>Curated external</Text>
              <Text style={styles.sectionHint}>
                Partner-curated & aggregated roles (same board as the Jobs tab).
                {typeof d.stats.curatedRolesPublished === "number"
                  ? ` ${d.stats.curatedRolesPublished} live on the public hub.`
                  : ""}
              </Text>
              {d.latestCuratedExternal.map((job) => (
                <Pressable
                  key={job._id}
                  style={[styles.jobPickRow, cardSurfaceStyle(true)]}
                  onPress={() => router.push(`/external-job/${job._id}`)}
                  accessibilityRole="button"
                >
                  <View style={styles.jobPickText}>
                    <Text style={styles.listTitle} numberOfLines={1}>
                      {job.title}
                    </Text>
                    <Text style={styles.listSub} numberOfLines={2}>
                      {job.companyName}
                      {(job.location || job.country) && ` · ${[job.location, job.country].filter(Boolean).join(" · ")}`}
                      {job.sponsorshipAvailable ? " · Sponsorship noted" : ""}
                    </Text>
                  </View>
                  <Ionicons name="open-outline" size={20} color={colors.teal} />
                </Pressable>
              ))}
            </>
          ) : null}

          <Text style={styles.section}>Recent applications</Text>
          {d.recentApplications.slice(0, 8).map((a, i) => (
            <View key={`${a.jobTitle}-${i}`} style={[styles.listRow, cardSurfaceStyle(false)]}>
              <Text style={styles.listTitle} numberOfLines={1}>
                {a.jobTitle}
              </Text>
              <Text style={styles.listSub} numberOfLines={2}>
                {a.companyName} · {a.status} · {new Date(a.appliedAt).toLocaleDateString()}
              </Text>
            </View>
          ))}

          <Pressable style={styles.learnCta} onPress={() => router.push("/learn")} accessibilityRole="button">
            <Ionicons name="compass-outline" size={22} color={colors.brand} />
            <Text style={styles.learnCtaText}>Guides, blog & resources</Text>
            <Ionicons name="open-outline" size={18} color={colors.placeholder} />
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </GshScreenBackground>
  );
}

function StatBox({ label, value, onPress }: { label: string; value: number; onPress: () => void }) {
  return (
    <Pressable style={[styles.statBox, cardSurfaceStyle(true)]} onPress={onPress} accessibilityRole="button">
      <Text style={styles.statVal}>{value}</Text>
      <Text style={styles.statLab}>{label}</Text>
    </Pressable>
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
    gap: 12,
  },
  loadingHint: { fontFamily: fontFamily.medium, fontSize: 15, color: colors.textMuted },
  errTitle: { fontFamily: fontFamily.bold, fontSize: 18, color: colors.textPrimary, textAlign: "center" },
  errSub: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  retryBtn: {
    marginTop: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: radii.md,
    backgroundColor: colors.brand,
  },
  retryText: { fontFamily: fontFamily.semiBold, fontSize: 15, color: colors.white },
  pad: { padding: 16, paddingBottom: 48 },
  h1: {
    fontSize: 26,
    fontFamily: fontFamily.extraBold,
    color: colors.textPrimary,
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  lead: {
    fontSize: 15,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    lineHeight: 22,
    marginBottom: 16,
  },
  card: {
    padding: 18,
    marginBottom: 14,
  },
  cardLabel: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  big: { fontSize: 36, fontFamily: fontFamily.extraBold, color: colors.brand, marginTop: 4 },
  muted: { fontSize: 14, fontFamily: fontFamily.regular, color: colors.textMuted, marginTop: 4 },
  linkBtn: { alignSelf: "flex-start", marginTop: 14 },
  linkBtnText: { color: colors.brand, fontFamily: fontFamily.semiBold, fontSize: 15 },
  statsRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 18 },
  statBox: {
    width: "47%",
    flexGrow: 1,
    minWidth: "42%",
    padding: 14,
    alignItems: "center",
  },
  statVal: { fontSize: 22, fontFamily: fontFamily.extraBold, color: colors.textPrimary },
  statLab: { fontSize: 11, fontFamily: fontFamily.semiBold, color: colors.textMuted, marginTop: 4, textAlign: "center" },
  section: {
    fontSize: 16,
    fontFamily: fontFamily.bold,
    color: colors.textPrimary,
    marginTop: 18,
    marginBottom: 6,
  },
  sectionHint: {
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: 10,
  },
  chartLine: { fontSize: 13, fontFamily: fontFamily.regular, color: colors.textMarketing, marginBottom: 6 },
  jobPickRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    marginBottom: 8,
  },
  jobPickText: { flex: 1, minWidth: 0 },
  listRow: {
    padding: 14,
    marginBottom: 8,
  },
  listTitle: { fontSize: 15, fontFamily: fontFamily.bold, color: colors.textPrimary },
  listSub: { fontSize: 13, fontFamily: fontFamily.regular, color: colors.textMuted, marginTop: 4 },
  learnCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 24,
    padding: 16,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.purpleBorder,
    backgroundColor: colors.purpleMuted,
  },
  learnCtaText: { flex: 1, fontSize: 15, fontFamily: fontFamily.semiBold, color: colors.purpleTextDark },
});
