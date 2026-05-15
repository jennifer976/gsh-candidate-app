import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { cardSurfaceStyle, colors, discoverFeedCardStyle, fontFamily, radii } from "@/lib/theme";

export type HomeQuickStats = {
  applied: number;
  saved: number;
  interviews: number;
};

function MiniStat({
  label,
  value,
  onPress,
  dense,
}: {
  label: string;
  value: number;
  onPress: () => void;
  dense?: boolean;
}) {
  return (
    <Pressable
      style={[styles.miniStat, dense && styles.miniStatDense]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}`}
    >
      <Text style={[styles.miniVal, dense && styles.miniValDense]}>{value}</Text>
      <Text style={[styles.miniLab, dense && styles.miniLabDense]}>{label}</Text>
    </Pressable>
  );
}

type Props = {
  firstName?: string;
  completionPct: number | null;
  stats: HomeQuickStats | null;
  statsLoading: boolean;
  onProfile: () => void;
  onApplied: () => void;
  onSaved: () => void;
  onDashboard: () => void;
  /** Tighter layout for Discover tab — less vertical chrome before the job list. */
  compact?: boolean;
  /** e.g. profile location — context under the greeting. */
  focusLine?: string | null;
  /** When set with compact, use floating white card (Discover feed look). */
  feedVisual?: boolean;
};

export function JobsHomePersonalHeader({
  firstName,
  completionPct,
  stats,
  statsLoading,
  onProfile,
  onApplied,
  onSaved,
  onDashboard,
  compact,
  focusLine,
  feedVisual,
}: Props) {
  const trimmed = firstName?.trim();
  const greeting = trimmed ? `Hello, ${trimmed}` : "Hello";

  return (
    <View
      style={[
        styles.wrap,
        feedVisual && compact ? [discoverFeedCardStyle(), styles.wrapFeed] : cardSurfaceStyle(false),
        compact && styles.wrapCompact,
      ]}
    >
      <Text style={[styles.greeting, compact && styles.greetingCompact]} numberOfLines={1}>
        {greeting}
      </Text>
      {!compact ? <Text style={styles.sub}>Explore global opportunities with sponsorship.</Text> : null}
      {compact && focusLine?.trim() ? (
        <View style={styles.focusRow}>
          <Ionicons name="location-outline" size={15} color={colors.textMuted} />
          <Text style={styles.focusLine} numberOfLines={1}>
            {focusLine.trim()}
          </Text>
        </View>
      ) : null}

      {completionPct != null && completionPct < 100 ? (
        <Pressable onPress={onProfile} style={[styles.progressPress, compact && styles.progressPressCompact]} accessibilityRole="button">
          <View style={[styles.barOuter, compact && styles.barOuterCompact]}>
            <View style={[styles.barInner, { width: `${Math.min(100, Math.max(0, completionPct))}%` }]} />
          </View>
          <Text style={[styles.progressHint, compact && styles.progressHintCompact]} numberOfLines={1}>
            {compact ? `${completionPct}% profile · tap to finish` : `${completionPct}% profile complete — tap to improve`}
          </Text>
        </Pressable>
      ) : completionPct != null && completionPct >= 100 ? (
        <View style={[styles.readyRow, compact && styles.readyRowCompact]}>
          <Ionicons name="checkmark-circle" size={compact ? 16 : 18} color={colors.textSecondary} />
          <Text style={[styles.readyText, compact && styles.readyTextCompact]} numberOfLines={compact ? 1 : undefined}>
            {compact ? "Profile ready to apply" : "Profile ready — you can apply with your CV"}
          </Text>
        </View>
      ) : null}

      {statsLoading ? (
        <View style={[styles.statsLoading, compact && styles.statsLoadingCompact]}>
          <ActivityIndicator size="small" color={colors.brand} />
          <Text style={styles.statsLoadingText}>{compact ? "Stats…" : "Loading your stats…"}</Text>
        </View>
      ) : stats ? (
        <View style={[styles.statsRow, compact && styles.statsRowCompact]}>
          <MiniStat label="Applications" value={stats.applied} onPress={onApplied} dense={compact} />
          <MiniStat label="Saved" value={stats.saved} onPress={onSaved} dense={compact} />
          <MiniStat label="Interviews" value={stats.interviews} onPress={onDashboard} dense={compact} />
        </View>
      ) : (
        <Pressable onPress={onDashboard} style={[styles.statsFallback, compact && styles.statsFallbackCompact]} accessibilityRole="button">
          <Text style={styles.statsFallbackText}>{compact ? "Dashboard →" : "Open dashboard for full stats & trends →"}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 14,
  },
  wrapFeed: {
    marginTop: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 0,
  },
  wrapCompact: {
    marginTop: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  greeting: {
    fontSize: 22,
    fontFamily: fontFamily.bold,
    color: colors.navy,
    letterSpacing: -0.4,
  },
  greetingCompact: {
    fontSize: 19,
    letterSpacing: -0.35,
  },
  sub: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    lineHeight: 20,
  },
  focusRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: 20,
  },
  focusLine: {
    flex: 1,
    fontSize: 13,
    fontFamily: fontFamily.medium,
    color: colors.textSecondary,
  },
  progressPress: { marginTop: 14 },
  progressPressCompact: { marginTop: 8 },
  barOuter: {
    height: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  barOuterCompact: { height: 6 },
  barInner: {
    height: "100%",
    borderRadius: radii.pill,
    backgroundColor: colors.brand,
  },
  progressHint: {
    marginTop: 8,
    fontSize: 13,
    fontFamily: fontFamily.medium,
    color: colors.textSecondary,
  },
  progressHintCompact: { marginTop: 5, fontSize: 12 },
  readyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  readyRowCompact: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  readyText: {
    flex: 1,
    fontSize: 13,
    fontFamily: fontFamily.medium,
    color: colors.textMarketing,
    lineHeight: 18,
  },
  readyTextCompact: { fontSize: 12 },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  statsRowCompact: { marginTop: 10, gap: 8 },
  miniStat: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  miniVal: {
    fontSize: 17,
    fontFamily: fontFamily.bold,
    color: colors.navy,
    letterSpacing: -0.3,
  },
  miniLab: {
    marginTop: 4,
    fontSize: 11,
    fontFamily: fontFamily.medium,
    color: colors.textMuted,
    textAlign: "center",
  },
  miniStatDense: { paddingVertical: 7, paddingHorizontal: 2 },
  miniValDense: { fontSize: 15 },
  miniLabDense: { fontSize: 10, marginTop: 2 },
  statsLoading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 16,
    justifyContent: "center",
    paddingVertical: 12,
  },
  statsLoadingCompact: { marginTop: 10, paddingVertical: 8 },
  statsLoadingText: {
    fontSize: 14,
    fontFamily: fontFamily.medium,
    color: colors.textMuted,
  },
  statsFallback: {
    marginTop: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  statsFallbackCompact: { marginTop: 8, paddingVertical: 8 },
  statsFallbackText: {
    fontSize: 14,
    fontFamily: fontFamily.semiBold,
    color: colors.textMarketing,
  },
});
