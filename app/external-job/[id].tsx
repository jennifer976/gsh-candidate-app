import { useAppCopy } from "@/lib/i18n";
import { jobChipLabel } from "@/lib/job-presentation";
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
import { getExternalListingLocationLabel, stripHtmlToPlainText } from "@/lib/job-display";
import { fetchPublicExternalJobById, recordExternalApplyClick } from "@/lib/api-client";
import { openExternalUrlInApp } from "@/lib/openMarketingBrowser";
import { STACK_HEADER_BODY_GAP } from "@/lib/screen-layout";
import { cardCuratedSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";
import type { ExternalJobListingPublic } from "@/types/models";

export default function ExternalJobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t, locale } = useAppCopy();
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
      openExternalUrlInApp(url);
    },
    onError: (e: unknown) =>
      Alert.alert(
        t("externalOpenError"),
        t("externalOpenHelp"),
        [{ text: t("ok") }]
      ),
  });

  if (!listingId.trim()) {
    return (
      <GshScreenBackground>
        <SafeAreaView style={styles.safe} edges={["bottom"]}>
          <View style={styles.center}>
            <Ionicons name="link-outline" size={44} color={colors.borderStrong} />
            <Text style={styles.errTitle}>{t("detailInvalid")}</Text>
            <Pressable style={styles.secondaryBtn} onPress={() => router.back()} accessibilityRole="button">
              <Text style={styles.secondaryBtnText}>{t("detailBack")}</Text>
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
            <Text style={styles.loadingHint}>{t("externalLoading")}</Text>
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
            <Text style={styles.errTitle}>{t("detailLoadError")}</Text>
            <Text style={styles.errSub}>{t("retrySupport")}</Text>
            <Pressable style={styles.secondaryBtn} onPress={() => void query.refetch()} accessibilityRole="button">
              <Text style={styles.secondaryBtnText}>{t("retry")}</Text>
            </Pressable>
            <Pressable style={styles.secondaryBtnMuted} onPress={() => router.back()} accessibilityRole="button">
              <Text style={styles.secondaryBtnMutedText}>{t("detailBack")}</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </GshScreenBackground>
    );
  }

  const listing = query.data;
  const primaryBadge = curatedListingPrimaryBadge(listing);
  const connected = listing.sourceRelationship === "employer_connected" && primaryBadge !== "Agency";
  const rawTags = listing.mobilityTags || [];
  const noSponsorship = rawTags.some(tag => tag.trim().toLowerCase() === "no sponsorship available");
  const tags = rawTags.filter(tag => !noSponsorship || tag.trim().toLowerCase() !== "visa sponsorship");
  const support = [
    noSponsorship ? t("jobNoSponsor") : listing.sponsorshipAvailable ? t("jobSponsorship") : "",
    listing.relocationAvailable ? t("jobRelocation") : "",
  ].filter(Boolean).join(" · ");
  const location = getExternalListingLocationLabel(listing);
  const locationLabel = !location || location === "See listing for location" || location === "Location on employer site" ? t("jobLocationHint")
    : location === "Remote / hybrid — see listing" ? t("jobRemoteHint") : location;
  const agencySiteUrl = normalizeAgencyWebsite(listing.agencyWebsite);

  return (
    <GshScreenBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
          <View style={[styles.heroShell, cardCuratedSurfaceStyle(true)]}>
            <View style={styles.heroInner}>
              <View style={styles.badgeRow}>
                <View style={[styles.badge, primaryBadge === "Agency" && styles.badgeAgency]}>
                  <Text style={[styles.badgeText, primaryBadge === "Agency" && styles.badgeTextAgency]}>
                    {primaryBadge === "Agency" ? t("jobsAgency") : connected ? t("jobsConnectedBadge") : t("jobsExternalBadge")}
                  </Text>
                </View>
                {listing.isFeatured ? (
                  <View style={[styles.badge, styles.badgeFeatured]}>
                    <Text style={styles.badgeTextFeatured}>{t("jobsFeatured")}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.title}>{listing.title}</Text>
              <Text style={styles.company}>{listing.companyName}</Text>
              <Text style={styles.meta}>{locationLabel}</Text>
              {support ? <Text style={styles.tags}>{support}</Text> : null}
            </View>
          </View>

          {listing.summary ? (
            <>
              <GshSectionTitle title={t("detailOverview")} topSpacing="sm" />
              <Text style={styles.body}>{stripHtmlToPlainText(listing.summary)}</Text>
            </>
          ) : null}

          {tags.length > 0 ? (
            <>
              <GshSectionTitle title={t("detailSupport")} />
              <Text style={styles.body}>{tags.map(tag => jobChipLabel(tag, locale)).join(" · ")}</Text>
            </>
          ) : null}

          {listing.agencyName ? (
            <Text style={styles.agencyLine}>{t("jobsVia", { name: listing.agencyName })}</Text>
          ) : null}

          {agencySiteUrl ? (
            <Pressable
              style={styles.agencyContactBtn}
              onPress={() => {
                try {
                  openExternalUrlInApp(agencySiteUrl);
                } catch {
                  /* invalid agency URL */
                }
              }}
              accessibilityRole="link"
              accessibilityLabel={t("externalAgencySite")}
            >
              <Ionicons name="business-outline" size={18} color={colors.brand} />
              <Text style={styles.agencyContactText}>{t("externalAgencySite")}</Text>
              <Ionicons name="open-outline" size={16} color={colors.placeholder} />
            </Pressable>
          ) : null}

          <Text style={styles.disclaimer}>
            {t("externalSharing")}
          </Text>

          <View style={styles.actions}>
            <Pressable style={styles.outlineBtn} onPress={() => router.push("/(tabs)/jobs")} accessibilityRole="button">
              <Text style={styles.outlineBtnText}>{t("externalBack")}</Text>
            </Pressable>
          </View>
        </ScrollView>
        <View style={styles.persistentBar}>
          <View style={styles.persistentCopy}>
            <Text style={styles.persistentTitle}>{t("externalApplication")}</Text>
            <Text style={[styles.persistentStatus, applyMut.isError && styles.persistentError]}>
              {applyMut.isError ? t("externalOpenHelp") : connected ? t("jobsApplyEmployer") : t("jobsApplySource")}
            </Text>
          </View>
          <GshGradientPrimaryButton
            title={applyMut.isError ? t("retry") : t("detailApply")}
            onPress={() => applyMut.mutate()}
            loading={applyMut.isPending}
            containerStyle={styles.persistentButton}
          />
        </View>
      </SafeAreaView>
    </GshScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  pad: {
    paddingHorizontal: 20,
    paddingTop: STACK_HEADER_BODY_GAP,
    paddingBottom: 24,
  },
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
  heroShell: { marginBottom: 12, borderRadius: radii.lg, overflow: "hidden" },
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
  badgeFeatured: { backgroundColor: colors.brandSoft, borderColor: colors.teal },
  badgeTextFeatured: { fontSize: 12, fontFamily: fontFamily.bold, color: colors.textMarketing },
  title: { fontSize: 22, fontFamily: fontFamily.heading, color: colors.navy, letterSpacing: -0.35 },
  company: { marginTop: 10, fontSize: 17, fontFamily: fontFamily.semiBold, color: colors.textMarketing },
  meta: { marginTop: 8, fontSize: 14, fontFamily: fontFamily.regular, color: colors.textMuted },
  tags: { marginTop: 10, fontSize: 14, fontFamily: fontFamily.medium, color: colors.navy },
  body: {
    marginTop: 8,
    fontSize: 15,
    fontFamily: fontFamily.regular,
    color: colors.textMarketing,
    lineHeight: 23,
  },
  agencyLine: { marginTop: 14, fontSize: 13, fontFamily: fontFamily.medium, color: colors.textMuted },
  agencyContactBtn: {
    minHeight: 44,
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 99,
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
    minHeight: 48,
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.background,
    alignItems: "center",
  },
  outlineBtnText: { fontFamily: fontFamily.semiBold, fontSize: 15, color: colors.textPrimary },
  secondaryBtn: {
    minHeight: 48,
    justifyContent: "center",
    marginTop: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 99,
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
  persistentBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  persistentCopy: { flex: 1, minWidth: 0 },
  persistentTitle: { fontSize: 13, fontFamily: fontFamily.bold, color: colors.navy },
  persistentStatus: { marginTop: 2, fontSize: 11, lineHeight: 15, fontFamily: fontFamily.regular, color: colors.textMuted },
  persistentError: { color: colors.error },
  persistentButton: { minWidth: 112 },
});
