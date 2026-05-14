import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshNavyHeroCard, GshLinkRow, GshSectionTitle } from "@/components/gsh-ui-kit";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { fontFamily } from "@/lib/theme";

type RowDef = { title: string; subtitle: string; path?: string; icon: ComponentProps<typeof Ionicons>["name"]; accent: "teal" | "purple" | "ocean" };

/** Primary hub: career tools, guides, blog, legal — one screen for discoverability. */
export default function ToolsAndResourcesScreen() {
  const router = useRouter();

  const resourceRows: RowDef[] = [
    {
      title: "Blog",
      subtitle: "Editorial articles from the team and partners",
      path: "blog",
      icon: "newspaper-outline",
      accent: "ocean",
    },
    {
      title: "Immigration headlines",
      subtitle: "RSS from trusted publishers — opens in browser",
      path: "news",
      icon: "globe-outline",
      accent: "teal",
    },
    {
      title: "FAQs",
      subtitle: "Candidate help topics",
      path: "faq",
      icon: "help-circle-outline",
      accent: "purple",
    },
    {
      title: "Contact",
      subtitle: "support@globalsponsorhub.com",
      path: "contact",
      icon: "mail-outline",
      accent: "purple",
    },
  ];

  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
          <GshNavyHeroCard
            title="Tools & resources"
            footer={
              <View style={styles.heroFoot}>
                <Ionicons name="sparkles" size={16} color="rgba(255,255,255,0.9)" />
                <Text style={styles.heroFootText}>Built for mobile-first workflows</Text>
              </View>
            }
          >
            Career tools, guides, visa planning, and reading — without leaving your session. External links open in-app browser when needed.
          </GshNavyHeroCard>

          <GshSectionTitle title="Career tools" topSpacing="none" />
          <GshLinkRow
            title="ATS match assistant"
            subtitle="Paste your CV and a job description — keyword alignment for employer systems"
            icon="document-text-outline"
            accent="teal"
            onPress={() => router.push("/ats-assistant")}
          />
          <GshLinkRow
            title="Career toolkit"
            subtitle="CV tips, profile strength, and the full toolkit screen"
            icon="library-outline"
            accent="purple"
            onPress={() => router.push("/tools")}
          />

          <GshSectionTitle title="Guides & mobility" />
          <GshLinkRow
            title="Guides hub"
            subtitle="Country guides, sponsorship pillars, relocation topics"
            icon="map-outline"
            accent="purple"
            onPress={() => router.push("/guides")}
          />
          <GshLinkRow
            title="Visa wizard"
            subtitle="Interactive checklist — sponsorship routes and next steps"
            icon="sparkles-outline"
            accent="teal"
            onPress={() => router.push("/visa-wizard")}
          />

          <GshSectionTitle title="Jobs" />
          <GshLinkRow
            title="Curated listings"
            subtitle="Agency and partner-curated roles — separate from the main employer feed"
            icon="briefcase-outline"
            accent="ocean"
            onPress={() => router.push("/curated-listings")}
          />

          <GshSectionTitle title="Reading & help" />
          <GshLinkRow
            title="Legal & policies"
            subtitle="Privacy, terms, cookies, and acceptable use"
            icon="shield-checkmark-outline"
            accent="purple"
            onPress={() => router.push("/legal")}
          />
          {resourceRows.map((item) => (
            <GshLinkRow
              key={item.path ?? item.title}
              title={item.title}
              subtitle={item.subtitle}
              icon={item.icon}
              accent={item.accent}
              onPress={() => router.push(`/${item.path}`)}
            />
          ))}

          <GshSectionTitle title="This app" />
          <GshLinkRow
            title="Feedback & support"
            subtitle="Report bugs or suggest features"
            icon="chatbox-ellipses-outline"
            accent="teal"
            onPress={() => router.push("/feedback")}
          />
        </ScrollView>
      </SafeAreaView>
    </GshScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  pad: { padding: 16, paddingBottom: 48, gap: 12 },
  heroFoot: { flexDirection: "row", alignItems: "center", gap: 8 },
  heroFootText: {
    fontSize: 13,
    fontFamily: fontFamily.medium,
    color: "rgba(255,255,255,0.82)",
  },
});
