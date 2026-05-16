import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshLinkRow, GshScreenIntro, GshSectionTitle } from "@/components/gsh-ui-kit";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { fetchCandidateDashboard } from "@/lib/api-client";
import { stackScrollContentStyle } from "@/lib/screen-layout";
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
          <GshScreenIntro
            eyebrow="Mobility & CV"
            title="Career toolkit"
            subtitle="Sponsorship mobility tools and CV alignment — visa wizard and guides hub stay inside this app."
            style={{ marginBottom: 12 }}
          />

          <LinearGradient colors={[colors.teal, colors.brand]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.accentBar} />

          {pct != null ? (
            <View style={[styles.scoreCard, cardSurfaceStyle(true)]}>
              <Text style={styles.scoreLabel}>Profile strength</Text>
              <Text style={styles.scoreVal}>{pct}%</Text>
              <Pressable onPress={() => router.push("/(tabs)/profile")}>
                <Text style={styles.link}>Update profile →</Text>
              </Pressable>
            </View>
          ) : null}

          <GshSectionTitle title="Visa & mobility" topSpacing={pct != null ? "md" : "sm"} />
          <Pressable
            style={styles.primaryBtnOuter}
            onPress={() => router.push("/visa-wizard")}
            accessibilityRole="button"
            accessibilityLabel="Open visa wizard"
          >
            <LinearGradient colors={[...gradient.authCTA]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primaryBtn}>
              <View style={styles.primaryBtnRow}>
                <Ionicons name="sparkles" size={22} color={colors.white} />
                <View style={styles.primaryBtnTextCol}>
                  <Text style={styles.primaryBtnText}>Visa wizard</Text>
                  <Text style={styles.primarySub}>Interactive questionnaire in the app — sponsorship routes & next steps</Text>
                </View>
              </View>
            </LinearGradient>
          </Pressable>

          <GshSectionTitle title="CV & applications" hint="Stand out to employers and ATS parsers." />

          <GshSectionTitle title="Quick tips" topSpacing="sm" />
          {TIPS.map((tip) => (
            <View key={tip} style={styles.tip}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}

          <Pressable style={[styles.primaryBtnOuter, styles.atsBtn]} onPress={() => router.push("/ats-assistant")}>
            <LinearGradient colors={[...gradient.authCTA]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>ATS match assistant</Text>
              <Text style={styles.primarySub}>Paste your CV text & a job description</Text>
            </LinearGradient>
          </Pressable>

          <GshLinkRow
            title="Guides hub"
            subtitle="Country corridors, topics, and checklists"
            icon="book-outline"
            accent="teal"
            onPress={() => router.push("/guides")}
          />
          <GshLinkRow
            title="Tools & resources"
            subtitle="Blog, news, FAQs, legal, and more"
            icon="grid-outline"
            accent="purple"
            onPress={() => router.push("/tools-resources")}
          />
        </ScrollView>
      </SafeAreaView>
    </GshScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  pad: { ...stackScrollContentStyle, paddingBottom: 40 },
  accentBar: { height: 4, borderRadius: 2, marginBottom: 18 },
  scoreCard: {
    borderRadius: radii.lg,
    padding: 16,
    marginBottom: 4,
  },
  scoreLabel: {
    fontSize: 13,
    fontFamily: fontFamily.semiBold,
    color: colors.textMuted,
  },
  scoreVal: { fontSize: 36, fontFamily: fontFamily.extraBold, color: colors.accent, marginTop: 4 },
  link: { marginTop: 10, color: colors.brand, fontFamily: fontFamily.semiBold, fontSize: 15 },
  tip: { flexDirection: "row", gap: 8, marginBottom: 10, paddingRight: 8 },
  bullet: { fontSize: 16, color: colors.accent, fontFamily: fontFamily.extraBold },
  tipText: { flex: 1, fontSize: 14, fontFamily: fontFamily.regular, color: colors.textSecondary, lineHeight: 20 },
  primaryBtnOuter: { marginTop: 0, marginBottom: 4, borderRadius: radii.lg, overflow: "hidden" },
  atsBtn: { marginTop: 14 },
  primaryBtn: {
    borderRadius: radii.lg,
    padding: 16,
  },
  primaryBtnRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  primaryBtnTextCol: { flex: 1 },
  primaryBtnText: { color: colors.white, fontFamily: fontFamily.extraBold, fontSize: 17 },
  primarySub: { color: "rgba(255,255,255,0.88)", fontSize: 13, marginTop: 6, fontFamily: fontFamily.regular, lineHeight: 18 },
});
