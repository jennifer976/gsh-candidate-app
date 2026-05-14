import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GshGradientPrimaryButton } from "@/components/GshGradientPrimaryButton";
import { GshSectionTitle } from "@/components/gsh-ui-kit";
import { GshScreenBackground } from "@/components/GshScreenBackground";
import { curatedListingPrimaryBadge, normalizeAgencyWebsite } from "@/lib/curated-listing-labels";
import { fetchPublicExternalJobById, recordExternalApplyClick } from "@/lib/api-client";
import { openExternalHttpsUrl } from "@/lib/openMarketingBrowser";
import { cardCuratedSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";
import type { ExternalJobListingPublic } from "@/types/models";

export default function ExternalJobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const listingId = String(id || "");

  const query = useQuery({
    queryKey: ["external-job", listingId],
    queryFn: () => fetchPublicExternalJobById(listingId),
    enabled: !!listingId.trim(),
  });

  const applyMut = useMutation({
    mutationFn: async () => {
      const r = await recordExternalApplyClick(listingId);
      const url = typeof r.applyUrl === "string" ? r.applyUrl.trim() : "";
      if (!url || !/^https?:\/\//i.test(url)) {
        throw new Error("No valid apply URL for this listing.");
      }
      await openExternalHttpsUrl(url);
    },
    onError: (e: unknown) =>
      Alert.alert(
        "Could not open apply link",
        e instanceof Error ? e.message : "Try again from the Jobs tab.",
        [{ text: "OK" }]
      ),
  });

  if (!listingId.trim()) {
    return (
      <GshScreenBackground>
        <SafeAreaView style={styles.safe} edges={["bottom"]}>
          <View style={styles.center}>
            <Ionicons name="link-outline" size={44} color={colors.borderStrong} />
            <Text style={styles.errTitle}>This listing link is not valid.</Text>
            <Pressable style={styles.secondaryBtn} onPress={() => router.back()} accessibilityRole="button">
              <Text style={styles.secondaryBtnText}>Go back</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </GshScreenBackground>
    );
  }

  if (query.isLoading) {
    return (
      <GshScreenBackground>
        <SafeAreaView style={styles.safe} edges={["bottom"]}>
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.brand} />
            <Text style={styles.loadingHint}>Loading listing…</Text>
          </View>
        </SafeAreaView>
      </GshScreenBackground>
    );
  }

  if (query.isError || query.data == null) {
    return (
      <GshScreenBackground>
        <SafeAreaView style={styles.safe} edges={["bottom"]}>
          <View style={styles.center}>
            <Ionicons name="document-text-outline" size={44} color={colors.borderStrong} />
            <Text style={styles.errTitle}>This curated role could not be loaded.</Text>
            <Text style={styles.errSub}>Check your connection and try again.</Text>
            <Pressable style={styles.secondaryBtn} onPress={() => void query.refetch()} accessibilityRole="button">
              <Text style={styles.secondaryBtnText}>Retry</Text>
            </Pressable>
            <Pressable style={styles.secondaryBtnMuted} onPress={() => router.back()} accessibilityRole="button">
              <Text style={styles.secondaryBtnMutedText}>Go back</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </GshScreenBackground>
    );
  }

  const listing = query.data;
  const primaryBadge = curatedListingPrimaryBadge(listing);
  const agencySiteUrl = normalizeAgencyWebsite(listing.agencyWebsite);

  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
          <View style={[styles.heroShell, cardCuratedSurfaceStyle(true)]}>
            <View style={styles.heroAccent} />
            <View style={styles.heroInner}>
              <View style={styles.badgeRow}>
                <View style={[styles.badge, primaryBadge === "Agency" && styles.badgeAgency]}>
                  <Text style={[styles.badgeText, primaryBadge === "Agency" && styles.badgeTextAgency]}>
                    {primaryBadge === "Agency" ? "Agency listing" : "GSH curated"}
                  </Text>
                </View>
                {listing.isFeatured ? (
                  <View style={[styles.badge, styles.badgeFeatured]}>
                    <Text style={styles.badgeTextFeatured}>Featured</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.title}>{listing.title}</Text>
              <Text style={styles.company}>{listing.companyName}</Text>
              <Text style={styles.meta}>{[listing.location, listing.country].filter(Boolean).join(" · ")}</Text>
              {(listing.sponsorshipAvailable || listing.relocationAvailable) && (
                <Text style={styles.tags}>
                  {listing.sponsorshipAvailable ? "Sponsorship noted · " : ""}
                  {listing.relocationAvailable ? "Relocation support noted" : ""}
                </Text>
              )}
            </View>
          </View>

          {listing.summary ? (
            <>
              <GshSectionTitle title="Summary" topSpacing="sm" />
              <Text style={styles.body}>{listing.summary}</Text>
            </>
          ) : null}

          {listing.mobilityTags && listing.mobilityTags.length > 0 ? (
            <>
              <GshSectionTitle title="Mobility" />
              <Text style={styles.body}>{listing.mobilityTags.join(" · ")}</Text>
            </>
          ) : null}

          {listing.agencyName ? (
            <Text style={styles.agencyLine}>Listed via {listing.agencyName}</Text>
          ) : null}

          {agencySiteUrl ? (
            <Pressable
              style={styles.agencyContactBtn}
              onPress={() => void openExternalHttpsUrl(agencySiteUrl)}
              accessibilityRole="link"
              accessibilityLabel="Contact agency website"
            >
              <Ionicons name="business-outline" size={18} color={colors.brand} />
              <Text style={styles.agencyContactText}>Contact agency</Text>
              <Ionicons name="open-outline" size={16} color={colors.placeholder} />
            </Pressable>
          ) : null}

          <Text style={styles.disclaimer}>
            You apply on the employer’s site (ATS). We open their official apply link in a secure browser window — Global
            Sponsor Hub cannot submit your CV on your behalf for curated listings.
          </Text>

          <View style={styles.actions}>
            <GshGradientPrimaryButton
              title={applyMut.isPending ? "Opening apply…" : "Apply on employer site"}
              onPress={() => applyMut.mutate()}
              disabled={applyMut.isPending}
            />
            <Pressable style={styles.outlineBtn} onPress={() => router.push("/curated-listings")} accessibilityRole="button">
              <Text style={styles.outlineBtnText}>Back to curated listings</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </GshScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  pad: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, gap: 12 },
  loadingHint: { fontFamily: fontFamily.medium, fontSize: 15, color: colors.textMuted },
  errTitle: {
    color: colors.navy,
    textAlign: "center",
    fontSize: 17,
    fontFamily: fontFamily.bold,
    marginBottom: 8,
  },
  errSub: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  heroShell: { flexDirection: "row", marginBottom: 12, borderRadius: radii.lg, overflow: "hidden" },
  heroAccent: { width: 5, backgroundColor: colors.purple },
  heroInner: { flex: 1, padding: 18 },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: colors.purpleMuted,
    borderWidth: 1,
    borderColor: colors.purpleBorder,
  },
  badgeText: { fontSize: 12, fontFamily: fontFamily.bold, color: colors.purpleTextDark },
  badgeAgency: { backgroundColor: colors.purpleMuted, borderColor: colors.purpleBorder },
  badgeTextAgency: { color: colors.purpleTextDark },
  badgeFeatured: { backgroundColor: "rgba(14, 205, 209, 0.14)", borderColor: "rgba(14, 205, 209, 0.45)" },
  badgeTextFeatured: { fontSize: 12, fontFamily: fontFamily.bold, color: colors.textMarketing },
  title: { fontSize: 22, fontFamily: fontFamily.extraBold, color: colors.navy, letterSpacing: -0.35 },
  company: { marginTop: 10, fontSize: 17, fontFamily: fontFamily.semiBold, color: colors.textMarketing },
  meta: { marginTop: 8, fontSize: 14, fontFamily: fontFamily.regular, color: colors.textMuted },
  tags: { marginTop: 10, fontSize: 14, fontFamily: fontFamily.medium, color: colors.teal },
  body: {
    marginTop: 8,
    fontSize: 15,
    fontFamily: fontFamily.regular,
    color: colors.textMarketing,
    lineHeight: 23,
  },
  agencyLine: { marginTop: 14, fontSize: 13, fontFamily: fontFamily.medium, color: colors.textMuted },
  agencyContactBtn: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.purpleBorder,
    backgroundColor: colors.purpleMuted,
  },
  agencyContactText: { fontSize: 14, fontFamily: fontFamily.semiBold, color: colors.brand, flex: 1 },
  disclaimer: {
    marginTop: 18,
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    lineHeight: 19,
  },
  actions: { marginTop: 20, gap: 12 },
  outlineBtn: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.background,
    alignItems: "center",
  },
  outlineBtnText: { fontFamily: fontFamily.semiBold, fontSize: 15, color: colors.textPrimary },
  secondaryBtn: {
    marginTop: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.brand,
    backgroundColor: colors.background,
  },
  secondaryBtnText: { color: colors.brand, fontFamily: fontFamily.semiBold, fontSize: 16, textAlign: "center" },
  secondaryBtnMuted: {
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  secondaryBtnMutedText: {
    color: colors.textMuted,
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    textAlign: "center",
  },
});
