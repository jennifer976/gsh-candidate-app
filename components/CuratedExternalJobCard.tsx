import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { curatedListingPrimaryBadge } from "@/lib/curated-listing-labels";
import { externalListingChips } from "@/lib/job-display";
import { mobilityChipStyle } from "@/lib/mobility-chip-styles";
import { cardCuratedSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";
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

export function CuratedExternalJobCard({ job, onPress }: { job: ExternalJobListingPublic; onPress: () => void }) {
  const chips = externalListingChips(job, CHIP_CAP);
  const loc = [job.location, job.country].filter(Boolean).join(" · ");
  const primaryBadge = curatedListingPrimaryBadge(job);

  return (
    <Pressable style={[styles.card, cardCuratedSurfaceStyle(false)]} onPress={onPress} accessibilityRole="button">
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
        <Ionicons name="open-outline" size={18} color={colors.textMuted} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: 11,
    paddingHorizontal: 14,
  },
  cardTop: { width: "100%" },
  badgeRow: { marginTop: 6, flexDirection: "row", flexWrap: "wrap", gap: 6 },
  cardTitle: { fontSize: 15, fontFamily: fontFamily.semiBold, color: colors.navy, letterSpacing: -0.2 },
  kindBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radii.pill,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  kindBadgeCurated: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
  },
  kindBadgeText: { fontSize: 10, fontFamily: fontFamily.semiBold, letterSpacing: 0.05 },
  kindBadgeTextCurated: { color: colors.textSecondary },
  kindBadgeAgency: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
  },
  kindBadgeTextAgency: { color: colors.textSecondary },
  cardCompany: { marginTop: 6, fontSize: 14, fontFamily: fontFamily.semiBold, color: colors.textPrimary },
  agencyVia: {
    marginTop: 4,
    fontSize: 12,
    fontFamily: fontFamily.medium,
    color: colors.textMuted,
  },
  cardMeta: { marginTop: 3, fontSize: 13, fontFamily: fontFamily.regular, color: colors.textMuted },
  chipWrap: {
    marginTop: 6,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
  },
  listChip: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: radii.pill,
    borderWidth: 1,
    maxWidth: "100%",
  },
  listChipText: {
    fontSize: 10,
    fontFamily: fontFamily.medium,
    letterSpacing: 0.05,
  },
  cardFooter: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
    paddingTop: 6,
  },
  cardCta: { fontSize: 13, fontFamily: fontFamily.medium, color: colors.textSecondary },
});
