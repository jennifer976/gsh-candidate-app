import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { fetchPublicSponsorCompanyBySlug } from "@/lib/api-client";
import { openExternalUrlInApp } from "@/lib/openMarketingBrowser";
import { stackScrollContentStyle } from "@/lib/screen-layout";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";

export default function CompanyDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const query = useQuery({
    queryKey: ["sponsor-company", slug],
    queryFn: () => fetchPublicSponsorCompanyBySlug(String(slug)),
    enabled: !!slug,
  });
  const company = query.data?.company;
  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        {query.isLoading ? <ActivityIndicator style={styles.loading} color={colors.brand} /> : (
          <ScrollView contentContainerStyle={styles.pad}>
            {!company ? <Text style={styles.error}>This company record is unavailable.</Text> : (
              <>
                <Text style={styles.eyebrow}>Sponsor-register company</Text>
                <Text style={styles.heading}>{company.companyName}</Text>
                <Text style={styles.lead}>Verify the legal name and role-specific sponsorship details before applying.</Text>
                <View style={[styles.card, cardSurfaceStyle(true)]}>
                  {[
                    ["Status", company.sponsorStatus],
                    ["Location", [company.city, company.country].filter(Boolean).join(", ")],
                    ["Visa route", company.visaRoute],
                    ["Source", company.sourceName],
                    ["Source date", company.sourceDate ? new Date(company.sourceDate).toLocaleDateString() : ""],
                  ].filter(([, value]) => value).map(([label, value]) => (
                    <View key={label} style={styles.row}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value}</Text></View>
                  ))}
                  {company.sourceUrl ? (
                    <Pressable style={styles.button} onPress={() => openExternalUrlInApp(company.sourceUrl!)}>
                      <Text style={styles.buttonText}>Check official source</Text>
                    </Pressable>
                  ) : null}
                </View>
              </>
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </GshScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  loading: { marginTop: 50 },
  pad: { ...stackScrollContentStyle, paddingBottom: 40 },
  eyebrow: { color: colors.teal, fontFamily: fontFamily.bold, textTransform: "uppercase", fontSize: 12, letterSpacing: 0.8 },
  heading: { color: colors.white, fontFamily: fontFamily.bold, fontSize: 28, marginTop: 8 },
  lead: { color: "rgba(255,255,255,0.7)", fontFamily: fontFamily.regular, lineHeight: 21, marginTop: 10, marginBottom: 18 },
  card: { padding: 18, borderRadius: radii.lg, gap: 12 },
  row: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border, paddingBottom: 10 },
  label: { color: colors.textMuted, fontFamily: fontFamily.semiBold, fontSize: 12 },
  value: { color: colors.navy, fontFamily: fontFamily.regular, fontSize: 15, marginTop: 3 },
  button: { backgroundColor: colors.brand, borderRadius: radii.pill, alignItems: "center", padding: 13, marginTop: 4 },
  buttonText: { color: colors.white, fontFamily: fontFamily.bold },
  error: { color: colors.white, fontFamily: fontFamily.regular, textAlign: "center", marginTop: 50 },
});
