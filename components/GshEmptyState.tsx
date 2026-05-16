import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, feedCardStyle, fontFamily, radii } from "@/lib/theme";

type IonName = ComponentProps<typeof Ionicons>["name"];

export function GshEmptyState({
  icon,
  title,
  actionLabel,
  onAction,
}: {
  icon: IonName;
  title: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <View style={[styles.wrap, feedCardStyle()]}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={32} color={colors.brand} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Pressable style={styles.btn} onPress={onAction} accessibilityRole="button">
        <Text style={styles.btnText}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", paddingVertical: 28, paddingHorizontal: 20, marginBottom: 12 },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  title: {
    fontSize: 16,
    fontFamily: fontFamily.semiBold,
    color: colors.navy,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 22,
  },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: radii.pill,
    backgroundColor: colors.brand,
  },
  btnText: { fontSize: 15, fontFamily: fontFamily.bold, color: colors.navyDeep },
});
