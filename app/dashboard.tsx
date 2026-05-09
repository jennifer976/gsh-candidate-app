import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchCandidateDashboard } from "@/lib/api-client";

export default function DashboardScreen() {
  const router = useRouter();
  const q = useQuery({ queryKey: ["analytics", "candidate-dashboard"], queryFn: fetchCandidateDashboard });

  if (q.isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      </SafeAreaView>
    );
  }

  if (q.isError || !q.data) {
    return (
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <Text style={styles.err}>Could not load dashboard.</Text>
      </SafeAreaView>
    );
  }

  const d = q.data;
  const pct = d.profile.completionPercentage;

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.pad}>
        <Text style={styles.h1}>Dashboard</Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Profile</Text>
          <Text style={styles.big}>{pct}%</Text>
          <Text style={styles.muted}>complete</Text>
          <Pressable style={styles.linkBtn} onPress={() => router.push("/(tabs)/profile")}>
            <Text style={styles.linkBtnText}>Edit profile</Text>
          </Pressable>
        </View>

        <View style={styles.statsRow}>
          <StatBox label="Applied" value={d.stats.totalApplied} />
          <StatBox label="Interviews" value={d.stats.interviews} />
          <StatBox label="Responses" value={d.stats.responses} />
        </View>

        <Text style={styles.section}>Applications trend</Text>
        {d.chartData.slice(-6).map((row) => (
          <Text key={row.month} style={styles.chartLine}>
            {row.month}: {row.applications} applied · {row.interviews} interviews · {row.responses} responses
          </Text>
        ))}

        <Text style={styles.section}>Latest listings</Text>
        {d.latestJobs.slice(0, 8).map((job) => (
          <Pressable key={job._id} style={styles.listRow} onPress={() => router.push(`/job/${job._id}`)}>
            <Text style={styles.listTitle} numberOfLines={1}>
              {job.title}
            </Text>
            <Text style={styles.listSub} numberOfLines={1}>
              {job.companyName} · {job.location || job.locationCity || ""}
            </Text>
          </Pressable>
        ))}

        <Text style={styles.section}>Recent activity</Text>
        {d.recentApplications.slice(0, 8).map((a, i) => (
          <View key={`${a.jobTitle}-${i}`} style={styles.listRow}>
            <Text style={styles.listTitle} numberOfLines={1}>
              {a.jobTitle}
            </Text>
            <Text style={styles.listSub} numberOfLines={2}>
              {a.companyName} · {a.status} · {new Date(a.appliedAt).toLocaleDateString()}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statVal}>{value}</Text>
      <Text style={styles.statLab}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f8fafc" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  pad: { padding: 16, paddingBottom: 40 },
  h1: { fontSize: 24, fontWeight: "800", color: "#0f172a", marginBottom: 16 },
  err: { padding: 24, color: "#b91c1c" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 14,
  },
  cardLabel: { fontSize: 12, fontWeight: "700", color: "#64748b", textTransform: "uppercase" },
  big: { fontSize: 36, fontWeight: "800", color: "#4f46e5", marginTop: 4 },
  muted: { fontSize: 14, color: "#64748b", marginTop: 4 },
  linkBtn: { alignSelf: "flex-start", marginTop: 12 },
  linkBtnText: { color: "#4f46e5", fontWeight: "700", fontSize: 15 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 18 },
  statBox: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
  },
  statVal: { fontSize: 22, fontWeight: "800", color: "#0f172a" },
  statLab: { fontSize: 11, color: "#64748b", marginTop: 4, textAlign: "center" },
  section: { fontSize: 16, fontWeight: "700", color: "#0f172a", marginTop: 16, marginBottom: 10 },
  chartLine: { fontSize: 13, color: "#475569", marginBottom: 6 },
  listRow: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  listTitle: { fontSize: 15, fontWeight: "700", color: "#0f172a" },
  listSub: { fontSize: 13, color: "#64748b", marginTop: 4 },
});
