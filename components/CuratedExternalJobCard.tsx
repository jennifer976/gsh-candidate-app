import { useAppCopy } from "@/lib/i18n";
import {
  jobChipLabel,
  jobCountryLabel,
  jobAgeLabel,
} from "@/lib/job-presentation";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CompanyLogo } from "@/components/CompanyLogo";
import { DepthSurface } from "@/components/gsh-brand";
import { resolveBrandImageUrl } from "@/lib/brand-logo";
import { curatedListingPrimaryBadge } from "@/lib/curated-listing-labels";
import {
  externalListingChips,
  getExternalListingLocationLabel,
  getExternalListingSummaryPreview,
} from "@/lib/job-display";
import { mobilityChipStyle } from "@/lib/mobility-chip-styles";
import { colors, fontFamily, radii } from "@/lib/theme";
import type { ExternalJobListingPublic } from "@/types/models";

const CHIP_CAP = 4;

/** Curated / agency / employer-connected listing that applies on the source site. */
export function CuratedExternalJobCard({
  job,
  onPress,
}: {
  job: ExternalJobListingPublic;
  onPress: () => void;
}) {
  const { t, locale } = useAppCopy();

  const chips = externalListingChips(job, CHIP_CAP);
  const rawLocation = getExternalListingLocationLabel(job);
  const locationLabel =
    rawLocation === "See listing for location"
      ? t("jobLocationHint")
      : rawLocation === "Remote / hybrid — see listing"
        ? t("jobRemoteHint")
        : jobCountryLabel(rawLocation, locale);
  const summaryPreview = getExternalListingSummaryPreview(job);
  const primaryBadge = curatedListingPrimaryBadge(job);
  const isAgency = primaryBadge === "Agency";
  const isConnected =
    job.sourceRelationship === "employer_connected" &&
    job.employerPermissionStatus === "approved";
  const timeCaption = jobAgeLabel(job.externalPostedAt ?? job.createdAt, locale);
  const companyName = job.companyName || t("screenEmployer");
  const agencyName = typeof job.agencyName === "string" ? job.agencyName.trim() : "";

  return (
    <DepthSurface depth={5} radius={20} borderWidth={2} borderColor={colors.navy} innerStyle={styles.card}>
      <Pressable onPress={onPress} style={styles.cardMainHit} accessibilityRole="button">
        <View style={styles.logoWell}>
          <CompanyLogo
            logoUrl={resolveBrandImageUrl(job.companyLogo)}
            companyName={companyName}
            size={64}
            radius={16}
          />
        </View>
        <View style={styles.cardMid}>
          <View style={styles.topMetaRow}>
            <View style={styles.badgeRow}>
              <View style={[styles.kindBadge, isConnected && styles.kindBadgeConnected]}>
                <Text style={styles.kindBadgeText}>
                  {isConnected
                    ? t("jobsConnectedBadge")
                    : isAgency
                      ? t("jobsAgency")
                      : t("jobsExternalBadge")}
                </Text>
              </View>
              {job.isFeatured ? (
                <View style={styles.featuredBadge}>
                  <Ionicons name="star" size={9} color={colors.cyan} />
                  <Text style={styles.featuredBadgeText}>{t("jobsFeatured")}</Text>
                </View>
              ) : null}
            </View>
            {timeCaption ? <Text style={styles.timeCaption}>{timeCaption}</Text> : null}
          </View>
          <Text style={styles.cardCompanyLine} numberOfLines={1}>
            {companyName}
          </Text>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {job.title}
          </Text>
          {locationLabel ? (
            <View style={styles.cardMetaRow}>
              <Ionicons name="location-outline" size={14} color={colors.textMuted} />
              <Text style={styles.cardMetaLine} numberOfLines={2}>
                {locationLabel}
              </Text>
            </View>
          ) : null}
          {agencyName ? (
            <Text style={styles.agencyVia} numberOfLines={1}>
              {job.sourceType === "agency_submitted"
                ? t("jobsSubmitted", { name: agencyName })
                : t("jobsVia", { name: agencyName })}
            </Text>
          ) : null}
          {summaryPreview ? (
            <Text style={styles.summaryPreview} numberOfLines={2}>
              {summaryPreview}
            </Text>
          ) : null}
          {chips.length > 0 ? (
            <View style={styles.chipWrap}>
              {chips.map((c) => {
                const pal = mobilityChipStyle(c);
                return (
                  <View key={c} style={[styles.listChip, pal.wrap]}>
                    <Text style={[styles.listChipText, pal.text]} numberOfLines={1}>
                      {jobChipLabel(c, locale)}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : null}
        </View>
      </Pressable>
      <Pressable onPress={onPress} accessibilityRole="button">
        <View style={styles.cardFooter}>
          <Text style={styles.footerHint} numberOfLines={1}>
            {t(isConnected ? "jobsApplyEmployer" : "jobsApplySource")}
          </Text>
          <View style={styles.footerCtaRow}>
            <Text style={styles.cardCta}>{t("jobsDetails")}</Text>
            <View style={styles.cardCtaArrow}>
              <Ionicons name="open-outline" size={14} color={colors.navy} />
            </View>
          </View>
        </View>
      </Pressable>
    </DepthSurface>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: 16,
    paddingHorizontal: 14,
    minHeight: 148,
  },
  cardMainHit: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    minWidth: 0,
  },
  logoWell: {
    borderRadius: 18,
    backgroundColor: colors.pale,
    padding: 2,
  },
  cardMid: { flex: 1, minWidth: 0 },
  topMetaRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 6,
  },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start", gap: 6, flex: 1 },
  timeCaption: {
    fontSize: 11,
    fontFamily: fontFamily.medium,
    color: colors.textMuted,
    flexShrink: 0,
    marginTop: 2,
  },
  kindBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.navy,
    backgroundColor: colors.white,
  },
  kindBadgeConnected: { backgroundColor: colors.cyan },
  kindBadgeText: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
    color: colors.navy,
    letterSpacing: 0.2,
  },
  featuredBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.pill,
    backgroundColor: colors.navy,
  },
  featuredBadgeText: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
    color: colors.white,
  },
  cardCompanyLine: {
    fontSize: 13,
    fontFamily: fontFamily.medium,
    color: colors.textSecondary,
  },
  cardTitle: {
    fontSize: 17,
    fontFamily: fontFamily.heading,
    color: colors.navy,
    letterSpacing: -0.3,
    marginTop: 4,
    marginBottom: 4,
    lineHeight: 22,
  },
  cardMetaRow: {
    marginTop: 2,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 4,
    paddingRight: 4,
  },
  cardMetaLine: {
    flex: 1,
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    lineHeight: 18,
  },
  agencyVia: {
    marginTop: 4,
    fontSize: 12,
    fontFamily: fontFamily.medium,
    color: colors.textMuted,
  },
  summaryPreview: {
    marginTop: 8,
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
    lineHeight: 19,
  },
  chipWrap: { marginTop: 8, flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start", gap: 6 },
  listChip: {
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: radii.pill,
  },
  listChipText: { fontSize: 11, fontFamily: fontFamily.medium },
  cardFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  footerHint: {
    flex: 1,
    fontSize: 11,
    fontFamily: fontFamily.medium,
    color: colors.textMuted,
  },
  footerCtaRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardCta: {
    fontSize: 14,
    fontFamily: fontFamily.bold,
    color: colors.navy,
  },
  cardCtaArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.cyan,
    alignItems: "center",
    justifyContent: "center",
  },
});
