import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { marketingUrl } from "@/lib/marketing-links";
import { MARKETING_PATHS } from "@/lib/marketing-paths";
import { openMarketingBrowser } from "@/lib/openMarketingBrowser";
import { cardSurfaceStyle, colors, fontFamily } from "@/lib/theme";

type IonName = ComponentProps<typeof Ionicons>["name"];

type WebRow = { title: string; subtitle: string; path: string; icon: IonName };

const CURATED_JOBS: WebRow[] = [
  {
    title: "Curated external roles",
    subtitle: "Partner-sourced board on globalsponsorhub.com — opens in your browser",
    path: "/jobs/external",
    icon: "briefcase-outline",
  },
];

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
  trailingIcon,
}: {
  title: string;
  subtitle: string;
  icon: IonName;
  onPress: () => void;
  trailingIcon?: IonName;
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
      <Ionicons name={trailingIcon ?? "chevron-forward"} size={20} color={colors.placeholder} />
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
              Explore sponsorship-friendly mobility tools, guides, and the curated jobs board — the same trusted content
              as globalsponsorhub.com. Links open in your device browser so consent preferences and legal notices stay on the website.
            </Text>
          </View>

          <Text style={styles.section}>Sponsorship & visas</Text>
          <HubLinkRow
            title="Visa wizard"
            subtitle="Step-by-step questionnaire — opens on globalsponsorhub.com in your browser"
            icon="sparkles-outline"
            trailingIcon="chevron-forward"
            onPress={() => void openMarketingBrowser(MARKETING_PATHS.visaWizard)}
          />

          <Text style={styles.section}>Jobs</Text>
          {CURATED_JOBS.map((item) => (
            <HubLinkRow
              key={item.path}
              title={item.title}
              subtitle={item.subtitle}
              icon={item.icon}
              trailingIcon="chevron-forward"
              onPress={() => void openMarketingBrowser(item.path)}
            />
          ))}

          <Text style={styles.section}>Learn</Text>
          {WEB_LINKS.map((item) => (
            <HubLinkRow
              key={item.path}
              title={item.title}
              subtitle={item.subtitle}
              icon={item.icon}
              trailingIcon="chevron-forward"
              onPress={() => void openMarketingBrowser(item.path)}
            />
          ))}

          <Text style={styles.section}>Help</Text>
          {SUPPORT_WEB.map((item) => (
            <HubLinkRow
              key={item.path}
              title={item.title}
              subtitle={item.subtitle}
              icon={item.icon}
              trailingIcon="chevron-forward"
              onPress={() => void openMarketingBrowser(item.path)}
            />
          ))}

          <Text style={styles.section}>This app</Text>
          <HubLinkRow
            title="Feedback & support"
            subtitle="Report bugs, suggest features — goes straight to the team"
            icon="chatbox-ellipses-outline"
            onPress={() => router.push("/feedback")}
          />

          <Text style={styles.footnote}>Powered by {marketingUrl("/").replace(/^https:\/\//, "")}</Text>
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
