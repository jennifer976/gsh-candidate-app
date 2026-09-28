import { useAppCopy } from "@/lib/i18n";
import { useAccountCopy } from "@/lib/i18n/useAccountCopy";
import { Ionicons } from "@expo/vector-icons";
import { type Href, Stack, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BrandTopBar } from "@/components/BrandTopBar";
import {
  DecorRing,
  DepthButton,
  DepthPressable,
  DepthSurface,
  Eyebrow,
  PosterTitle,
  posterParts,
} from "@/components/gsh-brand";
import { useRelocationPerksNav } from "@/lib/use-relocation-perks-nav";
import { colors, fontFamily } from "@/lib/theme";

type IonName = keyof typeof Ionicons.glyphMap;
type Link = { icon: IonName; label: string; hint?: string; href: Href };

/** The one place for tools, move planning, reading and help. Layout follows the Superdesign tools board. */
export default function ToolsAndResourcesScreen() {
  const { t } = useAppCopy();
  const ac = useAccountCopy();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const relocationPerksNav = useRelocationPerksNav();

  const jobReady: Link[] = [
    { icon: "git-compare", label: ac("CV and job comparison"), hint: ac("Match your CV to a role"), href: "/ats-assistant" },
    {
      icon: "create",
      label: ac("Cover letter template"),
      hint: ac("For visa-sponsored roles"),
      href: "/resources/visa-sponsorship-cover-letter-template",
    },
    { icon: "shield-checkmark", label: ac("Scam checklist"), hint: ac("Spot fake job offers"), href: "/resources/job-offer-scam-checklist" },
    { icon: "business", label: ac("Company directory"), hint: ac("Employers hiring with us"), href: "/companies" },
  ];

  const move: Link[] = [
    { icon: "compass", label: ac("Plan the visa, and the move"), hint: ac("Visa, housing, and money after a hire."), href: "/relocation-help" },
    { icon: "earth", label: ac("Countries"), hint: ac("Visa routes, hiring sectors and everyday life, destination by destination."), href: "/countries" },
    { icon: "git-compare", label: ac("Compare countries"), hint: t("resourcesCompareHelp"), href: "/compare-countries" },
    { icon: "cash", label: ac("Currency converter"), hint: t("resourcesSalaryHelp"), href: "/currency-converter" },
    { icon: "clipboard", label: ac("Relocation worksheets"), hint: t("resourcesWorksheetsHelp"), href: "/relocation-worksheets" },
    { icon: "people", label: ac("Specialist help"), hint: t("resourcesSpecialistsHelp"), href: "/partners" },
    { icon: "airplane", label: relocationPerksNav.title, hint: relocationPerksNav.subtitle, href: "/relocation-perks" },
  ];

  const reading: Link[] = [
    { icon: "document-text", label: ac("Guides"), hint: t("resourcesPracticalHelp"), href: "/resources" },
    { icon: "newspaper", label: t("resourcesBlog"), hint: t("resourcesBlogHelp"), href: "/blog" },
    { icon: "megaphone", label: t("resourcesNews"), hint: t("resourcesNewsHelp"), href: "/news" },
  ];

  const help: Link[] = [
    { icon: "help-circle", label: t("screenFAQs"), href: "/faq" },
    { icon: "mail", label: t("screenContact"), href: "/contact" },
    { icon: "chatbox-ellipses", label: t("resourcesFeedback"), href: "/feedback" },
    { icon: "scale", label: t("resourcesLegal"), href: "/legal" },
  ];

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ title: t("resources"), headerShown: false }} />
      <ScrollView
        contentContainerStyle={[styles.pad, { paddingBottom: Math.max(insets.bottom, 16) + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <DecorRing size={256} thickness={36} color="rgba(66,224,227,0.15)" style={{ top: 40, right: -96 }} />
        <DecorRing size={224} thickness={30} color="rgba(66,224,227,0.10)" style={{ top: 560, left: -96 }} />
        <BrandTopBar onDark />

        <View style={styles.hero}>
          <Eyebrow onDark>{ac("Free for candidates")}</Eyebrow>
          <PosterTitle {...posterParts(ac("Tools for|every move."))} onDark highlightTone="cyan" size={36} />
        </View>

        <DepthSurface face={colors.cyan} depthColor={colors.navyDeep} depth={6} radius={26} style={styles.feature} innerStyle={styles.featureInner}>
          <DecorRing size={128} thickness={20} color="rgba(255,255,255,0.35)" style={{ top: -40, right: -40 }} />
          <View style={styles.recommended}>
            <Ionicons name="star" size={11} color={colors.cyan} />
            <Text style={styles.recommendedText}>{ac("Recommended")}</Text>
          </View>
          <Text style={styles.featureTitle}>{ac("CV quality check")}</Text>
          <Text style={styles.featureBody}>{ac("Check structure, contact details, dates, and measurable results.")}</Text>
          <View style={styles.featureFoot}>
            <DepthButton
              title={ac("Start")}
              onPress={() => router.push("/cv-quality-checker")}
              variant="navy"
              size="md"
              style={{ flex: 1 }}
            />
            <View style={styles.featureNote}>
              <Ionicons name="lock-closed" size={13} color={colors.navy} />
              <Text style={styles.featureNoteText}>{ac("Runs on your phone")}</Text>
            </View>
          </View>
        </DepthSurface>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{ac("Get job-ready")}</Text>
          <View style={styles.grid}>
            {jobReady.map((item) => (
              <DepthPressable
                key={item.label}
                onPress={() => router.push(item.href)}
                face={colors.white}
                depthColor={colors.cyan}
                depth={4}
                radius={20}
                accessibilityLabel={item.hint ? `${item.label}. ${item.hint}` : item.label}
                style={styles.tile}
                innerStyle={styles.tileInner}
              >
                <View style={styles.tileIcon}>
                  <Ionicons name={item.icon} size={18} color={colors.navy} />
                </View>
                <Text style={styles.tileLabel} numberOfLines={2}>
                  {item.label}
                </Text>
                {item.hint ? (
                  <Text style={styles.tileHint} numberOfLines={2}>
                    {item.hint}
                  </Text>
                ) : null}
              </DepthPressable>
            ))}
          </View>
        </View>

        <LinkSection title={ac("Plan your move")} links={move} onOpen={(href) => router.push(href)} />
        <LinkSection title={ac("Resources")} links={reading} onOpen={(href) => router.push(href)} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{ac("Help and contact")}</Text>
          <View style={styles.helpGrid}>
            {help.map((item) => (
              <Pressable
                key={item.label}
                onPress={() => router.push(item.href)}
                style={({ pressed }) => [styles.helpTile, pressed && styles.rowPressed]}
                accessibilityRole="button"
                accessibilityLabel={item.label}
              >
                <Ionicons name={item.icon} size={18} color={colors.cyan} />
                <Text style={styles.helpText} numberOfLines={2}>
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function LinkSection({ title, links, onOpen }: { title: string; links: Link[]; onOpen: (href: Href) => void }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.rows}>
        {links.map((item) => (
          <Pressable
            key={item.label}
            onPress={() => onOpen(item.href)}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            accessibilityRole="button"
            accessibilityLabel={item.hint ? `${item.label}. ${item.hint}` : item.label}
          >
            <View style={styles.rowIcon}>
              <Ionicons name={item.icon} size={18} color={colors.navy} />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel} numberOfLines={2}>
                {item.label}
              </Text>
              {item.hint ? (
                <Text style={styles.rowHint} numberOfLines={2}>
                  {item.hint}
                </Text>
              ) : null}
            </View>
            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.6)" />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.navy },
  pad: { overflow: "hidden" },
  hero: { paddingHorizontal: 20, paddingTop: 16, gap: 6 },
  feature: { marginHorizontal: 20, marginTop: 24 },
  featureInner: { padding: 20, overflow: "hidden" },
  recommended: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.navy,
  },
  recommendedText: {
    fontSize: 10,
    fontFamily: fontFamily.extraBold,
    color: colors.cyan,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  featureTitle: {
    marginTop: 12,
    fontSize: 22,
    lineHeight: 26,
    fontFamily: fontFamily.headingStrong,
    letterSpacing: -0.4,
    color: colors.navy,
  },
  featureBody: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fontFamily.semiBold,
    color: "rgba(13,25,78,0.7)",
  },
  featureFoot: { marginTop: 16, flexDirection: "row", alignItems: "center", gap: 12 },
  featureNote: { flexDirection: "row", alignItems: "center", gap: 4 },
  featureNoteText: { fontSize: 12, fontFamily: fontFamily.bold, color: colors.navy },
  section: { marginTop: 28, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 19, fontFamily: fontFamily.heading, color: colors.white, letterSpacing: -0.3 },
  grid: { marginTop: 12, flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start", gap: 12 },
  tile: { width: "47%", flexGrow: 1 },
  tileInner: { padding: 14, minHeight: 116 },
  tileIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.cyan,
    alignItems: "center",
    justifyContent: "center",
  },
  tileLabel: { marginTop: 10, fontSize: 14, lineHeight: 18, fontFamily: fontFamily.heading, color: colors.navy },
  tileHint: { marginTop: 2, fontSize: 11, lineHeight: 15, fontFamily: fontFamily.semiBold, color: colors.textMuted },
  rows: { marginTop: 12, gap: 10 },
  row: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  rowPressed: { backgroundColor: "rgba(255,255,255,0.16)" },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.cyan,
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: { flex: 1, minWidth: 0 },
  rowLabel: { fontSize: 14, fontFamily: fontFamily.extraBold, color: colors.white },
  rowHint: { marginTop: 2, fontSize: 11, lineHeight: 15, fontFamily: fontFamily.regular, color: "rgba(255,255,255,0.6)" },
  helpGrid: { marginTop: 12, flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start", gap: 10 },
  helpTile: {
    width: "47%",
    flexGrow: 1,
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  helpText: { flex: 1, fontSize: 14, fontFamily: fontFamily.bold, color: colors.white },
});
