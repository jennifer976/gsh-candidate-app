import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { curatedListingPrimaryBadge } from "@/lib/curated-listing-labels";
import { externalListingChips } from "@/lib/job-display";
import { mobilityChipStyle } from "@/lib/mobility-chip-styles";
import { colors, feedCardStyle, fontFamily, radii } from "@/lib/theme";
import type { ExternalJobListingPublic } from "@/types/models";

const CHIP_CAP = 3;

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

/** Curated / agency listing — white card on dark feed with purple lane strip (matches employer cards). */
export function CuratedExternalJobCard({ job, onPress }: { job: ExternalJobListingPublic; onPress: () => void }) {
  const chips = externalListingChips(job, CHIP_CAP);
  const loc = [job.location, job.country].filter(Boolean).join(" · ");
  const primaryBadge = curatedListingPrimaryBadge(job);

  return (
    <View style={[styles.card, feedCardStyle()]}>
      <View style={styles.cardAccentStrip} />
      <Pressable onPress={onPress} style={styles.cardBody} accessibilityRole="button">
        <View style={styles.cardTop}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {job.title}
          </Text>
        </View>
        <View style={styles.badgeRow}>
          <View style={[styles.kindBadge, primaryBadge === "Agency" ? styles.kindBadgeAgency : styles.kindBadgeCurated]}>
            <Text style={[styles.kindBadgeText, primaryBadge === "Agency" ? styles.kindBadgeTextAgency : styles.kindBadgeTextCurated]}>
              {primaryBadge === "Agency" ? "Agency" : "Curated"}
            </Text>
          </View>
        </View>
        <Text style={styles.cardCompany} numberOfLines={1}>
          {job.companyName || "Employer"}
        </Text>
        {typeof job.agencyName === "string" && job.agencyName.trim().length > 0 ? (
          <Text style={styles.agencyVia} numberOfLines={1}>
            Via {job.agencyName.trim()}
          </Text>
        ) : null}
        {loc ? (
          <Text style={styles.cardMeta} numberOfLines={2}>
            {loc}
          </Text>
        ) : null}
        <ChipWrap chips={chips} />
        <View style={styles.cardFooter}>
          <Text style={styles.cardCta}>Details & apply</Text>
          <Ionicons name="open-outline" size={18} color={colors.secondary} />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: 12,
    paddingRight: 12,
    paddingLeft: 16,
    position: "relative",
    overflow: "hidden",
    borderRadius: 14,
  },
  cardAccentStrip: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: 4,
    backgroundColor: colors.purple,
  },
  cardBody: { minWidth: 0 },
  cardTop: { width: "100%" },
  badgeRow: { marginTop: 6, flexDirection: "row", flexWrap: "wrap", gap: 6 },
  cardTitle: { fontSize: 14, fontFamily: fontFamily.bold, color: colors.navy, letterSpacing: -0.2, lineHeight: 19 },
  kindBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radii.pill,
    borderWidth: 1,
    alignSelf: "flex-start",
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
  cardCompany: { marginTop: 6, fontSize: 13, fontFamily: fontFamily.medium, color: colors.textSecondary },
  agencyVia: {
    marginTop: 4,
    fontSize: 12,
    fontFamily: fontFamily.medium,
    color: colors.textMuted,
  },
  cardMeta: { marginTop: 3, fontSize: 12, fontFamily: fontFamily.regular, color: colors.textMuted },
  chipWrap: { marginTop: 8, flexDirection: "row", flexWrap: "wrap", gap: 5 },
  listChip: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: radii.pill },
  listChipText: { fontSize: 10, fontFamily: fontFamily.medium },
  cardFooter: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  cardCta: { fontSize: 13, fontFamily: fontFamily.semiBold, color: colors.secondary },
});
