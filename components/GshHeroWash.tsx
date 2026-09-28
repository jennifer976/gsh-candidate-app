import type { ReactNode } from "react";
import { StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

type Tone = "light" | "brand";

/** Soft wash for tab heroes. `brand` = cyan→navy mist so Home reads as GSH. */
export function GshHeroWash({
  children,
  style,
  tone = "light",
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  tone?: Tone;
}) {
  // Glassdoor-style mint hero — brighter cyan mist so Home feels branded.
  const colors =
    tone === "brand"
      ? (["#7ae8eb", "#b3f2f4", "#e8fafb", "#f4f7fb"] as const)
      : (["#f6f9fc", "#f8fbfd", "#ffffff"] as const);

  return (
    <LinearGradient
      colors={[...colors]}
      locations={tone === "brand" ? [0, 0.35, 0.72, 1] : [0, 0.55, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={[styles.wash, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wash: {
    width: "100%",
  },
});
