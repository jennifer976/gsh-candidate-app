import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshContentAccentBar, GshScreenIntro } from "@/components/gsh-ui-kit";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { fetchPublicSponsorCompanies } from "@/lib/api-client";
import { getMarketingSiteUrl } from "@/lib/config";
import { openExternalUrlInApp } from "@/lib/openMarketingBrowser";
import { stackScrollContentStyle } from "@/lib/screen-layout";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";
import type { SponsorCompany } from "@/types/models";

function locationLabel(company: SponsorCompany): string {
  return [company.city, company.country].filter(Boolean).join(", ");
}

function officialRegisterHref(query: string): string {
  const q = query.toLowerCase();
  if (q.includes("ireland")) return "https://enterprise.gov.ie/en/what-we-do/workplace-and-skills/employment-permits/";
  if (q.includes("netherlands")) return "https://ind.nl/en/public-register-recognised-sponsors";
  return "https://www.gov.uk/government/publications/register-of-licensed-sponsors-workers";
}

function SponsorCompanyCard({ company, cta = "Open sponsor listing" }: { company: SponsorCompany; cta?: string }) {
  return (
    <Pressable
      style={[styles.resultCard, cardSurfaceStyle(true)]}
      onPress={() => openExternalUrlInApp(`${getMarketingSiteUrl()}/companies/${encodeURIComponent(company.slug)}`)}
      accessibilityRole="button"
    >
      <View style={styles.resultIcon}>
        <Ionicons name="checkmark-circle-outline" size={22} color={colors.brand} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.resultTitle}>{company.companyName}</Text>
        <Text style={styles.resultMeta}>
          {[company.sponsorStatus || "Listed", company.visaRoute, locationLabel(company)]
            .filter(Boolean)
            .join(" · ")}
        </Text>
        {company.aliases?.length ? (
          <Text style={styles.aliases}>Also searched as: {company.aliases.slice(0, 3).join(", ")}</Text>
        ) : null}
        <Text style={styles.resultCta}>{cta} →</Text>
      </View>
    </Pressable>
  );
}

export default function VisaCheckerScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const activeQuery = query.trim();
  const sponsorQuery = useQuery({
    queryKey: ["sponsor-companies", activeQuery],
    queryFn: () => fetchPublicSponsorCompanies({ q: activeQuery, perPage: 12 }),
    enabled: activeQuery.length >= 2,
  });
  const results = useMemo(() => sponsorQuery.data?.data ?? [], [sponsorQuery.data?.data]);
  const possibleMatches = useMemo(() => sponsorQuery.data?.possibleMatches ?? [], [sponsorQuery.data?.possibleMatches]);

  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <ScrollView contentContainerStyle={styles.pad} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <GshScreenIntro
            eyebrow="Tools"
            title="Company visa sponsor checker"
            subtitle="Search sponsor-register data before you spend time on an application."
            style={{ marginBottom: 10 }}
          />
          <GshContentAccentBar />

          <View style={[styles.searchCard, cardSurfaceStyle(true)]}>
            <Text style={styles.label}>Company name</Text>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={18} color={colors.textMuted} />
              <TextInput
                style={styles.input}
                value={query}
                onChangeText={setQuery}
                placeholder="Search a company, e.g. Booking.com"
                placeholderTextColor={colors.placeholder}
                autoCapitalize="none"
                accessibilityLabel="Search company sponsor data"
              />
            </View>
            <Text style={styles.hint}>
              This is a starting point, not a final answer. Sponsorship depends on the exact role and current official register.
            </Text>
          </View>

          {activeQuery.length < 2 ? (
            <View style={[styles.emptyCard, cardSurfaceStyle(false)]}>
              <Text style={styles.emptyText}>Type at least two characters. If a brand name does not work, try the legal company name.</Text>
            </View>
          ) : sponsorQuery.isLoading ? (
            <View style={styles.loading}>
              <ActivityIndicator color={colors.brand} />
              <Text style={styles.loadingText}>Checking sponsor-register data...</Text>
            </View>
          ) : sponsorQuery.isError ? (
            <View style={[styles.emptyCard, cardSurfaceStyle(false)]}>
              <Text style={styles.emptyTitle}>Could not check sponsor data</Text>
              <Pressable onPress={() => sponsorQuery.refetch()} accessibilityRole="button">
                <Text style={styles.linkText}>Try again</Text>
              </Pressable>
            </View>
          ) : results.length === 0 ? (
            <View style={styles.resultsBlock}>
              <View style={[styles.emptyCard, cardSurfaceStyle(false)]}>
                <Text style={styles.emptyTitle}>No exact match for “{activeQuery}”.</Text>
                <Text style={styles.emptyText}>
                  That does not mean the company cannot sponsor. Try a shorter name or check an official register.
                </Text>
                <Pressable onPress={() => openExternalUrlInApp(officialRegisterHref(activeQuery))} accessibilityRole="link">
                  <Text style={styles.linkText}>Check official sponsor register →</Text>
                </Pressable>
              </View>
              {possibleMatches.length ? (
                <View style={styles.resultsBlock}>
                  <Text style={styles.sectionTitle}>Possible registered-name matches</Text>
                  {possibleMatches.map((company) => (
                    <SponsorCompanyCard key={company.slug} company={company} cta="Check this possible match" />
                  ))}
                </View>
              ) : null}
            </View>
          ) : (
            <View style={styles.resultsBlock}>
              <Text style={styles.sectionTitle}>Matches</Text>
              {results.map((company) => (
                <SponsorCompanyCard key={company.slug} company={company} />
              ))}
            </View>
          )}

          <View style={[styles.nextCard, cardSurfaceStyle(false)]}>
            <Pressable onPress={() => router.push("/(tabs)/jobs")} accessibilityRole="button">
              <Text style={styles.nextLink}>Browse current sponsored jobs</Text>
            </Pressable>
            <Pressable onPress={() => router.push("/guides")} accessibilityRole="button">
              <Text style={styles.nextLink}>Read candidate guides</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </GshScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  pad: { ...stackScrollContentStyle, gap: 14, paddingBottom: 40 },
  searchCard: { padding: 16, borderRadius: radii.lg },
  label: { fontSize: 12, fontFamily: fontFamily.bold, color: colors.textMuted, textTransform: "uppercase", letterSpacing: 0.8 },
  searchBox: { marginTop: 10, flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, paddingHorizontal: 12, backgroundColor: colors.white },
  input: { flex: 1, minHeight: 48, fontFamily: fontFamily.medium, color: colors.textPrimary, fontSize: 15 },
  hint: { marginTop: 10, fontSize: 13, fontFamily: fontFamily.regular, color: colors.textMuted, lineHeight: 19 },
  emptyCard: { padding: 16, borderRadius: radii.lg },
  emptyTitle: { fontSize: 15, fontFamily: fontFamily.bold, color: colors.navy, marginBottom: 8 },
  emptyText: { fontSize: 14, fontFamily: fontFamily.regular, color: colors.textMuted, lineHeight: 20 },
  loading: { alignItems: "center", gap: 10, paddingVertical: 28 },
  loadingText: { fontSize: 14, fontFamily: fontFamily.medium, color: colors.textMuted },
  linkText: { marginTop: 10, fontSize: 14, fontFamily: fontFamily.bold, color: colors.brand },
  resultsBlock: { gap: 12 },
  sectionTitle: { fontSize: 14, fontFamily: fontFamily.bold, color: colors.white, marginLeft: 4 },
  resultCard: { flexDirection: "row", gap: 12, padding: 14, borderRadius: radii.lg },
  resultIcon: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(14, 205, 209, 0.12)" },
  resultTitle: { fontSize: 16, fontFamily: fontFamily.bold, color: colors.navy },
  resultMeta: { marginTop: 4, fontSize: 13, fontFamily: fontFamily.regular, color: colors.textSecondary, lineHeight: 18 },
  aliases: { marginTop: 4, fontSize: 12, fontFamily: fontFamily.regular, color: colors.textMuted },
  resultCta: { marginTop: 8, fontSize: 13, fontFamily: fontFamily.bold, color: colors.brand },
  nextCard: { padding: 16, borderRadius: radii.lg, gap: 10 },
  nextLink: { fontSize: 14, fontFamily: fontFamily.bold, color: colors.brand },
});
