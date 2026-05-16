import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { brandMarkLight } from "@/lib/brand-assets";
import { colors, gradient } from "@/lib/theme";

type Props = {
  children: ReactNode;
  variant?: "full" | "compact";
  style?: StyleProp<ViewStyle>;
  showWatermark?: boolean;
  showGlow?: boolean;
};

/** Navy hero band aligned with the marketing site header gradients. */
export function GshNavyHero({
  children,
  variant = "full",
  style,
  showWatermark = true,
  showGlow = true,
}: Props) {
  return (
    <LinearGradient
      colors={[colors.navy, colors.navyDeep]}
      style={[styles.root, variant === "compact" ? styles.compact : styles.full, style]}
    >
      {showWatermark ? (
        <Image
          source={brandMarkLight}
          style={styles.watermark}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
          accessibilityElementsHidden
          importantForAccessibility="no"
        />
      ) : null}
      {showGlow ? (
        <LinearGradient
          colors={[...gradient.cyanGlow]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.glow}
          pointerEvents="none"
        />
      ) : null}
      <View style={styles.content}>{children}</View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { overflow: "hidden", position: "relative" },
  full: { paddingBottom: 24 },
  compact: { paddingBottom: 16 },
  watermark: {
    position: "absolute",
    top: -48,
    right: -72,
    width: 280,
    height: 280,
    opacity: 0.08,
  },
  glow: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 88,
  },
  content: { position: "relative", zIndex: 1 },
});
