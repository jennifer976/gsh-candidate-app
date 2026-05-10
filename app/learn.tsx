import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { marketingUrl, openMarketingPath } from "@/lib/marketing-links";
import { cardSurfaceStyle, colors, fontFamily } from "@/lib/theme";

type IonName = ComponentProps<typeof Ionicons>["name"];

type WebRow = { title: string; subtitle: string; path: string; icon: IonName };

const WEB_LINKS: WebRow[] = [
  {
    title: "Guides",
    subtitle: "Visa & relocation guides, country hubs, and how-to paths",
    path: "/guides",
    icon: "map-outline",
  },
  {
    title: "Resources",
    subtitle: "Templates, checklists, and curated relocation resources",
    path: "/resources",
    icon: "folder-open-outline",
  },
  {
    title: "Blog",
    subtitle: "Articles on sponsorship, careers, and moving abroad",
    path: "/blog",
    icon: "newspaper-outline",
  },
  {
    title: "Global News",
    subtitle: "Updates and stories from the Global Sponsor Hub team",
    path: "/global-news",
    icon: "globe-outline",
  },
  {
    title: "Visa wizard",
    subtitle: "Interactive tool on the website — plan next steps in-browser",
    path: "/tools/visa-wizard",
    icon: "sparkles-outline",
  },
];

const SUPPORT_WEB: WebRow[] = [
  {
    title: "FAQs",
    subtitle: "Answers to common questions about accounts and sponsorship",
    path: "/faqs",
    icon: "help-circle-outline",
  },
  {
    title: "Contact",
    subtitle: "Reach the team — partnerships, press, and general enquiries",
    path: "/contact",
    icon: "mail-outline",
  },
];

function HubLinkRow({
  title,
  subtitle,
  icon,
  onPress,
  external,
}: {
  title: string;
  subtitle: string;
  icon: IonName;
  onPress: () => void;
  external?: boolean;
}) {
  return (
    <Pressable style={[styles.row, cardSurfaceStyle(true)]} onPress={onPress} accessibilityRole="button">
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={22} color={colors.brand} />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSub}>{subtitle}</Text>
      </View>
      <Ionicons name={external ? "open-outline" : "chevron-forward"} size={20} color={colors.placeholder} />
    </Pressable>
  );
}

export default function LearnHubScreen() {
  const router = useRouter();

  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
          <View style={[styles.hero, cardSurfaceStyle(true)]}>
            <Text style={styles.heroEyebrow}>Global Sponsor Hub</Text>
            <Text style={styles.heroTitle}>Guides, insight & support</Text>
            <Text style={styles.heroBody}>
              The same relocation guides, resource hub, blog, and news as on the website — comfortable reading in your
              browser.
            </Text>
          </View>

          <Text style={styles.section}>Learn</Text>
          {WEB_LINKS.map((item) => (
            <HubLinkRow
              key={item.path}
              title={item.title}
              subtitle={item.subtitle}
              icon={item.icon}
              external
              onPress={() => void openMarketingPath(item.path)}
            />
          ))}

          <Text style={styles.section}>Help</Text>
          {SUPPORT_WEB.map((item) => (
            <HubLinkRow
              key={item.path}
              title={item.title}
              subtitle={item.subtitle}
              icon={item.icon}
              external
              onPress={() => void openMarketingPath(item.path)}
            />
          ))}

          <Text style={styles.section}>This app</Text>
          <HubLinkRow
            title="Feedback & support"
            subtitle="Report bugs, suggest features — goes straight to the team"
            icon="chatbox-ellipses-outline"
            onPress={() => router.push("/feedback")}
          />

          <Text style={styles.footnote}>Opens {marketingUrl("/").replace(/^https:\/\//, "")} in your browser.</Text>
        </ScrollView>
      </SafeAreaView>
    </GshScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  pad: { padding: 16, paddingBottom: 48, gap: 10 },
  hero: {
    padding: 18,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.teal,
  },
  heroEyebrow: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 22,
    fontFamily: fontFamily.extraBold,
    color: colors.textPrimary,
    letterSpacing: -0.35,
    marginBottom: 10,
  },
  heroBody: {
    fontSize: 15,
    fontFamily: fontFamily.regular,
    color: colors.textMarketing,
    lineHeight: 22,
  },
  section: {
    marginTop: 18,
    marginBottom: 6,
    fontSize: 12,
    fontFamily: fontFamily.bold,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: colors.purpleMuted,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.purpleBorder,
  },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 16, fontFamily: fontFamily.bold, color: colors.textPrimary },
  rowSub: { marginTop: 4, fontSize: 14, fontFamily: fontFamily.regular, color: colors.textMuted, lineHeight: 19 },
  footnote: {
    marginTop: 20,
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: colors.placeholder,
    textAlign: "center",
    lineHeight: 18,
  },
});
