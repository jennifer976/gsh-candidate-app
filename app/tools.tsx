import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { fetchCandidateDashboard } from "@/lib/api-client";
import { WEB_PORTAL, webPortalRoute } from "@/lib/web-portal-route";
import { cardSurfaceStyle, colors, fontFamily, gradient, radii } from "@/lib/theme";

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

  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
          <Text style={styles.h1}>Career toolkit</Text>
          <Text style={styles.lead}>
            Sponsorship mobility tools, CV alignment, and the same guides as the Global Sponsor Hub website.
          </Text>

          {pct != null ? (
            <View style={[styles.scoreCard, cardSurfaceStyle(true)]}>
              <Text style={styles.scoreLabel}>Profile strength</Text>
              <Text style={styles.scoreVal}>{pct}%</Text>
              <Pressable onPress={() => router.push("/(tabs)/profile")}>
                <Text style={styles.link}>Update profile →</Text>
              </Pressable>
            </View>
          ) : null}

          <Text style={styles.section}>Visa & mobility</Text>
          <Pressable
            style={styles.primaryBtnOuter}
            onPress={() => router.push(webPortalRoute(WEB_PORTAL.visaWizard, "Visa wizard"))}
            accessibilityRole="button"
            accessibilityLabel="Open visa wizard"
          >
            <LinearGradient colors={[...gradient.authCTA]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primaryBtn}>
              <View style={styles.primaryBtnRow}>
                <Ionicons name="sparkles" size={22} color={colors.white} />
                <View style={styles.primaryBtnTextCol}>
                  <Text style={styles.primaryBtnText}>Visa wizard</Text>
                  <Text style={styles.primarySub}>Interactive questionnaire — sponsorship routes & next steps</Text>
                </View>
              </View>
            </LinearGradient>
          </Pressable>

          <Text style={styles.section}>CV & applications</Text>
          <Text style={styles.sectionHint}>Stand out to employers and ATS parsers.</Text>

          <Text style={styles.sectionMuted}>Quick tips</Text>
          {TIPS.map((tip) => (
            <View key={tip} style={styles.tip}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}

          <Pressable
            style={[styles.primaryBtnOuter, styles.atsBtn]}
            onPress={() => router.push("/ats-assistant")}
          >
            <LinearGradient colors={[...gradient.authCTA]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>ATS match assistant</Text>
              <Text style={styles.primarySub}>Paste your CV text & a job description</Text>
            </LinearGradient>
          </Pressable>

          <Pressable style={styles.outlineBtn} onPress={() => router.push("/learn")}>
            <Text style={styles.outlineBtnText}>Guides, blog & resources</Text>
            <Text style={styles.outlineBtnSub}>Visa guides, resource hub, FAQs — same content as the website</Text>
          </Pressable>

          <Pressable
            style={styles.outlineBtn}
            onPress={() => router.push(webPortalRoute(WEB_PORTAL.candidateTools, "Web toolkit"))}
          >
            <Text style={styles.outlineBtnText}>Open full toolkit (web)</Text>
            <Text style={styles.outlineBtnSub}>Runs inside the in-app viewer</Text>
          </Pressable>
      </ScrollView>
    </SafeAreaView>
    </GshScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  pad: { padding: 16, paddingBottom: 40 },
  h1: { fontSize: 26, fontFamily: fontFamily.extraBold, color: colors.textPrimary, marginBottom: 8, letterSpacing: -0.35 },
  lead: { fontSize: 15, fontFamily: fontFamily.regular, color: colors.textMuted, marginBottom: 16, lineHeight: 22 },
  scoreCard: {
    borderRadius: radii.md,
    padding: 16,
    marginBottom: 20,
  },
  scoreLabel: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  scoreVal: { fontSize: 36, fontFamily: fontFamily.extraBold, color: colors.accent, marginTop: 4 },
  link: { marginTop: 10, color: colors.brand, fontFamily: fontFamily.semiBold, fontSize: 15 },
  section: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.75,
    marginTop: 8,
    marginBottom: 10,
  },
  sectionHint: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: colors.textMarketing,
    marginTop: -6,
    marginBottom: 12,
    lineHeight: 20,
  },
  sectionMuted: {
    fontSize: 14,
    fontFamily: fontFamily.semiBold,
    color: colors.textPrimary,
    marginBottom: 10,
  },
  tip: { flexDirection: "row", gap: 8, marginBottom: 10, paddingRight: 8 },
  bullet: { fontSize: 16, color: colors.accent, fontFamily: fontFamily.extraBold },
  tipText: { flex: 1, fontSize: 14, fontFamily: fontFamily.regular, color: colors.textSecondary, lineHeight: 20 },
  primaryBtnOuter: { marginTop: 0, marginBottom: 4, borderRadius: radii.md, overflow: "hidden" },
  atsBtn: { marginTop: 14 },
  primaryBtn: {
    borderRadius: radii.md,
    padding: 16,
  },
  primaryBtnRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  primaryBtnTextCol: { flex: 1 },
  primaryBtnText: { color: colors.white, fontFamily: fontFamily.extraBold, fontSize: 17 },
  primarySub: { color: "rgba(255,255,255,0.88)", fontSize: 13, marginTop: 6, fontFamily: fontFamily.regular, lineHeight: 18 },
  outlineBtn: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radii.md,
    padding: 16,
    alignItems: "center",
    backgroundColor: colors.background,
  },
  outlineBtnText: { color: colors.textPrimary, fontFamily: fontFamily.bold, fontSize: 15 },
  outlineBtnSub: {
    marginTop: 6,
    fontSize: 13,
    color: colors.textMuted,
    fontFamily: fontFamily.regular,
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 8,
  },
});
