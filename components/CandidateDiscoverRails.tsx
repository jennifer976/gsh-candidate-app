import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";
import type { DashboardJobListing } from "@/types/models";

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
}: {
  jobs: DashboardJobListing[];
  onOpen: (id: string) => void;
}) {
  if (jobs.length === 0) return null;

  return (
    <View style={styles.featuredOuter}>
      <View style={styles.featuredHead}>
        <Text style={styles.featuredTitle}>Fresh on the Hub</Text>
        <Text style={styles.featuredSub}>Direct employer posts — tap to open</Text>
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
  featuredOuter: { marginTop: 4 },
  featuredHead: { paddingHorizontal: 16, marginBottom: 10 },
  featuredTitle: {
    fontSize: 11,
    fontFamily: fontFamily.medium,
    color: colors.textMuted,
    letterSpacing: 0.35,
    textTransform: "uppercase",
  },
  featuredSub: {
    marginTop: 4,
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    lineHeight: 18,
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
