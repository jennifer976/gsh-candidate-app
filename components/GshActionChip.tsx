import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, feedCardStyle, fontFamily, radii } from "@/lib/theme";

type IonName = ComponentProps<typeof Ionicons>["name"];

export function GshActionChip({
  label,
  icon,
  count,
  onPress,
}: {
  label: string;
  icon: IonName;
  count?: number;
  onPress: () => void;
}) {
  const showBadge = typeof count === "number" && count > 0;

  return (
    <Pressable
      style={({ pressed }) => [styles.chip, feedCardStyle(), pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={showBadge ? `${label}, ${count}` : label}
    >
      <Ionicons name={icon} size={18} color={colors.brandDeep} />
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      {showBadge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count > 99 ? "99+" : count}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: radii.lg,
  },
  pressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  label: { fontSize: 13, fontFamily: fontFamily.semiBold, color: colors.navy },
  badge: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { fontSize: 11, fontFamily: fontFamily.bold, color: colors.navyDeep },
});
