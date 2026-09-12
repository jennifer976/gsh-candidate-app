import { useAppCopy } from "@/lib/i18n";
import toolkitCopy from "@/data/candidateToolkitCopy.json";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  GshLinkRow,
  GshScreenIntro,
  GshSectionTitle,
} from "@/components/gsh-ui-kit";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { stackScrollContentStyle } from "@/lib/screen-layout";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";


export default function ToolsScreen() {
  const router = useRouter();
  const { t, locale } = useAppCopy();
  const copy = toolkitCopy[locale];
  const TIPS = [copy.tip1, copy.tip2, copy.tip3, copy.tip4, copy.tip5];

  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <ScrollView
          contentContainerStyle={styles.pad}
          showsVerticalScrollIndicator={false}
        >
          <GshScreenIntro
            eyebrow={copy.career.toLocaleLowerCase(locale)}
            title={copy.title}
            subtitle={copy.intro}
            style={{ marginBottom: 12 }}
          />

          <View style={styles.accentBar} />

          <Pressable onPress={() => router.push("/(tabs)/profile")} accessibilityRole="button" style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>{copy.profileHelp}</Text>
            <Text style={styles.link}>{copy.openProfile}</Text>
          </Pressable>

          <GshSectionTitle
            title={copy.cvApplications}
            hint={copy.cvHelp}
          />

          <GshSectionTitle title={copy.quickTips} topSpacing="sm" />
          {TIPS.map((tip) => (
            <View key={tip} style={styles.tip}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}

          <Pressable
            style={[styles.primaryBtnOuter, styles.primaryBtn, styles.atsBtn]}
            onPress={() => router.push("/ats-assistant")}
          >
            <Text style={styles.primaryBtnText}>{copy.ats}</Text>
            <Text style={styles.primarySub}>
              {copy.atsHelp}
            </Text>
          </Pressable>

          <GshLinkRow
            title={copy.guides}
            subtitle={copy.guidesHelp}
            icon="book-outline"
            accent="teal"
            onPress={() => router.push("/guides")}
          />
          <GshLinkRow
            title={copy.sponsor}
            subtitle={copy.comingSoon}
            icon="shield-checkmark-outline"
            accent="teal"
            onPress={() => router.push("/visa-checker")}
          />
          <GshLinkRow
            title={copy.worksheets}
            subtitle={copy.worksheetsHelp}
            icon="clipboard-outline"
            accent="ocean"
            onPress={() => router.push("/relocation-worksheets")}
          />
          <GshLinkRow
            title={copy.resources}
            subtitle={copy.resourcesHelp}
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
  accentBar: { height: 3, backgroundColor: colors.teal, marginBottom: 18 },
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
  scoreVal: {
    fontSize: 36,
    fontFamily: fontFamily.extraBold,
    color: colors.accent,
    marginTop: 4,
  },
  link: {
    marginTop: 10,
    color: colors.brand,
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
  },
  tip: { flexDirection: "row", gap: 8, marginBottom: 10, paddingRight: 8 },
  bullet: {
    fontSize: 16,
    color: colors.accent,
    fontFamily: fontFamily.extraBold,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  primaryBtnOuter: {
    minHeight: 52,
    marginTop: 0,
    marginBottom: 4,
    borderRadius: radii.md,
    overflow: "hidden",
  },
  atsBtn: { marginTop: 14 },
  primaryBtn: {
    borderRadius: radii.md,
    padding: 16,
    backgroundColor: colors.navy,
  },
  primaryBtnRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  primaryBtnTextCol: { flex: 1 },
  primaryBtnText: {
    color: colors.white,
    fontFamily: fontFamily.extraBold,
    fontSize: 17,
  },
  primarySub: {
    color: "rgba(255,255,255,0.88)",
    fontSize: 13,
    marginTop: 6,
    fontFamily: fontFamily.regular,
    lineHeight: 18,
  },
});
