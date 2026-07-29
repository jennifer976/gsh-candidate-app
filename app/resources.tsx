import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshLinkRow, GshSectionTitle } from "@/components/gsh-ui-kit";
import { GshDarkFeedHeading } from "@/components/GshDarkFeedHeading";
import { GshScreenShell } from "@/components/GshScreenShell";
import { getMarketingSiteUrl } from "@/lib/config";
import { openExternalUrlInApp } from "@/lib/openMarketingBrowser";
import { stackScrollContentStyle } from "@/lib/screen-layout";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";

const PRACTICAL_RESOURCES = [
  ["Job offer scam checklist", "Verify an international offer before sharing documents or money.", "job-offer-scam-checklist"],
  ["Employer verification email", "A copy-ready template for confirming the employer and sponsorship route.", "employer-verification-email-template"],
  ["Relocation budget checklist", "Plan visas, flights, housing, healthcare, and an emergency buffer.", "relocation-budget-checklist"],
  ["First 90 days checklist", "A week-by-week relocation and onboarding checklist.", "first-90-days-relocation-checklist"],
] as const;

export default function ResourcesScreen() {
  const router = useRouter();
  const openResource = (slug: string) =>
    openExternalUrlInApp(`${getMarketingSiteUrl()}/resources/${encodeURIComponent(slug)}`);

  return (
    <GshScreenShell>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
          <GshDarkFeedHeading
            pageLead
            title="Practical resources"
            subtitle="Checklists, templates, and a private application tracker for your international search."
          />
          <View style={[styles.note, cardSurfaceStyle(false)]}>
            <Ionicons name="shield-checkmark-outline" size={22} color={colors.teal} />
            <Text style={styles.noteText}>
              Resource details open on the exact first-party GSH page inside the app, so the website remains the canonical source.
            </Text>
          </View>

          <GshSectionTitle title="Your workspace" onDark />
          <GshLinkRow
            title="Application tracker"
            subtitle="Track companies, roles, destinations, and progress using your GSH account."
            icon="list-outline"
            accent="teal"
            onPress={() => router.push("/application-tracker")}
          />

          <GshSectionTitle title="Checklists & templates" onDark />
          {PRACTICAL_RESOURCES.map(([title, subtitle, slug]) => (
            <GshLinkRow
              key={slug}
              title={title}
              subtitle={subtitle}
              icon="document-text-outline"
              accent="ocean"
              onPress={() => openResource(slug)}
            />
          ))}

          <GshSectionTitle title="Community" onDark />
          <GshLinkRow
            title="Grow Your Network"
            subtitle="Coming soon — view the current first-party launch page."
            icon="people-circle-outline"
            accent="purple"
            onPress={() => openExternalUrlInApp(`${getMarketingSiteUrl()}/grow-your-network`)}
          />
        </ScrollView>
      </SafeAreaView>
    </GshScreenShell>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  pad: { ...stackScrollContentStyle, gap: 12 },
  note: { flexDirection: "row", gap: 12, padding: 14, borderRadius: radii.lg, backgroundColor: colors.background },
  noteText: { flex: 1, fontFamily: fontFamily.regular, fontSize: 13, lineHeight: 19, color: colors.textSecondary },
});
