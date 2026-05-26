import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshGradientPrimaryButton } from "@/components/GshGradientPrimaryButton";
import {
  GshContentAccentBar,
  GshLinkRow,
  GshScreenIntro,
  GshSectionTitle,
  GshTopicChip,
} from "@/components/gsh-ui-kit";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { COMPARE_COUNTRY_DESTINATIONS } from "@/lib/compareCountries/destinations";
import { stackScrollContentStyle } from "@/lib/screen-layout";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";

const DIMENSIONS = [
  {
    title: "Role demand signals",
    body: "Volume varies by sector and visa route—pair job search trends with official occupation lists.",
  },
  {
    title: "Sponsorship realism",
    body: "Some markets lean on employer-led permits; others emphasise points or global talent streams. Country guides spell out what to verify first.",
  },
  {
    title: "Route complexity",
    body: "Processing times, dependants, and credential recognition differ sharply—compare before you commit application fees.",
  },
  {
    title: "Family implications",
    body: "School access, partner work rights, and healthcare eligibility often decide the move—factor them into your shortlist.",
  },
  {
    title: "Salary vs cost trade-offs",
    body: "Use the salary & currency converter alongside city-level research; headline salaries rarely tell the whole story.",
  },
];

const FAQS = [
  {
    q: "How should I use this page?",
    a: "Treat it as a routing layer: pick two or three countries, read their guides, then search jobs with sponsorship or relocation filters that match your situation.",
  },
  {
    q: "Is this legal advice?",
    a: "No. Always confirm eligibility, fees, and forms on official government portals or with a qualified adviser.",
  },
  {
    q: "Is Global Sponsor Hub free for candidates?",
    a: "Yes—candidate accounts and job search are free. Employer and partner products are billed separately.",
  },
];

export default function CompareCountriesScreen() {
  const router = useRouter();

  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
          <GshScreenIntro
            eyebrow="Decision support"
            title="Which country should you prioritise?"
            subtitle="Shortlist destinations using practical dimensions—then open country guides, jobs with filters, and tools for your situation."
            style={{ marginBottom: 10 }}
          />
          <GshContentAccentBar />
          <Text style={styles.updated}>Page last updated: 13 May 2026</Text>

          <GshSectionTitle title="Compare on these dimensions" topSpacing="sm" />
          {DIMENSIONS.map((d) => (
            <View key={d.title} style={[styles.dimCard, cardSurfaceStyle(true)]}>
              <Text style={styles.dimTitle}>{d.title}</Text>
              <Text style={styles.dimBody}>{d.body}</Text>
            </View>
          ))}

          <GshSectionTitle
            title="Open a destination hub"
            hint="Each hub links to filtered employer jobs and related guides on the website; in the app we open the matching country guide and jobs."
            topSpacing="md"
          />
          <View style={styles.chipRow}>
            {COMPARE_COUNTRY_DESTINATIONS.map((dest) => (
              <GshTopicChip
                key={dest.slug}
                label={dest.label}
                onPress={() => {
                  if (dest.guideSlug) {
                    router.push(`/guides/country/${dest.guideSlug}`);
                  } else {
                    router.push({ pathname: "/(tabs)/jobs", params: { location: dest.jobsLocation } });
                  }
                }}
              />
            ))}
          </View>

          <View style={styles.ctaBlock}>
            <GshGradientPrimaryButton title="Search all employer jobs" onPress={() => router.push("/(tabs)/jobs")} />
            <GshLinkRow
              title="Visa route wizard"
              subtitle="Sponsorship routes and next steps"
              icon="sparkles-outline"
              accent="teal"
              onPress={() => router.push("/visa-wizard")}
            />
            <GshLinkRow
              title="Salary & currency converter"
              subtitle="Compare headline pay across currencies"
              icon="cash-outline"
              accent="purple"
              onPress={() => router.push("/currency-converter")}
            />
            <GshLinkRow
              title="Guides hub"
              subtitle="Country guides and relocation topics"
              icon="map-outline"
              accent="purple"
              onPress={() => router.push("/guides")}
            />
          </View>

          <GshSectionTitle title="FAQs" topSpacing="md" />
          {FAQS.map((f) => (
            <View key={f.q} style={[styles.faqCard, cardSurfaceStyle(true)]}>
              <Text style={styles.faqQ}>{f.q}</Text>
              <Text style={styles.faqA}>{f.a}</Text>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </GshScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  pad: { ...stackScrollContentStyle, paddingBottom: 48, gap: 10 },
  updated: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.textMuted, marginBottom: 4 },
  dimCard: { padding: 14, borderRadius: radii.lg },
  dimTitle: { fontFamily: fontFamily.bold, fontSize: 15, color: colors.navy },
  dimBody: { marginTop: 6, fontFamily: fontFamily.regular, fontSize: 13, lineHeight: 20, color: colors.textMuted },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  ctaBlock: { marginTop: 12, gap: 10 },
  faqCard: { padding: 14, borderRadius: radii.lg },
  faqQ: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.navy },
  faqA: { marginTop: 6, fontFamily: fontFamily.regular, fontSize: 13, lineHeight: 20, color: colors.textMuted },
});
