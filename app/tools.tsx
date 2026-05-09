import { useQuery } from "@tanstack/react-query";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchCandidateDashboard } from "@/lib/api-client";
import { getMarketingSiteUrl } from "@/lib/config";

const TIPS = [
  "Lead with measurable outcomes tied to impact.",
  "Mirror sponsor-friendly keywords from target roles — naturally, not stuffed.",
  "Add mobility context (visa needs, notice period, time zones) early.",
  "Export your CV as PDF with selectable text.",
  "Keep LinkedIn dates aligned with your CV.",
];

export default function ToolsScreen() {
  const router = useRouter();
  const dash = useQuery({ queryKey: ["analytics", "candidate-dashboard"], queryFn: fetchCandidateDashboard });
  const pct = dash.data?.profile.completionPercentage ?? null;

  const site = getMarketingSiteUrl();

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.pad}>
        <Text style={styles.h1}>Career toolkit</Text>
        <Text style={styles.lead}>Sharpen your profile and improve ATS alignment.</Text>

        {pct != null ? (
          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>Profile strength</Text>
            <Text style={styles.scoreVal}>{pct}%</Text>
            <Pressable onPress={() => router.push("/(tabs)/profile")}>
              <Text style={styles.link}>Update profile →</Text>
            </Pressable>
          </View>
        ) : null}

        <Text style={styles.section}>Quick tips</Text>
        {TIPS.map((tip) => (
          <View key={tip} style={styles.tip}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}

        <Pressable style={styles.primaryBtn} onPress={() => router.push("/ats-assistant")}>
          <Text style={styles.primaryBtnText}>ATS match assistant</Text>
          <Text style={styles.primarySub}>Paste your CV text & a job description</Text>
        </Pressable>

        <Pressable
          style={styles.outlineBtn}
          onPress={() => void Linking.openURL(`${site}/candidate/tools`)}
        >
          <Text style={styles.outlineBtnText}>Open full toolkit on the web</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f8fafc" },
  pad: { padding: 16, paddingBottom: 40 },
  h1: { fontSize: 24, fontWeight: "800", color: "#0f172a", marginBottom: 8 },
  lead: { fontSize: 14, color: "#64748b", marginBottom: 16, lineHeight: 20 },
  scoreCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 20,
  },
  scoreLabel: { fontSize: 12, fontWeight: "700", color: "#64748b", textTransform: "uppercase" },
  scoreVal: { fontSize: 36, fontWeight: "800", color: "#0d9488", marginTop: 4 },
  link: { marginTop: 10, color: "#4f46e5", fontWeight: "700", fontSize: 15 },
  section: { fontSize: 17, fontWeight: "700", color: "#0f172a", marginBottom: 10 },
  tip: { flexDirection: "row", gap: 8, marginBottom: 10, paddingRight: 8 },
  bullet: { fontSize: 16, color: "#14b8a6", fontWeight: "800" },
  tipText: { flex: 1, fontSize: 14, color: "#475569", lineHeight: 20 },
  primaryBtn: {
    backgroundColor: "#4f46e5",
    borderRadius: 14,
    padding: 16,
    marginTop: 12,
  },
  primaryBtnText: { color: "#fff", fontWeight: "800", fontSize: 17 },
  primarySub: { color: "rgba(255,255,255,0.85)", fontSize: 13, marginTop: 6 },
  outlineBtn: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  outlineBtnText: { color: "#334155", fontWeight: "700", fontSize: 15 },
});
