import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { cardSurfaceStyle, colors, fontFamily } from "@/lib/theme";

type IonName = ComponentProps<typeof Ionicons>["name"];

type RowDef = { title: string; subtitle: string; path?: string; icon: IonName; onPress?: () => void };

function HubLinkRow({
  title,
  subtitle,
  icon,
  onPress,
}: {
  title: string;
  subtitle: string;
  icon: IonName;
  onPress: () => void;
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
      <Ionicons name="chevron-forward" size={20} color={colors.placeholder} />
    </Pressable>
  );
}

/** Primary hub: career tools, guides, blog, legal — one screen for discoverability. */
export default function ToolsAndResourcesScreen() {
  const router = useRouter();

  const resourceRows: RowDef[] = [
    {
      title: "Blog",
      subtitle: "Editorial articles — same catalogue as globalsponsorhub.com when linked",
      path: "blog",
      icon: "newspaper-outline",
    },
    {
      title: "Immigration headlines",
      subtitle: "RSS from trusted publishers — opens publisher sites",
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

  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
          <View style={[styles.hero, cardSurfaceStyle(true)]}>
            <Text style={styles.heroEyebrow}>Global Sponsor Hub</Text>
            <Text style={styles.heroTitle}>Tools & resources</Text>
            <Text style={styles.heroBody}>
              Career tools, guides, visa planning, and reading — without leaving your signed-in session. Some links open the
              public website when needed.
            </Text>
          </View>

          <Text style={styles.section}>Career tools</Text>
          <HubLinkRow
            title="ATS match assistant"
            subtitle="Paste your CV and a job description — keyword alignment for employer systems"
            icon="document-text-outline"
            onPress={() => router.push("/ats-assistant")}
          />
          <HubLinkRow
            title="Career toolkit"
            subtitle="CV tips, profile strength, guides entry — full toolkit screen"
            icon="library-outline"
            onPress={() => router.push("/tools")}
          />

          <Text style={styles.section}>Guides & mobility</Text>
          <HubLinkRow
            title="Guides hub"
            subtitle="Country guides, sponsorship pillars, relocation topics"
            icon="map-outline"
            onPress={() => router.push("/guides")}
          />
          <HubLinkRow
            title="Visa wizard"
            subtitle="Interactive checklist — sponsorship routes and next steps"
            icon="sparkles-outline"
            onPress={() => router.push("/visa-wizard")}
          />

          <Text style={styles.section}>Jobs</Text>
          <HubLinkRow
            title="Curated listings"
            subtitle="Agency and partner-curated wider-web roles — not on the main employer job feed"
            icon="briefcase-outline"
            onPress={() => router.push("/curated-listings")}
          />

          <Text style={styles.section}>Reading & help</Text>
          <HubLinkRow
            title="Legal & policies"
            subtitle="Privacy, terms, cookies, acceptable use — in the app"
            icon="shield-checkmark-outline"
            onPress={() => router.push("/legal")}
          />
          {resourceRows.map((item) => (
            <HubLinkRow
              key={item.path ?? item.title}
              title={item.title}
              subtitle={item.subtitle}
              icon={item.icon}
              onPress={() => router.push(`/${item.path}`)}
            />
          ))}

          <Text style={styles.section}>This app</Text>
          <HubLinkRow
            title="Feedback & support"
            subtitle="Report bugs or suggest features"
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
