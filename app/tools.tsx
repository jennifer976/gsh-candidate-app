import { useQuery } from "@tanstack/react-query";
import * as Linking from "expo-linking";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchCandidateDashboard } from "@/lib/api-client";
import { getMarketingSiteUrl } from "@/lib/config";
import { colors, gradient } from "@/lib/theme";

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

        <Pressable style={styles.primaryBtnOuter} onPress={() => router.push("/ats-assistant")}>
          <LinearGradient colors={[...gradient.authCTA]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primaryBtn}>
            <Text style={styles.primaryBtnText}>ATS match assistant</Text>
            <Text style={styles.primarySub}>Paste your CV text & a job description</Text>
          </LinearGradient>
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
  safe: { flex: 1, backgroundColor: colors.surfaceMuted },
  pad: { padding: 16, paddingBottom: 40 },
  h1: { fontSize: 24, fontWeight: "800", color: colors.textPrimary, marginBottom: 8 },
  lead: { fontSize: 14, color: colors.textMuted, marginBottom: 16, lineHeight: 20 },
  scoreCard: {
    backgroundColor: colors.background,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  scoreLabel: { fontSize: 12, fontWeight: "700", color: colors.textMuted, textTransform: "uppercase" },
  scoreVal: { fontSize: 36, fontWeight: "800", color: colors.accent, marginTop: 4 },
  link: { marginTop: 10, color: colors.brand, fontWeight: "700", fontSize: 15 },
  section: { fontSize: 17, fontWeight: "700", color: colors.textPrimary, marginBottom: 10 },
  tip: { flexDirection: "row", gap: 8, marginBottom: 10, paddingRight: 8 },
  bullet: { fontSize: 16, color: colors.accent, fontWeight: "800" },
  tipText: { flex: 1, fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  primaryBtnOuter: { marginTop: 12, borderRadius: 14, overflow: "hidden" },
  primaryBtn: {
    borderRadius: 14,
    padding: 16,
  },
  primaryBtnText: { color: colors.white, fontWeight: "800", fontSize: 17 },
  primarySub: { color: "rgba(255,255,255,0.88)", fontSize: 13, marginTop: 6 },
  outlineBtn: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    backgroundColor: colors.background,
  },
  outlineBtnText: { color: colors.textPrimary, fontWeight: "700", fontSize: 15 },
});
