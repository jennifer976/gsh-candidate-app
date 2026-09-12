import { useAppCopy } from "@/lib/i18n";
import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshLinkRow, GshSectionTitle } from "@/components/gsh-ui-kit";
import { GshDarkFeedHeading } from "@/components/GshDarkFeedHeading";
import { GshScreenShell } from "@/components/GshScreenShell";
import { stackScrollContentStyle } from "@/lib/screen-layout";
import { useRelocationPerksNav } from "@/lib/use-relocation-perks-nav";
import { fontFamily } from "@/lib/theme";

type RowDef = {
  title: string;
  subtitle: string;
  path?: string;
  icon: ComponentProps<typeof Ionicons>["name"];
  accent: "teal" | "purple" | "ocean";
};

/** Primary hub: career tools, guides, blog, legal — one screen for discoverability. */
export default function ToolsAndResourcesScreen() {
  const { t } = useAppCopy();
  const router = useRouter();
  const relocationPerksNav = useRelocationPerksNav();

  const resourceRows: RowDef[] = [
    {
      title: t("resourcesBlog"),
      subtitle: t("resourcesBlogHelp"),
      path: "blog",
      icon: "newspaper-outline",
      accent: "ocean",
    },
    {
      title: t("resourcesNews"),
      subtitle: t("resourcesNewsHelp"),
      path: "news",
      icon: "globe-outline",
      accent: "teal",
    },
    {
      title: t("screenFAQs"),
      subtitle: t("resourcesFaqHelp"),
      path: "faq",
      icon: "help-circle-outline",
      accent: "purple",
    },
    {
      title: t("screenContact"),
      subtitle: "support@globalsponsorhub.com",
      path: "contact",
      icon: "mail-outline",
      accent: "purple",
    },
  ];

  return (
    <GshScreenShell>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <ScrollView
          contentContainerStyle={styles.pad}
          showsVerticalScrollIndicator={false}
        >
          <GshDarkFeedHeading
            pageLead
            title={t("resourcesTitle")}
            subtitle={t("resourcesIntro")}
          />

          <GshSectionTitle title={t("resourcesCareer")} topSpacing="sm" />
          <GshLinkRow
            title={t("homeFind")}
            subtitle={t("jobsDirectDesc")}
            icon="briefcase-outline"
            accent="purple"
            onPress={() => router.push("/(tabs)/jobs")}
          />
          <GshLinkRow
            title={t("resourcesCompanies")}
            subtitle={t("resourcesCompaniesHelp")}
            icon="shield-checkmark-outline"
            accent="teal"
            onPress={() => router.push("/companies")}
          />
          <GshLinkRow
            title={t("resourcesToolkit")}
            subtitle={t("resourcesToolkitHelp")}
            icon="library-outline"
            accent="purple"
            onPress={() => router.push("/tools")}
          />

          <GshSectionTitle title={t("resourcesMove")} />
          <GshLinkRow
            title={t("resourcesSpecialists")}
            subtitle={t("resourcesSpecialistsHelp")}
            icon="people-outline"
            accent="purple"
            onPress={() => router.push("/partners")}
          />
          <GshLinkRow
            title={relocationPerksNav.title}
            subtitle={relocationPerksNav.subtitle}
            icon="airplane-outline"
            accent="teal"
            onPress={() => router.push("/relocation-perks")}
          />
          <GshLinkRow
            title={t("resourcesGuides")}
            subtitle={t("resourcesGuidesHelp")}
            icon="map-outline"
            accent="purple"
            onPress={() => router.push("/guides")}
          />
          <GshLinkRow
            title={t("resourcesCompare")}
            subtitle={t("resourcesCompareHelp")}
            icon="git-compare-outline"
            accent="teal"
            onPress={() => router.push("/compare-countries")}
          />
          <GshLinkRow
            title={t("resourcesSalary")}
            subtitle={t("resourcesSalaryHelp")}
            icon="cash-outline"
            accent="teal"
            onPress={() => router.push("/currency-converter")}
          />
          <GshLinkRow
            title={t("resourcesWorksheets")}
            subtitle={t("resourcesWorksheetsHelp")}
            icon="clipboard-outline"
            accent="ocean"
            onPress={() => router.push("/relocation-worksheets")}
          />

          <GshSectionTitle title={t("jobs")} />
          <GshLinkRow
            title={t("screenCuratedroles")}
            subtitle={t("resourcesExternalHelp")}
            icon="briefcase-outline"
            accent="ocean"
            onPress={() => router.push("/curated-listings")}
          />

          <GshSectionTitle title={t("resourcesReading")} />
          <GshLinkRow
            title={t("resourcesPractical")}
            subtitle={t("resourcesPracticalHelp")}
            icon="document-text-outline"
            accent="teal"
            onPress={() => router.push("/resources")}
          />
          <GshLinkRow
            title={t("resourcesLegal")}
            subtitle={t("resourcesLegalHelp")}
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

          <GshSectionTitle title={t("resourcesThisApp")} />
          <GshLinkRow
            title={t("resourcesFeedback")}
            subtitle={t("resourcesFeedbackHelp")}
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
