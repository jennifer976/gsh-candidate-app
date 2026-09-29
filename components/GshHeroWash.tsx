import type { ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

type Tone = "light" | "brand";

/** Flat wash for tab heroes. Brand tone is solid cyan, light tone is white. */
export function GshHeroWash({
  children,
  style,
  tone = "light",
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  tone?: Tone;
}) {
  return (
    <View style={[styles.wash, tone === "brand" ? styles.brand : styles.light, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wash: {
    width: "100%",
  },
  brand: { backgroundColor: "#42e0e3" },
  light: { backgroundColor: "#ffffff" },
});
