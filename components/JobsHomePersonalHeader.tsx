import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { cardSurfaceStyle, colors, fontFamily, radii } from "@/lib/theme";

export type HomeQuickStats = {
  applied: number;
  saved: number;
  interviews: number;
};

function MiniStat({
  label,
  value,
  onPress,
}: {
  label: string;
  value: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={styles.miniStat}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}`}
    >
      <Text style={styles.miniVal}>{value}</Text>
      <Text style={styles.miniLab}>{label}</Text>
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
}: Props) {
  const trimmed = firstName?.trim();
  const greeting = trimmed ? `Hello, ${trimmed}!` : "Hello!";

  return (
    <View style={[styles.wrap, cardSurfaceStyle(false)]}>
      <Text style={styles.greeting}>{greeting}</Text>
      <Text style={styles.sub}>Explore global opportunities with sponsorship.</Text>

      {completionPct != null && completionPct < 100 ? (
        <Pressable onPress={onProfile} style={styles.progressPress} accessibilityRole="button">
          <View style={styles.barOuter}>
            <View style={[styles.barInner, { width: `${Math.min(100, Math.max(0, completionPct))}%` }]} />
          </View>
          <Text style={styles.progressHint}>{completionPct}% profile complete — tap to improve</Text>
        </Pressable>
      ) : completionPct != null && completionPct >= 100 ? (
        <View style={styles.readyRow}>
          <Ionicons name="checkmark-circle" size={18} color={colors.teal} />
          <Text style={styles.readyText}>Profile ready — you can apply with your CV</Text>
        </View>
      ) : null}

      {statsLoading ? (
        <View style={styles.statsLoading}>
          <ActivityIndicator size="small" color={colors.brand} />
          <Text style={styles.statsLoadingText}>Loading your stats…</Text>
        </View>
      ) : stats ? (
        <View style={styles.statsRow}>
          <MiniStat label="Applications" value={stats.applied} onPress={onApplied} />
          <MiniStat label="Saved" value={stats.saved} onPress={onSaved} />
          <MiniStat label="Interviews" value={stats.interviews} onPress={onDashboard} />
        </View>
      ) : (
        <Pressable onPress={onDashboard} style={styles.statsFallback} accessibilityRole="button">
          <Text style={styles.statsFallbackText}>Open dashboard for full stats & trends →</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 16,
  },
  greeting: {
    fontSize: 24,
    fontFamily: fontFamily.bold,
    color: colors.navy,
    letterSpacing: -0.45,
  },
  sub: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: colors.textMuted,
    lineHeight: 20,
  },
  progressPress: { marginTop: 14 },
  barOuter: {
    height: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
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
  readyText: {
    flex: 1,
    fontSize: 13,
    fontFamily: fontFamily.medium,
    color: colors.textMarketing,
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  miniStat: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  miniVal: {
    fontSize: 19,
    fontFamily: fontFamily.bold,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  miniLab: {
    marginTop: 4,
    fontSize: 11,
    fontFamily: fontFamily.medium,
    color: colors.textMuted,
    textAlign: "center",
  },
  statsLoading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 16,
    justifyContent: "center",
    paddingVertical: 12,
  },
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
  statsFallbackText: {
    fontSize: 14,
    fontFamily: fontFamily.semiBold,
    color: colors.textMarketing,
  },
});
