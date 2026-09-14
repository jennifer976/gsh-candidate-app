import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { StyleSheet, Text, View } from "react-native";
import { GshPressable } from "@/components/GshPressable";
import { colors, fontFamily } from "@/lib/theme";

type IonName = ComponentProps<typeof Ionicons>["name"];

type Props = {
  icon: IonName;
  onPress: () => void;
  accessibilityLabel: string;
  /** Unread count — shows a cyan pill when > 0. */
  badgeCount?: number;
  tone?: "light" | "navy";
};

function badgeLabel(n: number): string {
  return n > 99 ? "99+" : String(n);
}

/** App-chrome icon with optional unread badge (Home / tab headers). */
export function GshChromeIconButton({
  icon,
  onPress,
  accessibilityLabel,
  badgeCount = 0,
  tone = "light",
}: Props) {
  const navy = tone === "navy";
  const showBadge = badgeCount > 0;

  return (
    <GshPressable
      onPress={onPress}
      style={[styles.btn, navy ? styles.btnNavy : styles.btnLight]}
      accessibilityRole="button"
      accessibilityLabel={
        showBadge ? `${accessibilityLabel}, ${badgeCount} unread` : accessibilityLabel
      }
      pressScale={0.92}
    >
      <Ionicons
        name={icon}
        size={22}
        color={navy ? "rgba(255,255,255,0.92)" : colors.navy}
      />
      {showBadge ? (
        <View
          style={[styles.badge, navy ? styles.badgeOnNavy : styles.badgeOnLight]}
          accessibilityElementsHidden
        >
          <Text style={styles.badgeText}>{badgeLabel(badgeCount)}</Text>
        </View>
      ) : null}
    </GshPressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  btnLight: {
    backgroundColor: colors.white,
  },
  btnNavy: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  badge: {
    position: "absolute",
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: colors.cyan,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  badgeOnLight: { borderColor: colors.white },
  badgeOnNavy: { borderColor: colors.navy },
  badgeText: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
    color: colors.navy,
    letterSpacing: -0.2,
  },
});
