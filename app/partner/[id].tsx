import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CompanyLogo } from "@/components/CompanyLogo";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { fetchPartnerById } from "@/lib/api-client";
import { resolvePartnerListLogo } from "@/lib/brand-logo";
import { openExternalUrlInApp } from "@/lib/openMarketingBrowser";
import { stackScrollContentStyle } from "@/lib/screen-layout";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";

export default function PartnerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useQuery({ queryKey: ["partner", id], queryFn: () => fetchPartnerById(String(id)), enabled: !!id });
  const partner = query.data?.data;
  const actionUrl = partner?.directoryCtaUrl || partner?.companyWebsite;
  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        {query.isLoading ? <ActivityIndicator style={styles.loading} color={colors.brand} /> : (
          <ScrollView contentContainerStyle={styles.pad}>
            {!partner ? <Text style={styles.error}>This partner profile is unavailable.</Text> : (
              <>
                <View style={styles.hero}>
                  <CompanyLogo logoUrl={resolvePartnerListLogo(partner)} companyName={partner.businessName} size={68} radius={16} />
                  <View style={styles.heroText}>
                    <Text style={styles.title}>{partner.businessName}</Text>
                    <Text style={styles.category}>{partner.category}</Text>
                    {partner.location ? <Text style={styles.location}>{partner.location}</Text> : null}
                  </View>
                </View>
                <View style={[styles.card, cardSurfaceStyle(true)]}>
                  <Text style={styles.description}>{partner.bio || partner.companyDescription}</Text>
                  {partner.expertiseIndustries?.length ? <Text style={styles.meta}>Expertise: {partner.expertiseIndustries.join(", ")}</Text> : null}
                  {partner.jobFunctions?.length ? <Text style={styles.meta}>Services: {partner.jobFunctions.join(", ")}</Text> : null}
                  {actionUrl ? (
                    <Pressable style={styles.button} onPress={() => openExternalUrlInApp(/^https?:/i.test(actionUrl) ? actionUrl : `https://${actionUrl}`)}>
                      <Text style={styles.buttonText}>{partner.directoryCtaLabel || "Visit company site"}</Text>
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
  hero: { flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 18 },
  heroText: { flex: 1 },
  title: { color: colors.white, fontFamily: fontFamily.bold, fontSize: 25 },
  category: { color: colors.teal, fontFamily: fontFamily.semiBold, marginTop: 5 },
  location: { color: "rgba(255,255,255,0.65)", fontFamily: fontFamily.regular, marginTop: 4 },
  card: { padding: 18, borderRadius: radii.lg, gap: 14 },
  description: { color: colors.textSecondary, fontFamily: fontFamily.regular, fontSize: 15, lineHeight: 22 },
  meta: { color: colors.navy, fontFamily: fontFamily.semiBold, fontSize: 13, lineHeight: 19 },
  button: { backgroundColor: colors.brand, borderRadius: radii.pill, alignItems: "center", padding: 13 },
  buttonText: { color: colors.white, fontFamily: fontFamily.bold },
  error: { color: colors.white, textAlign: "center", marginTop: 50, fontFamily: fontFamily.regular },
});
