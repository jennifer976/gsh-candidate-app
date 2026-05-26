import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CompanyLogo } from "@/components/CompanyLogo";
import { curatedListingPrimaryBadge } from "@/lib/curated-listing-labels";
import {
  externalListingChips,
  formatExternalListingAge,
  getExternalListingLocationLabel,
  getExternalListingSummaryPreview,
} from "@/lib/job-display";
import { mobilityChipStyle } from "@/lib/mobility-chip-styles";
import { colors, feedCardStyle, fontFamily, radii } from "@/lib/theme";
import type { ExternalJobListingPublic } from "@/types/models";

const CHIP_CAP = 4;

function ChipWrap({ chips }: { chips: string[] }) {
  if (chips.length === 0) return null;
  return (
    <View style={styles.chipWrap}>
      {chips.map((c) => {
        const pal = mobilityChipStyle(c);
        return (
          <View key={c} style={[styles.listChip, pal.wrap]}>
            <Text style={[styles.listChipText, pal.text]} numberOfLines={1}>
              {c}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

/** Curated / agency listing — richer preview before opening external detail. */
export function CuratedExternalJobCard({ job, onPress }: { job: ExternalJobListingPublic; onPress: () => void }) {
  const chips = externalListingChips(job, CHIP_CAP);
  const locationLabel = getExternalListingLocationLabel(job);
  const summaryPreview = getExternalListingSummaryPreview(job);
  const primaryBadge = curatedListingPrimaryBadge(job);
  const isAgency = primaryBadge === "Agency";
  const timeCaption = formatExternalListingAge(job.externalPostedAt ?? job.createdAt);
  const companyLine = [job.companyName || "Employer", locationLabel].filter(Boolean).join(" · ");

  return (
    <View style={[styles.card, feedCardStyle(), summaryPreview ? styles.cardWithSummary : null]}>
      <View style={[styles.cardAccentStrip, isAgency ? styles.cardAccentAgency : null]} />
      <Pressable onPress={onPress} style={styles.cardMainHit} accessibilityRole="button">
        <CompanyLogo logoUrl="" companyName={job.companyName || "Employer"} size={48} radius={12} />
        <View style={styles.cardMid}>
          <View style={styles.topMetaRow}>
            <View style={styles.badgeRow}>
              <View style={[styles.kindBadge, isAgency ? styles.kindBadgeAgency : styles.kindBadgeCurated]}>
                <Text style={[styles.kindBadgeText, isAgency ? styles.kindBadgeTextAgency : styles.kindBadgeTextCurated]}>
                  {isAgency ? "Agency" : "Curated"}
                </Text>
              </View>
              {job.isFeatured ? (
                <View style={styles.featuredBadge}>
                  <Ionicons name="star" size={9} color={colors.warningText} />
                  <Text style={styles.featuredBadgeText}>Featured</Text>
                </View>
              ) : null}
            </View>
            {timeCaption ? <Text style={styles.timeCaption}>{timeCaption}</Text> : null}
          </View>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {job.title}
          </Text>
          <Text style={styles.cardCompanyLine} numberOfLines={2}>
            {companyLine}
          </Text>
          {typeof job.agencyName === "string" && job.agencyName.trim().length > 0 ? (
            <Text style={styles.agencyVia} numberOfLines={1}>
              {job.sourceType === "agency_submitted"
                ? `Submitted by ${job.agencyName.trim()}`
                : `Via ${job.agencyName.trim()}`}
            </Text>
          ) : null}
          {summaryPreview ? (
            <Text style={styles.summaryPreview} numberOfLines={3}>
              {summaryPreview}
            </Text>
          ) : null}
          <ChipWrap chips={chips} />
        </View>
      </Pressable>
      <Pressable onPress={onPress} accessibilityRole="button">
        <View style={styles.cardFooter}>
          <Text style={styles.footerHint}>Apply on employer site</Text>
          <View style={styles.footerCtaRow}>
            <Text style={styles.cardCta}>Details & apply</Text>
            <Ionicons name="open-outline" size={18} color={colors.secondary} />
          </View>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: 16,
    paddingRight: 16,
    paddingLeft: 18,
    position: "relative",
    overflow: "hidden",
    borderRadius: 14,
    minHeight: 148,
  },
  cardWithSummary: { minHeight: 188 },
  cardAccentStrip: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: 4,
    backgroundColor: colors.purple,
  },
  cardAccentAgency: { backgroundColor: colors.secondary },
  cardMainHit: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    minWidth: 0,
  },
  cardMid: { flex: 1, minWidth: 0 },
  topMetaRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 6,
  },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, flex: 1 },
  timeCaption: {
    fontSize: 11,
    fontFamily: fontFamily.medium,
    color: colors.textMuted,
    flexShrink: 0,
    marginTop: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: fontFamily.bold,
    color: colors.navy,
    letterSpacing: -0.25,
    lineHeight: 21,
  },
  kindBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  kindBadgeCurated: {
    backgroundColor: colors.purpleMuted,
    borderColor: colors.purpleBorder,
  },
  kindBadgeText: { fontSize: 10, fontFamily: fontFamily.semiBold, letterSpacing: 0.05 },
  kindBadgeTextCurated: { color: colors.purpleText },
  kindBadgeAgency: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
  },
  kindBadgeTextAgency: { color: colors.textSecondary },
  featuredBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radii.pill,
    backgroundColor: "rgba(245,158,11,0.12)",
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.35)",
  },
  featuredBadgeText: { fontSize: 10, fontFamily: fontFamily.semiBold, color: colors.warningText },
  cardCompanyLine: {
    marginTop: 5,
    fontSize: 13,
    fontFamily: fontFamily.medium,
    color: colors.textSecondary,
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
    color: colors.textMarketing,
    lineHeight: 19,
  },
  chipWrap: { marginTop: 10, flexDirection: "row", flexWrap: "wrap", gap: 5 },
  listChip: { paddingVertical: 4, paddingHorizontal: 9, borderRadius: radii.pill },
  listChipText: { fontSize: 11, fontFamily: fontFamily.semiBold },
  cardFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    gap: 4,
  },
  footerHint: {
    fontSize: 11,
    fontFamily: fontFamily.medium,
    color: colors.textMuted,
    letterSpacing: 0.1,
  },
  footerCtaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
  },
  cardCta: { fontSize: 14, fontFamily: fontFamily.semiBold, color: colors.secondary },
});
