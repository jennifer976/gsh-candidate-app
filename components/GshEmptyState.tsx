import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { brandMark } from "@/lib/brand-assets";
import { colors, feedCardStyle, fontFamily, radii } from "@/lib/theme";

type IonName = ComponentProps<typeof Ionicons>["name"];

export function GshEmptyState({
  icon,
  title,
  actionLabel,
  onAction,
  /** Prefer the GSH hub mark for brand-led empty surfaces. */
  useBrandMark = false,
}: {
  icon: IonName;
  title: string;
  actionLabel: string;
  onAction: () => void;
  useBrandMark?: boolean;
}) {
  return (
    <View style={[styles.wrap, feedCardStyle()]}>
      <View style={styles.iconCircle}>
        {useBrandMark ? (
          <Image
            source={brandMark}
            style={styles.mark}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
          />
        ) : (
          <Ionicons name={icon} size={32} color={colors.navy} />
        )}
      </View>
      <Text style={styles.title}>{title}</Text>
      <Pressable style={styles.btn} onPress={onAction} accessibilityRole="button">
        <Text style={styles.btnText}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", paddingVertical: 28, paddingHorizontal: 20 },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  mark: { width: 40, height: 40 },
  title: {
    fontSize: 16,
    fontFamily: fontFamily.semiBold,
    color: colors.navy,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 22,
  },
  btn: {
    minHeight: 44,
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: radii.pill,
    backgroundColor: colors.navy,
  },
  btnText: { fontSize: 15, fontFamily: fontFamily.bold, color: colors.white },
});
