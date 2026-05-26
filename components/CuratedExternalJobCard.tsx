import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { curatedListingPrimaryBadge } from "@/lib/curated-listing-labels";
import { externalListingChips, getExternalListingLocationLabel } from "@/lib/job-display";
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

/** Curated / agency listing — layout aligned with employer hub cards on the Jobs tab. */
export function CuratedExternalJobCard({ job, onPress }: { job: ExternalJobListingPublic; onPress: () => void }) {
  const chips = externalListingChips(job, CHIP_CAP);
  const locationLabel = getExternalListingLocationLabel(job);
  const primaryBadge = curatedListingPrimaryBadge(job);
  const isAgency = primaryBadge === "Agency";

  return (
    <View style={[styles.card, feedCardStyle()]}>
      <View style={styles.cardAccentStrip} />
      <Pressable onPress={onPress} style={styles.cardMainHit} accessibilityRole="button">
        <View style={[styles.cardAvatar, isAgency ? styles.cardAvatarAgency : styles.cardAvatarCurated]}>
          <Ionicons
            name={isAgency ? "business-outline" : "globe-outline"}
            size={22}
            color={isAgency ? colors.textSecondary : colors.purpleText}
          />
        </View>
        <View style={styles.cardMid}>
          <View style={styles.badgeRow}>
            <View style={[styles.kindBadge, isAgency ? styles.kindBadgeAgency : styles.kindBadgeCurated]}>
              <Text style={[styles.kindBadgeText, isAgency ? styles.kindBadgeTextAgency : styles.kindBadgeTextCurated]}>
                {isAgency ? "Agency" : "Curated"}
              </Text>
            </View>
          </View>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {job.title}
          </Text>
          <Text style={styles.cardCompany} numberOfLines={1}>
            {job.companyName || "Employer"}
          </Text>
          {typeof job.agencyName === "string" && job.agencyName.trim().length > 0 ? (
            <Text style={styles.agencyVia} numberOfLines={1}>
              Via {job.agencyName.trim()}
            </Text>
          ) : null}
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color={colors.textMuted} />
            <Text style={styles.cardMeta} numberOfLines={2}>
              {locationLabel || "Location on employer site"}
            </Text>
          </View>
          <ChipWrap chips={chips} />
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} style={styles.chevron} />
      </Pressable>
      <Pressable onPress={onPress} accessibilityRole="button">
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
    paddingVertical: 14,
    paddingRight: 14,
    paddingLeft: 16,
    position: "relative",
    overflow: "hidden",
    borderRadius: 14,
    minHeight: 132,
  },
  cardAccentStrip: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: 4,
    backgroundColor: colors.purple,
  },
  cardMainHit: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    minWidth: 0,
  },
  cardAvatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 2,
  },
  cardAvatarCurated: {
    backgroundColor: colors.purpleMuted,
    borderWidth: 1,
    borderColor: colors.purpleBorder,
  },
  cardAvatarAgency: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardMid: { flex: 1, minWidth: 0 },
  chevron: { marginTop: 4, flexShrink: 0 },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 4 },
  cardTitle: {
    fontSize: 15,
    fontFamily: fontFamily.bold,
    color: colors.navy,
    letterSpacing: -0.2,
    lineHeight: 20,
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
  cardCompany: { marginTop: 4, fontSize: 13, fontFamily: fontFamily.medium, color: colors.textSecondary },
  agencyVia: {
    marginTop: 2,
    fontSize: 12,
    fontFamily: fontFamily.medium,
    color: colors.textMuted,
  },
  locationRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 5,
    paddingRight: 4,
  },
  cardMeta: {
    flex: 1,
    fontSize: 12,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    lineHeight: 17,
  },
  chipWrap: { marginTop: 8, flexDirection: "row", flexWrap: "wrap", gap: 5 },
  listChip: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: radii.pill },
  listChipText: { fontSize: 10, fontFamily: fontFamily.medium },
  cardFooter: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  cardCta: { fontSize: 13, fontFamily: fontFamily.semiBold, color: colors.secondary },
});
