import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";
import type { DashboardJobListing } from "@/types/models";

type IonName = ComponentProps<typeof Ionicons>["name"];

const MOBILITY_CHIPS: { label: string; q: string; icon: IonName; bg: string; border: string; iconColor: string }[] = [
  { label: "Visa Sponsorship", q: "visa sponsorship", icon: "id-card-outline", bg: "#e6fffa", border: "#99f6e4", iconColor: "#0f766e" },
  { label: "Relocation", q: "relocation support", icon: "airplane-outline", bg: "#f5f3ff", border: "#ddd6fe", iconColor: "#5b21b6" },
  { label: "Global Hiring", q: "international hiring global", icon: "globe-outline", bg: "#e0f2fe", border: "#7dd3fc", iconColor: "#0369a1" },
];

const EXPLORE_CHIPS: { label: string; q: string }[] = [
  { label: "All", q: "" },
  { label: "Engineering", q: "software engineer" },
  { label: "Healthcare", q: "nurse healthcare clinical" },
  { label: "Education", q: "teacher lecturer education" },
  { label: "Finance", q: "finance accountant analyst" },
  { label: "Sponsorship", q: "visa sponsorship skilled worker" },
];

function chipActive(currentQ: string, chipQ: string): boolean {
  const c = currentQ.trim().toLowerCase();
  const t = chipQ.trim().toLowerCase();
  if (t === "") return c === "";
  return c === t;
}

export function DiscoverMobilityChips({ onPick }: { onPick: (q: string) => void }) {
  return (
    <View style={styles.mobilityOuter}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mobilityScroll}>
        {MOBILITY_CHIPS.map((chip) => (
          <Pressable
            key={chip.label}
            onPress={() => onPick(chip.q)}
            style={[styles.mobilityChip, { backgroundColor: chip.bg, borderColor: chip.border }]}
            accessibilityRole="button"
            accessibilityLabel={chip.label}
          >
            <Ionicons name={chip.icon} size={18} color={chip.iconColor} />
            <Text style={styles.mobilityChipText} numberOfLines={2}>
              {chip.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

export function DiscoverExploreChips({ query, onPick }: { query: string; onPick: (next: string) => void }) {
  return (
    <View style={styles.exploreOuter}>
      <Text style={styles.exploreLabel}>Explore</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.exploreScroll}>
        {EXPLORE_CHIPS.map((chip) => {
          const active = chipActive(query, chip.q);
          return (
            <Pressable
              key={chip.label}
              onPress={() => onPick(chip.q)}
              style={[styles.exploreChip, active && styles.exploreChipActive]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.exploreChipText, active && styles.exploreChipTextActive]} numberOfLines={1}>
                {chip.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

export function DiscoverFeaturedStrip({
  jobs,
  onOpen,
  onViewAll,
}: {
  jobs: DashboardJobListing[];
  onOpen: (id: string) => void;
  onViewAll?: () => void;
}) {
  if (jobs.length === 0) return null;

  return (
    <View style={styles.featuredOuter}>
      <View style={styles.featuredHeadRow}>
        <Text style={styles.featuredSectionTitle}>Featured opportunities</Text>
        {onViewAll ? (
          <Pressable onPress={onViewAll} accessibilityRole="button" accessibilityLabel="View all featured opportunities">
            <Text style={styles.featuredViewAll}>View all</Text>
          </Pressable>
        ) : null}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredScroll}>
        {jobs.map((job) => (
          <Pressable
            key={job._id}
            style={[styles.featuredCard, cardSurfaceStyle(true)]}
            onPress={() => onOpen(job._id)}
            accessibilityRole="button"
          >
            <Text style={styles.featuredCardTitle} numberOfLines={2}>
              {job.title}
            </Text>
            <Text style={styles.featuredCardCo} numberOfLines={1}>
              {job.companyName}
            </Text>
            <Text style={styles.featuredCardMeta} numberOfLines={1}>
              {[job.locationCity, job.locationCountry].filter(Boolean).join(", ") || job.location || ""}
            </Text>
            <View style={styles.featuredCardFooter}>
              <Text style={styles.featuredCardCta}>View</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.brand} />
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mobilityOuter: { marginTop: 4, marginBottom: 2 },
  mobilityScroll: { paddingHorizontal: 16, gap: 10, paddingBottom: 2 },
  mobilityChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radii.lg,
    borderWidth: 1,
    maxWidth: 200,
  },
  mobilityChipText: {
    flex: 1,
    fontSize: 13,
    fontFamily: fontFamily.semiBold,
    color: colors.navy,
    letterSpacing: -0.15,
  },
  exploreOuter: { marginTop: 4, marginBottom: 2 },
  exploreLabel: {
    marginHorizontal: 16,
    marginBottom: 8,
    fontSize: 11,
    fontFamily: fontFamily.medium,
    color: colors.textMuted,
    letterSpacing: 0.35,
  },
  exploreScroll: { paddingHorizontal: 16, gap: 8, paddingBottom: 2 },
  exploreChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  exploreChipActive: {
    borderColor: "rgba(14, 205, 209, 0.55)",
    backgroundColor: "rgba(14, 205, 209, 0.1)",
  },
  exploreChipText: {
    fontSize: 13,
    fontFamily: fontFamily.semiBold,
    color: colors.textSecondary,
  },
  exploreChipTextActive: { color: colors.navy },
  featuredOuter: { marginTop: 8 },
  featuredHeadRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 12,
  },
  featuredSectionTitle: {
    flex: 1,
    fontSize: 17,
    fontFamily: fontFamily.bold,
    color: colors.navy,
    letterSpacing: -0.35,
  },
  featuredViewAll: {
    fontSize: 14,
    fontFamily: fontFamily.semiBold,
    color: colors.brand,
  },
  featuredScroll: { paddingHorizontal: 16, gap: 10, paddingBottom: 4 },
  featuredCard: {
    width: 200,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  featuredCardTitle: {
    fontSize: 15,
    fontFamily: fontFamily.semiBold,
    color: colors.textPrimary,
    letterSpacing: -0.2,
    minHeight: 40,
  },
  featuredCardCo: { marginTop: 8, fontSize: 13, fontFamily: fontFamily.medium, color: colors.textMarketing },
  featuredCardMeta: { marginTop: 4, fontSize: 12, fontFamily: fontFamily.regular, color: colors.textMuted },
  featuredCardFooter: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 2,
  },
  featuredCardCta: { fontSize: 12, fontFamily: fontFamily.semiBold, color: colors.brand },
});
