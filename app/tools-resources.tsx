import { useAppCopy } from "@/lib/i18n";
import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { Ionicons } from "@expo/vector-icons";
import { type Href, Stack, useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BrandTopBar } from "@/components/BrandTopBar";
import {
  BrandLinkRow,
  DecorRing,
  DepthButton,
  DepthSurface,
  Eyebrow,
  PosterTitle,
  posterParts,
  SectionHeading,
} from "@/components/gsh-brand";
import { useRelocationPerksNav } from "@/lib/use-relocation-perks-nav";
import { colors, fontFamily } from "@/lib/theme";

type IonName = keyof typeof Ionicons.glyphMap;
type ToolRow = { icon: IonName; label: string; hint: string; href: Href };

/** Primary hub: career tools, guides, blog, legal — one screen for discoverability. */
export default function ToolsAndResourcesScreen() {
  const { t } = useAppCopy();
  const ac = useAccountCopy();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const relocationPerksNav = useRelocationPerksNav();

  const groups: { title: string; rows: ToolRow[] }[] = [
    {
      title: ac("Get job-ready"),
      rows: [
        { icon: "briefcase-outline", label: t("homeFind"), hint: t("jobsDirectDesc"), href: "/(tabs)/jobs" },
        {
          icon: "git-compare-outline",
          label: ac("CV and job comparison"),
          hint: ac("See how your CV lines up with a job description."),
          href: "/ats-assistant",
        },
        { icon: "library-outline", label: t("resourcesToolkit"), hint: t("resourcesToolkitHelp"), href: "/tools" },
        { icon: "shield-checkmark-outline", label: t("resourcesCompanies"), hint: t("resourcesCompaniesHelp"), href: "/companies" },
        { icon: "globe-outline", label: t("screenCuratedroles"), hint: t("resourcesExternalHelp"), href: "/curated-listings" },
      ],
    },
    {
      title: t("resourcesMove"),
      rows: [
        {
          icon: "compass-outline",
          label: ac("Plan the visa, and the move"),
          hint: ac("Visa, housing, and money after a hire."),
          href: "/relocation-help",
        },
        {
          icon: "earth-outline",
          label: ac("Countries"),
          hint: ac("Visa routes, hiring sectors and everyday life, destination by destination."),
          href: "/countries",
        },
        { icon: "swap-horizontal-outline", label: t("resourcesCompare"), hint: t("resourcesCompareHelp"), href: "/compare-countries" },
        { icon: "cash-outline", label: t("resourcesSalary"), hint: t("resourcesSalaryHelp"), href: "/currency-converter" },
        { icon: "clipboard-outline", label: t("resourcesWorksheets"), hint: t("resourcesWorksheetsHelp"), href: "/relocation-worksheets" },
        { icon: "airplane-outline", label: relocationPerksNav.title, hint: relocationPerksNav.subtitle, href: "/relocation-perks" },
        { icon: "people-outline", label: t("resourcesSpecialists"), hint: t("resourcesSpecialistsHelp"), href: "/partners" },
      ],
    },
    {
      title: t("resourcesReading"),
      rows: [
        { icon: "document-text-outline", label: t("resourcesPractical"), hint: t("resourcesPracticalHelp"), href: "/resources" },
        { icon: "newspaper-outline", label: t("resourcesBlog"), hint: t("resourcesBlogHelp"), href: "/blog" },
        { icon: "help-circle-outline", label: t("screenFAQs"), hint: t("resourcesFaqHelp"), href: "/faq" },
        { icon: "scale-outline", label: t("resourcesLegal"), hint: t("resourcesLegalHelp"), href: "/legal" },
        { icon: "mail-outline", label: t("screenContact"), hint: "support@globalsponsorhub.com", href: "/contact" },
      ],
    },
    {
      title: t("resourcesThisApp"),
      rows: [
        { icon: "chatbox-ellipses-outline", label: t("resourcesFeedback"), hint: t("resourcesFeedbackHelp"), href: "/feedback" },
      ],
    },
  ];

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ title: t("resources"), headerShown: false }} />
      <ScrollView
        contentContainerStyle={[styles.pad, { paddingBottom: Math.max(insets.bottom, 16) + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <DecorRing size={280} thickness={36} color="rgba(66,224,227,0.12)" style={{ top: -120, right: -120 }} />
        <DecorRing size={140} thickness={20} color="rgba(66,224,227,0.08)" style={{ top: 260, left: -80 }} />
        <BrandTopBar onDark />

        <View style={styles.hero}>
          <Eyebrow onDark>{ac("Free for candidates")}</Eyebrow>
          <PosterTitle {...posterParts(ac("Tools for|every move."))} onDark highlightTone="cyan" size={38} />
          <Text style={styles.intro}>{t("resourcesIntro")}</Text>
        </View>

        <DepthSurface face={colors.cyan} depthColor={colors.navyDeep} depth={6} radius={24} style={styles.feature} innerStyle={styles.featureInner}>
          <DecorRing size={150} thickness={22} color="rgba(13,25,78,0.08)" style={{ top: -50, right: -50 }} />
          <Eyebrow color={colors.navy}>{ac("Start here")}</Eyebrow>
          <Text style={styles.featureTitle}>{ac("CV quality check")}</Text>
          <Text style={styles.featureBody}>
            {ac("Check structure, contact details, dates, and measurable results.")}
          </Text>
          <View style={styles.featureFoot}>
            <DepthButton title={ac("Start")} onPress={() => router.push("/cv-quality-checker")} variant="navy" size="md" />
            <View style={styles.featureNote}>
              <Ionicons name="lock-closed-outline" size={14} color={colors.navy} />
              <Text style={styles.featureNoteText}>{ac("Runs on your phone")}</Text>
            </View>
          </View>
        </DepthSurface>

        {groups.map((group) => (
          <View key={group.title} style={styles.group}>
            <SectionHeading title={group.title} onDark />
            <View style={styles.rows}>
              {group.rows.map((row) => (
                <BrandLinkRow
                  key={row.label}
                  icon={row.icon}
                  label={row.label}
                  hint={row.hint}
                  onDark
                  onPress={() => router.push(row.href)}
                />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.navy },
  pad: { overflow: "hidden" },
  hero: { paddingHorizontal: 20, paddingTop: 20, gap: 10 },
  intro: {
    marginTop: 4,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: fontFamily.regular,
    color: "rgba(255,255,255,0.72)",
  },
  feature: { marginHorizontal: 16, marginTop: 24 },
  featureInner: { padding: 20, overflow: "hidden" },
  featureTitle: {
    marginTop: 6,
    fontSize: 24,
    lineHeight: 28,
    fontFamily: fontFamily.heading,
    letterSpacing: -0.5,
    color: colors.navy,
  },
  featureBody: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.medium,
    color: "rgba(13,25,78,0.78)",
  },
  featureFoot: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 14,
  },
  featureNote: { flexDirection: "row", alignItems: "center", gap: 5 },
  featureNoteText: { fontSize: 12, fontFamily: fontFamily.bold, color: colors.navy },
  group: { marginTop: 28, paddingHorizontal: 16 },
  rows: { gap: 10, marginTop: 12 },
});
