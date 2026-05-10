import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { navigateGuideLink } from "@/lib/guides/navigateGuideLink";
import { cardSurfaceStyle, colors, fontFamily } from "@/lib/theme";

type IonName = ComponentProps<typeof Ionicons>["name"];

type WebRow = { title: string; subtitle: string; path: string; icon: IonName };

const MORE_IN_APP_ROWS: WebRow[] = [
  {
    title: "Blog",
    subtitle: "Editorial articles — same catalogue as globalsponsorhub.com when linked",
    path: "blog",
    icon: "newspaper-outline",
  },
  {
    title: "Immigration headlines",
    subtitle: "RSS from trusted publishers — opens publisher articles only",
    path: "news",
    icon: "globe-outline",
  },
  {
    title: "FAQs",
    subtitle: "Candidate help topics",
    path: "faq",
    icon: "help-circle-outline",
  },
  {
    title: "Contact",
    subtitle: "Email support@globalsponsorhub.com",
    path: "contact",
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
              Guides, visa wizard, legal policies, blog, FAQs, and contact are built into this app so you can stay signed in.
              Some long reads open on our website in your browser when you choose that option.
            </Text>
          </View>

          <Text style={styles.section}>In the app</Text>
          <HubLinkRow
            title="Guides hub"
            subtitle="Country guides, topic summaries, relocation checklists"
            icon="map-outline"
            onPress={() => router.push("/guides")}
          />
          <HubLinkRow
            title="Visa wizard"
            subtitle="Interactive checklist — same flow as on our website"
            icon="sparkles-outline"
            onPress={() => router.push("/visa-wizard")}
          />

          <Text style={styles.section}>Jobs</Text>
          <HubLinkRow
            title="Curated external roles"
            subtitle="Opens your Jobs tab — switch to “External” at the top"
            icon="briefcase-outline"
            onPress={() => navigateGuideLink(router, "/jobs/external")}
          />

          <Text style={styles.section}>More in the app</Text>
          <HubLinkRow
            title="Legal & policies"
            subtitle="Privacy, terms, cookies, acceptable use — included in the app"
            icon="shield-checkmark-outline"
            onPress={() => router.push("/legal")}
          />
          <HubLinkRow
            title="Guides hub (again)"
            subtitle="Country corridors, pillars, relocation checklists"
            icon="folder-open-outline"
            onPress={() => router.push("/guides")}
          />
          {MORE_IN_APP_ROWS.map((item) => (
            <HubLinkRow
              key={item.path}
              title={item.title}
              subtitle={item.subtitle}
              icon={item.icon}
              onPress={() => router.push(`/${item.path}`)}
            />
          ))}

          <Text style={styles.section}>This app</Text>
          <HubLinkRow
            title="Feedback & support"
            subtitle="Report bugs, suggest features — goes straight to the team"
            icon="chatbox-ellipses-outline"
            onPress={() => router.push("/feedback")}
          />
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
});
