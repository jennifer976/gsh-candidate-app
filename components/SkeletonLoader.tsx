import { useEffect } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { colors } from "@/lib/theme";

type SkeletonBoxProps = {
  width?: number | string;
  height?: number;
  radius?: number;
  style?: ViewStyle;
};

/**
 * A single shimmer bone. Wrap multiple in a SkeletonCard for a full loading state.
 */
export function SkeletonBox({ width = "100%", height = 16, radius = 8, style }: SkeletonBoxProps) {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 1], [0.5, 1]),
  }));

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius: radius,
          backgroundColor: colors.border,
        },
        animStyle,
        style,
      ]}
    />
  );
}

/** Full job card skeleton — matches HubJobCard layout */
export function JobCardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <SkeletonBox width={48} height={48} radius={13} />
        <View style={styles.midCol}>
          <SkeletonBox width="75%" height={15} radius={6} />
          <SkeletonBox width="50%" height={12} radius={5} style={{ marginTop: 8 }} />
          <SkeletonBox width="40%" height={10} radius={5} style={{ marginTop: 6 }} />
          <View style={styles.chipRow}>
            <SkeletonBox width={90} height={20} radius={99} />
            <SkeletonBox width={72} height={20} radius={99} />
          </View>
        </View>
      </View>
      <View style={styles.footer}>
        <SkeletonBox width={90} height={13} radius={5} />
        <SkeletonBox width={60} height={13} radius={5} />
      </View>
    </View>
  );
}

/** Guide card skeleton */
export function GuideCardSkeleton() {
  return (
    <View style={styles.guideCard}>
      <SkeletonBox width={46} height={46} radius={12} />
      <View style={styles.guideBody}>
        <SkeletonBox width="65%" height={14} radius={5} />
        <SkeletonBox width="90%" height={11} radius={5} style={{ marginTop: 7 }} />
        <SkeletonBox width="60%" height={11} radius={5} style={{ marginTop: 4 }} />
        <SkeletonBox width={50} height={11} radius={5} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  topRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  midCol: { flex: 1, gap: 0 },
  chipRow: { flexDirection: "row", gap: 6, marginTop: 10 },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  guideCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    gap: 14,
    alignItems: "flex-start",
  },
  guideBody: { flex: 1 },
});
