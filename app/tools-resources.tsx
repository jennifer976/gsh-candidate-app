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
  DepthPressable,
  Eyebrow,
  PosterTitle,
  posterParts,
  SectionHeading,
} from "@/components/gsh-brand";
import { useRelocationPerksNav } from "@/lib/use-relocation-perks-nav";
import { colors, fontFamily } from "@/lib/theme";

type IonName = keyof typeof Ionicons.glyphMap;
type ToolRow = { icon: IonName; label: string; hint: string; href: Href };

/** Hub mirroring the website's nav: Plan the move, Resources, then help links. */
export default function ToolsAndResourcesScreen() {
  const { t } = useAppCopy();
  const ac = useAccountCopy();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const relocationPerksNav = useRelocationPerksNav();

  const groups: { title: string; rows: ToolRow[] }[] = [
    {
      title: ac("Plan the move"),
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
        { icon: "people-outline", label: t("resourcesSpecialists"), hint: t("resourcesSpecialistsHelp"), href: "/partners" },
        { icon: "airplane-outline", label: relocationPerksNav.title, hint: relocationPerksNav.subtitle, href: "/relocation-perks" },
      ],
    },
    {
      title: ac("Resources"),
      rows: [
        { icon: "document-text-outline", label: ac("Guides"), hint: t("resourcesPracticalHelp"), href: "/resources" },
        { icon: "newspaper-outline", label: t("resourcesBlog"), hint: t("resourcesBlogHelp"), href: "/blog" },
        { icon: "megaphone-outline", label: t("resourcesNews"), hint: t("resourcesNewsHelp"), href: "/news" },
        { icon: "construct-outline", label: ac("Career tools"), hint: t("resourcesToolkitHelp"), href: "/tools" },
        { icon: "business-outline", label: t("resourcesCompanies"), hint: t("resourcesCompaniesHelp"), href: "/companies" },
      ],
    },
  ];

  const helpLinks: { icon: IonName; label: string; href: Href }[] = [
    { icon: "help-circle-outline", label: t("screenFAQs"), href: "/faq" },
    { icon: "mail-outline", label: t("screenContact"), href: "/contact" },
    { icon: "chatbox-ellipses-outline", label: t("resourcesFeedback"), href: "/feedback" },
    { icon: "scale-outline", label: t("resourcesLegal"), href: "/legal" },
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

        <View style={styles.group}>
          <SectionHeading title={ac("Help and contact")} onDark />
          <View style={styles.helpGrid}>
            {helpLinks.map((link) => (
              <DepthPressable
                key={link.label}
                onPress={() => router.push(link.href)}
                face="rgba(255,255,255,0.08)"
                depthColor={colors.navyDeep}
                depth={3}
                radius={16}
                borderWidth={2}
                borderColor="rgba(255,255,255,0.14)"
                accessibilityLabel={link.label}
                style={styles.helpTile}
                innerStyle={styles.helpInner}
              >
                <Ionicons name={link.icon} size={18} color={colors.cyan} />
                <Text style={styles.helpText} numberOfLines={2}>
                  {link.label}
                </Text>
              </DepthPressable>
            ))}
          </View>
        </View>
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
  group: { marginTop: 28, paddingHorizontal: 16 },
  rows: { gap: 10, marginTop: 12 },
  helpGrid: { marginTop: 12, flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start", gap: 10 },
  helpTile: { width: "48%", flexGrow: 1 },
  helpInner: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 14, minHeight: 56 },
  helpText: { flex: 1, fontSize: 14, fontFamily: fontFamily.bold, color: colors.white },
});
