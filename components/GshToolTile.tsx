import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, feedCardStyle, fontFamily, radii } from "@/lib/theme";

type IonName = ComponentProps<typeof Ionicons>["name"];

const TILE_ACCENTS = {
  teal: { bg: colors.brandSoft, icon: colors.brandDeep },
  purple: { bg: "rgba(97, 10, 144, 0.1)", icon: colors.purple },
  ocean: { bg: "rgba(14, 116, 144, 0.1)", icon: "#0e7490" },
} as const;

export function GshToolTile({
  label,
  icon,
  accent,
  onPress,
}: {
  label: string;
  icon: IonName;
  accent: keyof typeof TILE_ACCENTS;
  onPress: () => void;
}) {
  const pal = TILE_ACCENTS[accent];
  return (
    <Pressable
      style={({ pressed }) => [styles.tile, feedCardStyle(), pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={[styles.iconWrap, { backgroundColor: pal.bg }]}>
        <Ionicons name={icon} size={24} color={pal.icon} />
      </View>
      <Text style={styles.label} numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    minWidth: "46%",
    maxWidth: "50%",
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: "center",
    borderRadius: radii.lg,
    gap: 10,
  },
  pressed: { opacity: 0.92 },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 13,
    fontFamily: fontFamily.semiBold,
    color: colors.navy,
    textAlign: "center",
    lineHeight: 17,
  },
});
