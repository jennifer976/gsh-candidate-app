import { useAppCopy } from "@/lib/i18n";
import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import toolkitCopy from "@/data/candidateToolkitCopy.json";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BrandTopBar } from "@/components/BrandTopBar";
import {
  BrandLinkRow,
  DecorRing,
  DepthPressable,
  DepthSurface,
  Eyebrow,
  PosterTitle,
  SectionHeading,
} from "@/components/gsh-brand";
import { colors, fontFamily } from "@/lib/theme";

export default function ToolsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, locale } = useAppCopy();
  const ac = useAccountCopy();
  const copy = toolkitCopy[locale];
  const TIPS = [copy.tip1, copy.tip2, copy.tip3, copy.tip4, copy.tip5];

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ title: t("screenCareertoolkit"), headerShown: false }} />
      <ScrollView
        contentContainerStyle={[styles.pad, { paddingBottom: Math.max(insets.bottom, 16) + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <DecorRing size={240} thickness={30} color="rgba(66,224,227,0.18)" style={{ top: -110, right: -100 }} />
        <BrandTopBar fallback="/tools-resources" />

        <View style={styles.hero}>
          <Eyebrow>{copy.career}</Eyebrow>
          <PosterTitle highlight={copy.title} size={32} />
          <Text style={styles.intro}>{copy.intro}</Text>
        </View>

        <View style={styles.section}>
          <BrandLinkRow
            icon="person-circle-outline"
            label={copy.openProfile}
            hint={copy.profileHelp}
            onPress={() => router.push("/(tabs)/profile")}
          />
        </View>

        <View style={styles.section}>
          <SectionHeading title={copy.cvApplications} />
          <Text style={styles.hint}>{copy.cvHelp}</Text>
          <View style={styles.rows}>
            <BrandLinkRow
              icon="document-text-outline"
              label={ac("CV quality check")}
              hint={ac("Check structure, contact details, dates, and measurable results.")}
              onPress={() => router.push("/cv-quality-checker")}
            />
            <DepthPressable
              onPress={() => router.push("/ats-assistant")}
              face={colors.navy}
              depthColor={colors.cyan}
              depth={5}
              radius={20}
              accessibilityLabel={`${copy.ats}. ${copy.atsHelp}`}
              innerStyle={styles.atsCard}
            >
              <View style={styles.atsIcon}>
                <Ionicons name="git-compare-outline" size={20} color={colors.navy} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.atsTitle}>{copy.ats}</Text>
                <Text style={styles.atsBody}>{copy.atsHelp}</Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color={colors.cyan} />
            </DepthPressable>
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeading title={copy.quickTips} />
          <DepthSurface
            depth={4}
            radius={20}
            borderWidth={2}
            borderColor={colors.navy}
            style={styles.tipsCard}
            innerStyle={styles.tipsInner}
          >
            {TIPS.map((tip, index) => (
              <View key={tip} style={styles.tip}>
                <View style={styles.tipNumber}>
                  <Text style={styles.tipNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </DepthSurface>
        </View>

        <View style={styles.section}>
          <SectionHeading title={t("resourcesMove")} />
          <View style={styles.rows}>
            <BrandLinkRow
              icon="swap-horizontal-outline"
              label={t("resourcesCompare")}
              hint={t("resourcesCompareHelp")}
              onPress={() => router.push("/compare-countries")}
            />
            <BrandLinkRow
              icon="cash-outline"
              label={ac("Currency converter")}
              hint={ac("Compare salaries and living costs in your own currency.")}
              onPress={() => router.push("/currency-converter")}
            />
            <BrandLinkRow
              icon="clipboard-outline"
              label={copy.worksheets}
              hint={copy.worksheetsHelp}
              onPress={() => router.push("/relocation-worksheets")}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  pad: { overflow: "hidden" },
  hero: { paddingHorizontal: 20, paddingTop: 20, gap: 10 },
  intro: {
    marginTop: 2,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
  },
  section: { marginTop: 24, paddingHorizontal: 16 },
  hint: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
  },
  rows: { gap: 10, marginTop: 12 },
  atsCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
  atsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cyan,
    alignItems: "center",
    justifyContent: "center",
  },
  atsTitle: { fontSize: 16, fontFamily: fontFamily.heading, color: colors.white },
  atsBody: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fontFamily.regular,
    color: "rgba(255,255,255,0.78)",
  },
  tipsCard: { marginTop: 12 },
  tipsInner: { padding: 16, gap: 12 },
  tip: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  tipNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  tipNumberText: { fontSize: 12, fontFamily: fontFamily.extraBold, color: colors.cyan },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
  },
});
