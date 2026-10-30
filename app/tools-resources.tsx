import { useAppCopy } from "@/lib/i18n";
import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { type Href, Stack, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon, type IconName } from "@/components/Icon";
import {
  DepthButton,
  GshMark,
  SupportChip,
  TitleWithStop,
  Eyebrow,
} from "@/components/gsh-brand";
import {
  BreakoutPhoto,
  CountryRail,
  NavyBand,
  Row,
  RowCard,
  SectionHeader,
  Tile,
} from "@/components/v3";
import { useLastCvCheck } from "@/lib/cv-check-history";
import { useRelocationPerksNav } from "@/lib/use-relocation-perks-nav";
import { colors, fontFamily, shadows } from "@/lib/theme";

type Link = { icon: IconName; label: string; hint?: string; href: Href };

/** The one place for tools, move planning, reading and help. */
export default function ToolsAndResourcesScreen() {
  const { t } = useAppCopy();
  const ac = useAccountCopy();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const relocationPerksNav = useRelocationPerksNav();
  const lastCvCheck = useLastCvCheck();

  const jobReady: Link[] = [
    {
      icon: "git-compare",
      label: ac("CV and job comparison"),
      hint: ac("Match your CV to a role"),
      href: "/ats-assistant",
    },
    {
      icon: "pen-line",
      label: ac("Cover letter template"),
      hint: ac("For visa-sponsored roles"),
      href: "/resources/visa-sponsorship-cover-letter-template",
    },
    {
      icon: "shield-check",
      label: ac("Scam checklist"),
      hint: ac("Spot fake job offers"),
      href: "/resources/job-offer-scam-checklist",
    },
    {
      icon: "building-2",
      label: ac("Company directory"),
      hint: ac("Employers hiring with us"),
      href: "/companies",
    },
  ];

  const move: Link[] = [
    {
      icon: "compass",
      label: ac("Plan the visa, and the move"),
      hint: ac("Visa, housing, and money after a hire."),
      href: "/relocation-help",
    },
    {
      icon: "git-compare",
      label: ac("Compare countries"),
      hint: t("resourcesCompareHelp"),
      href: "/compare-countries",
    },
    {
      icon: "coins",
      label: ac("Currency converter"),
      hint: t("resourcesSalaryHelp"),
      href: "/currency-converter",
    },
    {
      icon: "clipboard-list",
      label: ac("Relocation worksheets"),
      hint: t("resourcesWorksheetsHelp"),
      href: "/relocation-worksheets",
    },
    {
      icon: "users-round",
      label: ac("Specialist help"),
      hint: t("resourcesSpecialistsHelp"),
      href: "/partners",
    },
    {
      icon: "plane",
      label: relocationPerksNav.title,
      hint: relocationPerksNav.subtitle,
      href: "/relocation-perks",
    },
  ];

  const reading: Link[] = [
    {
      icon: "file-text",
      label: ac("Guides"),
      hint: t("resourcesPracticalHelp"),
      href: "/resources",
    },
    {
      icon: "newspaper",
      label: t("resourcesBlog"),
      hint: t("resourcesBlogHelp"),
      href: "/blog",
    },
    {
      icon: "megaphone",
      label: t("resourcesNews"),
      hint: t("resourcesNewsHelp"),
      href: "/news",
    },
  ];

  const help: { icon: IconName; label: string; href: Href }[] = [
    { icon: "circle-help", label: t("screenFAQs"), href: "/faq" },
    { icon: "mail", label: t("screenContact"), href: "/contact" },
    { icon: "message-square", label: t("resourcesFeedback"), href: "/feedback" },
    { icon: "scale", label: t("resourcesLegal"), href: "/legal" },
  ];

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)/profile");
  }

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ title: t("resources"), headerShown: false }} />
      <ScrollView
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom, 16) + 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.pad, { paddingTop: insets.top + 22 }]}>
          <Pressable
            onPress={goBack}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Icon name="arrow-left" size={22} color={colors.navy} strokeWidth={1.8} />
          </Pressable>

          <View style={{ marginTop: 16 }}>
            <TitleWithStop eyebrow={ac("Free for candidates")} text={ac("Your career toolkit")} />
          </View>

          <View style={styles.feature}>
            <View style={styles.featureClip} pointerEvents="none">
              <GshMark
                size={260}
                color="rgba(255,255,255,0.05)"
                style={styles.featureMark}
              />
            </View>
            <BreakoutPhoto
              photo="talent-pool"
              rotate={3}
              style={styles.featurePhoto}
            />
            <SupportChip label={ac("Recommended")} onNavy />
            <Text style={styles.featureTitle}>{ac("CV quality check")}</Text>
            <Text style={styles.featureBody}>
              {ac("Check structure, contact details, dates, and measurable results.")}
            </Text>
            {lastCvCheck ? (
              <View style={styles.lastScore}>
                <Text style={styles.lastScoreText}>
                  {ac("Last score {score}/100", { score: lastCvCheck.score })}
                </Text>
              </View>
            ) : null}
            <View style={styles.featureFoot}>
              <DepthButton
                title={lastCvCheck ? ac("Check again") : ac("Start")}
                onPress={() => router.push("/cv-quality-checker")}
                variant="cyanOnNavy"
                size="md"
                style={{ flex: 1 }}
              />
              <View style={styles.featureNote}>
                <Icon name="lock" size={14} color={colors.cyan} strokeWidth={1.8} />
                <Text style={styles.featureNoteText}>{ac("Runs on your phone")}</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <SectionHeader
              eyebrow={ac("Apply with confidence")}
              title={ac("Get job-ready")}
            />
            <View style={styles.grid}>
              {jobReady.map((item) => (
                <Tile
                  key={item.label}
                  icon={item.icon}
                  title={item.label}
                  hint={item.hint}
                  onPress={() => router.push(item.href)}
                  style={styles.tile}
                />
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <SectionHeader
              eyebrow={ac("Moving abroad")}
              title={ac("Plan your move")}
              onSeeAll={() => router.push("/countries")}
            />
            <CountryRail
              onSelectCountry={(slug) =>
                router.push(`/country/${encodeURIComponent(slug)}` as Href)
              }
            />
            <RowCard style={{ marginTop: 12 }}>
              {move.map((item, index) => (
                <Row
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  hint={item.hint}
                  onPress={() => router.push(item.href)}
                  isLast={index === move.length - 1}
                />
              ))}
            </RowCard>
          </View>

          <View style={styles.section}>
            <SectionHeader eyebrow={ac("Read and plan")} title={ac("Resources")} />
            <RowCard style={{ marginTop: 12 }}>
              {reading.map((item, index) => (
                <Row
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  hint={item.hint}
                  onPress={() => router.push(item.href)}
                  isLast={index === reading.length - 1}
                />
              ))}
            </RowCard>
          </View>
        </View>

        <NavyBand style={{ marginTop: 30 }}>
          <Eyebrow onDark>{ac("Help and contact")}</Eyebrow>
          <Text style={styles.helpTitle}>{ac("Questions or feedback")}</Text>
          <View style={styles.helpGrid}>
            {help.map((item) => (
              <Pressable
                key={item.label}
                onPress={() => router.push(item.href)}
                style={({ pressed }) => [styles.helpTile, pressed && styles.helpPressed]}
                accessibilityRole="button"
                accessibilityLabel={item.label}
              >
                <Icon name={item.icon} size={20} color={colors.cyan} strokeWidth={1.8} />
                <Text style={styles.helpText} numberOfLines={2}>
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </NavyBand>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.panel },
  pad: { paddingHorizontal: 16 },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.card,
  },
  feature: {
    marginTop: 44,
    backgroundColor: colors.navy,
    borderRadius: 28,
    padding: 20,
    overflow: "visible",
    ...shadows.photo,
  },
  featureClip: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
    overflow: "hidden",
  },
  featureMark: {
    position: "absolute",
    left: -80,
    bottom: -120,
  },
  featurePhoto: {
    position: "absolute",
    right: 16,
    top: -30,
    width: 104,
    height: 128,
  },
  featureTitle: {
    marginTop: 10,
    maxWidth: 180,
    fontFamily: fontFamily.headingStrong,
    fontSize: 21,
    lineHeight: 25,
    color: colors.white,
  },
  featureBody: {
    marginTop: 6,
    maxWidth: 200,
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    color: "rgba(255,255,255,0.75)",
  },
  lastScore: {
    alignSelf: "flex-start",
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  lastScoreText: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: colors.white,
  },
  featureFoot: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureNote: { flexDirection: "row", alignItems: "center", gap: 6, flexShrink: 1 },
  featureNoteText: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: "rgba(255,255,255,0.72)",
  },
  section: { marginTop: 30 },
  grid: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  tile: { width: "47%", flexGrow: 1 },
  helpTitle: {
    marginTop: 6,
    fontFamily: fontFamily.headingStrong,
    fontSize: 21,
    lineHeight: 26,
    color: colors.white,
  },
  helpGrid: {
    marginTop: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  helpTile: {
    width: "47%",
    flexGrow: 1,
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  helpPressed: { backgroundColor: "rgba(255,255,255,0.14)" },
  helpText: {
    flex: 1,
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    color: colors.white,
  },
});
