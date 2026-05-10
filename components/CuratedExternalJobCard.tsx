import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { curatedListingPrimaryBadge } from "@/lib/curated-listing-labels";
import { externalListingChips } from "@/lib/job-display";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";
import type { ExternalJobListingPublic } from "@/types/models";

const CHIP_CAP = 3;

function ChipStrip({ chips }: { chips: string[] }) {
  if (chips.length === 0) return null;
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipStripContent}
      style={styles.chipStrip}
    >
      {chips.map((c) => (
        <View key={c} style={styles.listChip}>
          <Text style={styles.listChipText} numberOfLines={1}>
            {c}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

export function CuratedExternalJobCard({ job, onPress }: { job: ExternalJobListingPublic; onPress: () => void }) {
  const chips = externalListingChips(job, CHIP_CAP);
  const loc = [job.location, job.country].filter(Boolean).join(" · ");
  const primaryBadge = curatedListingPrimaryBadge(job);

  return (
    <Pressable style={[styles.card, cardSurfaceStyle(false)]} onPress={onPress} accessibilityRole="button">
      <View style={styles.cardTop}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {job.title}
        </Text>
        <View style={[styles.kindBadge, primaryBadge === "Agency" ? styles.kindBadgeAgency : undefined]}>
          <Text style={[styles.kindBadgeText, primaryBadge === "Agency" ? styles.kindBadgeTextAgency : undefined]}>
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
      <ChipStrip chips={chips} />
      <View style={styles.cardFooter}>
        <Text style={styles.cardCta}>Details & apply</Text>
        <Ionicons name="open-outline" size={18} color={colors.textMuted} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  cardTitle: { flex: 1, fontSize: 16, fontFamily: fontFamily.semiBold, color: colors.textPrimary, letterSpacing: -0.25 },
  kindBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: "flex-start",
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
  },
  kindBadgeText: { fontSize: 10, fontFamily: fontFamily.medium, color: colors.textMuted },
  kindBadgeAgency: {
    backgroundColor: colors.purpleMuted,
    borderColor: colors.purpleBorder,
  },
  kindBadgeTextAgency: { color: colors.purpleTextDark },
  cardCompany: { marginTop: 10, fontSize: 15, fontFamily: fontFamily.semiBold, color: colors.textPrimary },
  agencyVia: {
    marginTop: 4,
    fontSize: 12,
    fontFamily: fontFamily.medium,
    color: colors.textMuted,
  },
  cardMeta: { marginTop: 3, fontSize: 13, fontFamily: fontFamily.regular, color: colors.textMuted },
  chipStrip: {
    marginTop: 10,
    marginHorizontal: -2,
    maxHeight: 28,
  },
  chipStripContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingRight: 8,
  },
  listChip: {
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: radii.pill,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    flexShrink: 0,
  },
  listChipText: {
    fontSize: 11,
    fontFamily: fontFamily.medium,
    color: colors.textSecondary,
    letterSpacing: 0.1,
  },
  cardFooter: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
    paddingTop: 10,
  },
  cardCta: { fontSize: 13, fontFamily: fontFamily.medium, color: colors.textSecondary },
});
