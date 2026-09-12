import type { ReactNode } from "react";
import { Image, Text, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { brandMarkLight } from "@/lib/brand-assets";
import { colors, fontFamily } from "@/lib/theme";

type Props = {
  children: ReactNode;
  variant?: "full" | "compact";
  style?: StyleProp<ViewStyle>;
  showWatermark?: boolean;
  showGlow?: boolean;
};

/** Solid navy hero band with a restrained cyan keyline. */
export function GshNavyHero({
  children,
  variant = "full",
  style,
  showWatermark = true,
  showGlow = true,
}: Props) {
  return (
    <View
      style={[styles.root, variant === "compact" ? styles.compact : styles.full, style]}
    >
      {showWatermark ? (
        <Text style={styles.watermark} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5} accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">MOVE</Text>
      ) : null}
      {showGlow ? (
        <View
          style={styles.accentRule}
          pointerEvents="none"
        />
      ) : null}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { overflow: "hidden", position: "relative", backgroundColor: colors.navy },
  full: { paddingBottom: 28, borderBottomRightRadius: 36 },
  compact: { paddingBottom: 16 },
  watermark: {
    position: "absolute",
    bottom: -12,
    left: 16,
    right: 16,
    fontFamily: fontFamily.headingStrong,
    fontSize: 96,
    letterSpacing: -6,
    color: colors.white,
    opacity: 0.055,
  },
  accentRule: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 0,
    backgroundColor: colors.teal,
    opacity: 0.75,
  },
  content: { position: "relative", zIndex: 1 },
});
