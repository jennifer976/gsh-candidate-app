import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshLinkRow, GshSectionTitle } from "@/components/gsh-ui-kit";
import { GshDarkFeedHeading } from "@/components/GshDarkFeedHeading";
import { GshScreenShell } from "@/components/GshScreenShell";
import { stackScrollContentStyle } from "@/lib/screen-layout";
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
    <GshScreenShell>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
          <GshDarkFeedHeading
            pageLead
            title="Tools & resources"
            subtitle="Visa wizard, ATS, guides, directory, and more"
          />

          <GshSectionTitle title="Key tools" topSpacing="sm" onDark />
          <GshLinkRow
            title="Partner directory"
            subtitle="Relocation, legal, and mobility specialists"
            icon="people-outline"
            accent="purple"
            onPress={() => router.push("/partners")}
          />
          <GshLinkRow
            title="Relocation perks"
            subtitle="Affiliate offers for your move — coming soon"
            icon="airplane-outline"
            accent="teal"
            onPress={() => router.push("/relocation-perks")}
          />
          <GshLinkRow
            title="Visa wizard"
            subtitle="Sponsorship routes and next steps"
            icon="sparkles-outline"
            accent="teal"
            onPress={() => router.push("/visa-wizard")}
          />
          <GshLinkRow
            title="ATS match assistant"
            subtitle="Match your CV to a job description"
            icon="document-text-outline"
            accent="teal"
            onPress={() => router.push("/ats-assistant")}
          />

          <GshSectionTitle title="More tools" onDark />
          <GshLinkRow
            title="Career toolkit"
            subtitle="CV tips and profile strength"
            icon="library-outline"
            accent="purple"
            onPress={() => router.push("/tools")}
          />
          <GshLinkRow
            title="Guides hub"
            subtitle="Country guides and relocation topics"
            icon="map-outline"
            accent="purple"
            onPress={() => router.push("/guides")}
          />

          <GshSectionTitle title="Jobs" onDark />
          <GshLinkRow
            title="Curated listings"
            subtitle="Agency and partner-curated roles — separate from the main employer feed"
            icon="briefcase-outline"
            accent="ocean"
            onPress={() => router.push("/curated-listings")}
          />

          <GshSectionTitle title="Reading & help" onDark />
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

          <GshSectionTitle title="This app" onDark />
          <GshLinkRow
            title="Feedback & support"
            subtitle="Report bugs or suggest features"
            icon="chatbox-ellipses-outline"
            accent="teal"
            onPress={() => router.push("/feedback")}
          />
        </ScrollView>
      </SafeAreaView>
    </GshScreenShell>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  pad: { ...stackScrollContentStyle, gap: 12 },
});
